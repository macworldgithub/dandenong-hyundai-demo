import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { getFloorplanApi } from '../../api/inventory';
import { FloorplanDraw } from '../../types/inventory';
import { formatAUD } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { Pagination } from '../../components/ui/Pagination';

interface FloorplanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 15;

export const FloorplanModal: React.FC<FloorplanModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (isOpen) {

      setIsLoading(true);
      setError('');
      getFloorplanApi(page)
        .then((res) => { if (!cancelled) setData(res); })
        .catch(() => { if (!cancelled) { setData(null); setError('Unable to load floorplan records. Close and reopen to retry.'); } })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    }
    return () => { cancelled = true; };
  }, [isOpen, page]);

  const activeDraws = data?.activeDraws || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedDraws = activeDraws;
  const showingStart = total ? pageStart + 1 : 0;
  const showingEnd = Math.min(page * PAGE_SIZE, total);
  useEffect(() => { if (!isOpen) { setPage(1); setData(null); } }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Floorplan Facility & Wholesale Draws"
      subtitle="Hyundai Capital floorplan facility lines and vehicle-level interest accruals"
      maxWidth="3xl"
    >
      {error && <p role="alert">{error}</p>}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#858580]">Loading wholesale lines...</div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-3 p-4 rounded-none bg-[#f6f6f3] border border-[#deded9] text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">Facility Limit</span>
              <span className="text-sm font-bold font-mono text-[#252525]">
                {formatAUD(data.facilityLimitCents || 1000000000)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">Total Drawn</span>
              <span className="text-sm font-bold font-mono text-[#2936ff]">{formatAUD(data.totalDrawnCents || 0)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">Interest Accrued</span>
              <span className="text-sm font-bold font-mono text-amber-700">
                {formatAUD(data.totalInterestCents || 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#858580] block">Available Headroom</span>
              <span className="text-sm font-bold font-mono text-[#217454]">{formatAUD(data.headroomCents || 0)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#252525]">
              Active Unit Draws ({total || 0} Vehicles)
            </div>

            <div className="max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Financier</TableHead>
                    <TableHead>Vehicle / VIN</TableHead>
                    <TableHead>Drawn Date</TableHead>
                    <TableHead className="text-right">Drawn Principal</TableHead>
                    <TableHead className="text-right">Interest Accrued</TableHead>
                    <TableHead className="text-right">Total Liability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedDraws.map((draw: FloorplanDraw) => {
                    const veh = typeof draw.vehicleId === 'object' ? (draw.vehicleId as any) : null;
                    const totalLiability = draw.drawnAmountCents + (draw.interestAccruedCents || 0);

                    return (
                      <TableRow key={draw._id}>
                        <TableCell className="font-semibold text-xs text-[#252525]">{draw.financier}</TableCell>
                        <TableCell>
                          <div className="text-xs text-[#252525]">
                            {veh ? `${veh.year || ''} ${veh.make || 'Hyundai'} ${veh.model}`.trim() : 'Vehicle'}
                          </div>
                          <div className="text-[10px] font-mono text-[#858580]">{veh?.vin || '-'}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#858580]">{formatDate(draw.drawnDate)}</TableCell>
                        <TableCell className="text-right">
                          <MoneyCell cents={draw.drawnAmountCents} />
                        </TableCell>
                        <TableCell className="text-right">
                          <MoneyCell cents={draw.interestAccruedCents} />
                        </TableCell>
                        <TableCell className="text-right">
                          <MoneyCell cents={totalLiability} bold />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="pagination">
              <span>
                Showing {showingStart}-{showingEnd} of {total}
                {total > PAGE_SIZE ? ` · Page ${page} of ${totalPages}` : ''}
              </span>
              {total > PAGE_SIZE && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={onClose}>
              Close Floorplan View
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
