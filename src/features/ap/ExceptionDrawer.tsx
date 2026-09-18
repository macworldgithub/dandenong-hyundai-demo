import React, { useState } from 'react';
import { AlertTriangle, Check, ShieldCheck, FileWarning } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { ApInvoice } from '../../types/ap';
import { resolveExceptionApi } from '../../api/ap';
import { formatAUD } from '../../lib/money';

interface ExceptionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ApInvoice | null;
  onSuccess: () => void;
}

export const ExceptionDrawer: React.FC<ExceptionDrawerProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!invoice) return null;

  const activeException = invoice.exceptions?.find((e) => e.status === 'open') || invoice.exceptions?.[0];

  const handleResolve = async (action: 'resolve' | 'waive') => {
    if (!activeException || !resolutionNote.trim()) { setError('Enter a resolution note before continuing.'); return; }
    setIsLoading(true);
    setError(null);

    try {
      await resolveExceptionApi(invoice._id, activeException._id, {
        action,
        resolution: resolutionNote,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to resolve exception');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="AP Exception Resolution"
      subtitle={`Review variance for invoice ${invoice.invoiceNumber}`}
      width="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-none text-xs text-[#b92b24]">
            {error}
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-4 rounded-none bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-700">
              {activeException?.type.replace('_', ' ').toUpperCase() || 'PRICE VARIANCE'}
            </h4>
            <p className="text-xs text-amber-700 mt-1">
              {activeException?.description || 'Invoice amount does not match approved purchase order.'}
            </p>
          </div>
        </div>

        {/* Variance Breakdown Figures */}
        {activeException && (
          <div className="grid grid-cols-3 gap-3 p-4 rounded-none bg-[#f6f6f3] border border-[#deded9] text-xs">
            <div>
              <span className="text-[10px] text-[#858580] uppercase tracking-wider block">Expected (PO)</span>
              <span className="font-mono font-semibold text-[#252525] text-sm">
                {formatAUD(activeException.expectedCents || 0)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#858580] uppercase tracking-wider block">Billed (Invoice)</span>
              <span className="font-mono font-semibold text-[#252525] text-sm">
                {formatAUD(activeException.actualCents || 0)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#858580] uppercase tracking-wider block">Variance Amount</span>
              <span className="font-mono font-semibold text-[#b92b24] text-sm">
                +{formatAUD(activeException.varianceCents || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Controller Resolution Note Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#252525] uppercase tracking-wider">
            Audit Trail Resolution Note
          </label>
          <textarea
            rows={3}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            className="w-full p-3 text-xs bg-[#f6f6f3] border border-[#deded9] rounded-none text-[#252525] placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Document reason for approval or resolution..."
          />
          <p className="text-[11px] text-[#858580]">
            This justification is permanently bound to the immutable audit log.
          </p>
        </div>

        {/* Resolution Actions */}
        <div className="pt-4 border-t border-[#deded9] flex justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResolve('waive')}
            isLoading={isLoading}
          >
            <span>Waive & Accept Variance</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleResolve('resolve')}
            isLoading={isLoading}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Approve & Clear Exception</span>
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
