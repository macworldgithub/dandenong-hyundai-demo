import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { drillAccountApi } from '../../api/gl';
import { formatDate } from '../../lib/dates';
import { formatAUD } from '../../lib/money';

interface AccountDrillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string | null;
  periodId?: string;
}

export const AccountDrillDrawer: React.FC<AccountDrillDrawerProps> = ({
  isOpen,
  onClose,
  accountId,
  periodId,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && accountId) {
      setIsLoading(true);
      drillAccountApi(accountId, { periodId })
        .then((res) => setData(res))
        .catch((err) => console.error('Failed to drill account:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, accountId, periodId]);

  if (!accountId) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={data?.account ? `${data.account.code} — ${data.account.name}` : 'Account Ledger Drill'}
      subtitle={`Journal entries posting to department: ${data?.account?.department || 'Admin'}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Ledger Summary Card */}
        {data && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#f6f6f3] rounded-none border border-[#deded9] text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">Total Debits</span>
              <span className="font-mono font-bold text-[#252525] text-sm">
                {formatAUD(data.totalDebitCents || 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">Total Credits</span>
              <span className="font-mono font-bold text-[#252525] text-sm">
                {formatAUD(data.totalCreditCents || 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">Net Balance</span>
              <span className="font-mono font-bold text-[#2936ff] text-sm">
                {formatAUD(data.netCents || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Journal Entries List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#252525]">
            <span>Posted Journal Entries ({data?.entries?.length || 0})</span>
            <span className="text-[11px] text-[#858580] font-normal">
              Chronological ledger postings
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-[#858580]">Loading account postings...</div>
          ) : data?.entries?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source / Ref</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((entry: any) => {
                  const matchingLine = entry.lines?.find(
                    (l: any) => l.accountId === accountId || l.accountId?._id === accountId
                  );

                  return (
                    <TableRow key={entry._id}>
                      <TableCell className="font-mono text-xs text-[#858580] whitespace-nowrap">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#2936ff]">
                        {entry.sourceRef || entry.source}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-[#252525]">{entry.narration}</div>
                        {matchingLine?.vin && (
                          <div className="text-[10px] font-mono text-[#858580]">
                            VIN: {matchingLine.vin}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyCell cents={matchingLine?.debitCents || 0} />
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyCell cents={matchingLine?.creditCents || 0} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-[#858580] bg-[#f6f6f3] rounded-none border border-[#deded9]">
              No journal entries posted to this account in the selected period.
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
