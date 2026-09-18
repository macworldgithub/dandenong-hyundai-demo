import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { ControlRec } from '../../types/reconciliation';
import { completeControlRecApi } from '../../api/gl';
import { formatAUD } from '../../lib/money';
import { formatDate } from '../../lib/dates';

interface ControlRecModalProps {
  isOpen: boolean;
  onClose: () => void;
  rec: ControlRec | null;
  periodId?: string;
  onSuccess: () => void;
}

export const ControlRecModal: React.FC<ControlRecModalProps> = ({
  isOpen,
  onClose,
  rec,
  periodId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!rec) return null;

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeControlRecApi(rec.type, periodId);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to complete control rec:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isBalanced = rec.differenceCents === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Control Reconciliation: ${rec.type.replace(/_/g, ' ').toUpperCase()}`}
      subtitle="Monthly control account verification comparing GL balance to sub-ledger"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Balances card */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-none bg-[#f6f6f3] border border-[#deded9] text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#858580] block">
              General Ledger Control
            </span>
            <span className="text-base font-bold font-mono text-[#252525]">
              {formatAUD(rec.glBalanceCents)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-[#858580] block">
              Sub-Ledger Position
            </span>
            <span className="text-base font-bold font-mono text-[#2936ff]">
              {formatAUD(rec.subLedgerBalanceCents)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-[#858580] block">
              Variance Difference
            </span>
            <span
              className={`text-base font-bold font-mono ${
                isBalanced ? 'text-[#217454]' : 'text-[#b92b24]'
              }`}
            >
              {formatAUD(rec.differenceCents)}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div
          className={`p-4 rounded-none border flex items-center justify-between text-xs ${
            isBalanced
              ? 'bg-emerald-50 border-emerald-200 text-[#217454]'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isBalanced ? (
              <CheckCircle2 className="w-5 h-5 text-[#217454] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            )}
            <div>
              <div className="font-semibold">
                {isBalanced ? 'Equilibrium Confirmed' : 'Reconciling Items Pending'}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {isBalanced
                  ? 'Sub-ledger records balance to General Ledger control account to the exact cent.'
                  : 'An un-reconciled difference was detected. Review outstanding entries.'}
              </div>
            </div>
          </div>

          <span className="font-mono text-xs font-bold">
            DIFF: {formatAUD(rec.differenceCents)}
          </span>
        </div>

        {/* Reconciling items (if any) */}
        {rec.reconcilingItems && rec.reconcilingItems.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#252525]">Reconciling Items</span>
            <div className="space-y-1.5">
              {rec.reconcilingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#f6f6f3] rounded-none border border-[#deded9] flex justify-between items-center text-xs"
                >
                  <span className="text-[#252525]">{item.description}</span>
                  <MoneyCell cents={item.amountCents} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign-off footer */}
        <div className="pt-4 border-t border-[#deded9] flex items-center justify-between">
          <div className="text-[11px] text-[#858580] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#2936ff]" />
            <span>
              Status: <strong className="text-[#252525] capitalize">{rec.status}</strong>
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleComplete}
              isLoading={isLoading}
              disabled={rec.status === 'completed' || !isBalanced}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{rec.status === 'completed' ? 'Sign-Off Complete' : 'Sign-Off & Complete'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
