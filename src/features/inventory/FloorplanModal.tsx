import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { getFloorplanApi } from '../../api/inventory';
import { FloorplanDraw } from '../../types/inventory';
import { formatAUD } from '../../lib/money';
import { formatDate } from '../../lib/dates';

interface FloorplanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 10;

export const FloorplanModal: React.FC<FloorplanModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setIsLoading(true);
      getFloorplanApi()
        .then((res) => setData(res))
        .catch((err) => console.error('Failed to load floorplan:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const activeDraws = data?.activeDraws || [];
  const totalPages = Math.max(1, Math.ceil(activeDraws.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedDraws = useMemo(
    () => activeDraws.slice(pageStart, pageStart + PAGE_SIZE),
    [activeDraws, pageStart],
  );
  const showingStart = activeDraws.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(page * PAGE_SIZE, activeDraws.length);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Floorplan Facility & Wholesale Draws"
      subtitle="Hyundai Capital floorplan facility lines and vehicle-level interest accruals"
      maxWidth="3xl"
    >
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
              Active Unit Draws ({activeDraws.length || 0} Vehicles)
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
                Showing {showingStart}-{showingEnd} of {activeDraws.length}
                {activeDraws.length > PAGE_SIZE ? ` · Page ${page} of ${totalPages}` : ''}
              </span>
              {activeDraws.length > PAGE_SIZE && (
                <>
                  <button className="desk-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </button>
                  <button className="desk-button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    Next
                  </button>
                </>
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
