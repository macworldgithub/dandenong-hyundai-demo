import React from 'react';
import { Car, Plus, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Vehicle } from '../../types/inventory';
import { formatAUD } from '../../lib/money';
import { formatDate } from '../../lib/dates';

interface VinCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onOpenAddCostLine: (vehicle: Vehicle) => void;
}

export const VinCardModal: React.FC<VinCardModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onOpenAddCostLine,
}) => {
  if (!vehicle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Stock: ${vehicle.stockNumber} (${vehicle.model})`}
      subtitle={vehicle.csvDescription || vehicle.variant}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Vehicle Header Card */}
        <div className="p-4 bg-[#f6f6f3] rounded-none border border-[#deded9] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#252525]">
                {vehicle.model} {vehicle.csvDescription || vehicle.variant || ''}
              </span>
              <span className="text-xs">{vehicle.sourceStatus}</span>
            </div>
            <div className="text-xs font-mono text-[#858580] mt-1">
              Stock: <span className="text-[#2936ff]">{vehicle.stockNumber}</span> • VIN: {vehicle.vin}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-[#858580] block">
              Total Capitalized Cost
            </span>
            <span className="text-xl font-bold font-mono text-[#217454]">
              {formatAUD(vehicle.totalCostCents)}
            </span>
          </div>
        </div>

        {/* Structured fields supplied by the latest stock CSV files */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Stock no', vehicle.stockNumber],
            ['Age', vehicle.ageDays !== null && vehicle.ageDays !== undefined ? `${vehicle.ageDays} days` : '-'],
            ...(vehicle.class === 'used' ? [['Year', vehicle.year || '-']] : []),
            ['Carline', vehicle.model || '-'],
            ['Description', vehicle.csvDescription || vehicle.variant || '-'],
            ...(vehicle.registrationNumber?.trim() ? [['Reg no', vehicle.registrationNumber]] : []),
            ...(vehicle.odometerKm !== null && vehicle.odometerKm !== undefined ? [['Odometer', `${vehicle.odometerKm.toLocaleString()} km`]] : []),
            ['Colour', vehicle.colour || '-'],
            ['List price', formatAUD(vehicle.listPriceCents || 0)],
            ['Loc', vehicle.location || '-'],
            ...(vehicle.deal?.trim() ? [['Deal', vehicle.deal]] : []),
            ['Status', vehicle.sourceStatus || '-'],
            ['Open RO/PO', vehicle.openRoPo || '-'],
          ].map(([label, value]) => (
            <div key={String(label)} className="p-3 border border-[#deded9] bg-white min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-[#858580] block">{label}</span>
              <strong className="text-xs text-[#252525] break-words">{value}</strong>
            </div>
          ))}
        </div>

        {/* Cost Stack Waterfall */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#252525]">
            <span>Cost Stack Elements ({vehicle.costLines?.length || 0})</span>
            <span className="text-[11px] text-[#858580] font-normal">
              Holdbacks & OEM bonuses reduce vehicle inventory asset
            </span>
          </div>

          <div className="space-y-2">
            {vehicle.costLines?.map((cost, idx) => {
              const isNegative = cost.amountCents < 0;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-none bg-[#f6f6f3] border border-[#deded9] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f6f6f3] border border-[#deded9] flex items-center justify-center font-mono text-[11px] text-[#858580]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-[#252525] capitalize">
                        {cost.type.replace('_', ' ')}
                      </div>
                      {cost.sourceDocRef && (
                        <div className="text-[10px] font-mono text-[#858580]">
                          Ref: {cost.sourceDocRef}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <MoneyCell cents={cost.amountCents} bold />
                    {isNegative && (
                      <span className="text-[10px] text-[#217454] font-mono block">Cost Reduction</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action footer */}
        <div className="pt-4 border-t border-[#deded9] flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenAddCostLine(vehicle);
            }}
          >
            <Plus className="w-3.5 h-3.5 text-[#2936ff]" />
            <span>Add Recon / Sublet Cost Line</span>
          </Button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Close Card
          </Button>
        </div>
      </div>
    </Modal>
  );
};
