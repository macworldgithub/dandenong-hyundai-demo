import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { Account } from '../../types/account';
import { postManualJournalApi } from '../../api/gl';
import { formatAUD, toCents, sumCents } from '../../lib/money';

interface ManualJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodId: string;
  accounts: Account[];
  onSuccess: () => void;
}

interface JournalFormLine {
  accountId: string;
  department: string;
  debitDollars: string;
  creditDollars: string;
  vin: string;
}

export const ManualJournalModal: React.FC<ManualJournalModalProps> = ({
  isOpen,
  onClose,
  periodId,
  accounts,
  onSuccess,
}) => {
  const [narration, setNarration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<JournalFormLine[]>([
    { accountId: accounts[0]?._id || '', department: 'Admin', debitDollars: '', creditDollars: '', vin: '' },
    { accountId: accounts[1]?._id || '', department: 'Admin', debitDollars: '', creditDollars: '', vin: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDebitsCents = sumCents(lines.map((l) => toCents(l.debitDollars)));
  const totalCreditsCents = sumCents(lines.map((l) => toCents(l.creditDollars)));
  const differenceCents = totalDebitsCents - totalCreditsCents;
  const isBalanced = totalDebitsCents > 0 && differenceCents === 0;

  const handleAddLine = () => {
    setLines([
      ...lines,
      { accountId: accounts[0]?._id || '', department: 'Admin', debitDollars: '', creditDollars: '', vin: '' },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof JournalFormLine, value: string) => {
    const updated = [...lines];
    updated[index][field] = value;
    // If setting debit, clear credit and vice versa
    if (field === 'debitDollars' && value) updated[index].creditDollars = '';
    if (field === 'creditDollars' && value) updated[index].debitDollars = '';
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setError(`Journal must balance to zero. Difference: ${formatAUD(differenceCents)}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await postManualJournalApi({
        periodId,
        date,
        narration,
        lines: lines.map((l) => ({
          accountId: l.accountId,
          department: l.department,
          debitCents: toCents(l.debitDollars),
          creditCents: toCents(l.creditDollars),
          vin: l.vin || undefined,
        })),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to post manual journal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post Manual Journal Entry"
      subtitle="General ledger manual adjustment. Strict integer debit/credit balancing enforced."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-none text-xs text-[#b92b24]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Input
              label="Journal Date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Narration / Purpose"
              required
              placeholder="e.g. End of month workshop accrual adjustment..."
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
            />
          </div>
        </div>

        {/* Lines */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#858580]">
            <span>Journal Lines ({lines.length})</span>
            <span>Debit = Credit Rule Enforced</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded-none bg-[#f6f6f3] border border-[#deded9] text-xs"
              >
                <div className="col-span-5">
                  <select
                    value={line.accountId}
                    onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#f6f6f3] border border-[#deded9] rounded-none text-[#252525] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code} — {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <select
                    value={line.department}
                    onChange={(e) => handleLineChange(idx, 'department', e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#f6f6f3] border border-[#deded9] rounded-none text-[#252525] text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    {['Admin', 'New', 'Used', 'Service', 'Parts', 'F&I'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Debit ($)"
                    value={line.debitDollars}
                    onChange={(e) => handleLineChange(idx, 'debitDollars', e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#f6f6f3] border border-[#deded9] rounded-none text-[#252525] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Credit ($)"
                    value={line.creditDollars}
                    onChange={(e) => handleLineChange(idx, 'creditDollars', e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#f6f6f3] border border-[#deded9] rounded-none text-[#252525] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    disabled={lines.length <= 2}
                    className="p-1 text-[#858580] hover:text-[#b92b24] disabled:opacity-20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="xs" onClick={handleAddLine}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line</span>
          </Button>
        </div>

        {/* Balancing Totals */}
        <div className="p-3 bg-[#f6f6f3] rounded-none border border-[#deded9] flex items-center justify-between text-xs font-mono">
          <div className="space-x-4">
            <span className="text-[#858580]">Debits: {formatAUD(totalDebitsCents)}</span>
            <span className="text-[#858580]">Credits: {formatAUD(totalCreditsCents)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#858580] text-[11px]">Net Imbalance:</span>
            <span
              className={`font-bold ${
                isBalanced ? 'text-[#217454]' : 'text-amber-700'
              }`}
            >
              {formatAUD(differenceCents)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#deded9] flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs">
            {isBalanced ? (
              <CheckCircle2 className="w-4 h-4 text-[#217454]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-700" />
            )}
            <span className={isBalanced ? 'text-[#217454]' : 'text-amber-700'}>
              {isBalanced ? 'Entry balanced' : 'Debits must equal credits'}
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isLoading}
              disabled={!isBalanced || !narration.trim()}
            >
              Post to General Ledger
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
