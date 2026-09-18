import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { getRecPackApi } from '../../api/bank';
import { ReconciliationPack } from '../../types/bank';
import { formatAUD } from '../../lib/money';
import { formatDate } from '../../lib/dates';

interface RecPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccountId: string;
  periodId?: string;
}

export const RecPackModal: React.FC<RecPackModalProps> = ({
  isOpen,
  onClose,
  bankAccountId,
  periodId,
}) => {
  const [pack, setPack] = useState<ReconciliationPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bankAccountId) {
      setIsLoading(true);
      getRecPackApi(bankAccountId, periodId)
        .then((res) => setPack(res.recPack))
        .catch((err) => console.error('Failed to generate rec pack:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, bankAccountId, periodId]);

  const handleExportJson = () => {
    if (!pack) return;
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bank_Rec_Pack_${formatDate(pack.generatedAt).replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bank Reconciliation Pack"
      subtitle="Auditable monthly cash pack reconciling Book balance to Statement balance"
      maxWidth="2xl"
    >
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#858580]">
          Calculating book ledger vs electronic statement...
        </div>
      ) : pack ? (
        <div className="space-y-6">
          {/* Top Status Card */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-none bg-[#f6f6f3] border border-[#deded9]">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">
                GL Book Balance
              </span>
              <span className="text-base font-bold font-mono text-[#252525]">
                {formatAUD(pack.bookBalanceCents)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">
                Statement Balance
              </span>
              <span className="text-base font-bold font-mono text-[#2936ff]">
                {formatAUD(pack.statementBalanceCents)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">
                Reconciliation Difference
              </span>
              <span
                className={`text-base font-bold font-mono ${
                  pack.differenceCents === 0 ? 'text-[#217454]' : 'text-[#b92b24]'
                }`}
              >
                {formatAUD(pack.differenceCents)}
              </span>
            </div>
          </div>

          {/* Equilibrium Confirmation */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-none flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#217454]">
              <CheckCircle2 className="w-4 h-4 text-[#217454] shrink-0" />
              <span>
                {pack.differenceCents === 0 ? 'Statement reconciled: book cash equals statement balance plus outstanding items.' : 'A reconciliation difference remains. Review outstanding items before sign-off.'}
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-[#217454]">DIFF: {formatAUD(pack.differenceCents)}</span>
          </div>

          {/* Outstanding Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#252525]">
              <span>Outstanding Items ({pack.outstandingItems?.length || 0})</span>
              <span className="text-[11px] text-[#858580] font-normal">Unmatched & parked transactions</span>
            </div>

            {pack.outstandingItems && pack.outstandingItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pack.outstandingItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs text-[#858580]">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell className="text-xs text-[#252525]">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[#858580] capitalize">
                        {item.type.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyCell cents={item.amountCents} colored />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-xs text-[#858580] bg-[#f6f6f3] rounded-none border border-[#deded9]">
                Zero outstanding items in this statement period.
              </div>
            )}
          </div>

          {/* Footer with JSON Export */}
          <div className="pt-4 border-t border-[#deded9] flex items-center justify-between">
            <span className="text-[11px] text-[#858580]">
              Pack generated {formatDate(pack.generatedAt)}
            </span>
            <Button variant="primary" size="sm" onClick={handleExportJson}>
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Rec Pack (JSON)</span>
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
