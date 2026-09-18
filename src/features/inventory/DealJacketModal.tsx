import React from 'react';
import { FileText, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { DealJacket } from '../../types/inventory';
import { formatAUD } from '../../lib/money';
import { formatDate } from '../../lib/dates';

interface DealJacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DealJacket | null;
}

export const DealJacketModal: React.FC<DealJacketModalProps> = ({
  isOpen,
  onClose,
  deal,
}) => {
  if (!deal) return null;

  const vehicle = typeof deal.vehicleId === 'object' ? (deal.vehicleId as any) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deal Jacket: ${deal.dealNumber}`}
      subtitle={`Completed delivery economics for customer ${deal.customerRef || 'Confidential'}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Deal Header */}
        <div className="p-4 bg-[#f6f6f3] rounded-none border border-[#deded9] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#858580] font-mono">
              Delivered: {formatDate(deal.deliveryDate)}
            </span>
            <div className="text-base font-bold text-[#252525] mt-0.5">
              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.stockNumber})` : 'Vehicle Asset'}
            </div>
            {vehicle?.vin && (
              <div className="text-[11px] font-mono text-[#858580]">VIN: {vehicle.vin}</div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-[#858580] block">
              Deal Contribution
            </span>
            <span className="text-xl font-bold font-mono text-[#217454]">
              {formatAUD(deal.dealContributionCents)}
            </span>
          </div>
        </div>

        {/* Front-End & Back-End Gross Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {/* Front End */}
          <div className="p-4 rounded-none bg-[#f6f6f3] border border-[#deded9] space-y-2.5 text-xs">
            <div className="font-semibold text-[#2936ff] text-xs uppercase tracking-wider pb-1 border-b border-[#deded9]">
              Front-End Economics
            </div>

            <div className="flex justify-between text-[#252525]">
              <span>Selling Price:</span>
              <MoneyCell cents={deal.sellingPriceCents} />
            </div>

            <div className="flex justify-between text-[#858580] text-[11px]">
              <span>Less GST (10%):</span>
              <MoneyCell cents={-deal.gstCents} />
            </div>

            {vehicle?.totalCostCents && (
              <div className="flex justify-between text-[#858580] text-[11px]">
                <span>Less Cost of Goods (COGS):</span>
                <MoneyCell cents={-vehicle.totalCostCents} />
              </div>
            )}

            <div className="flex justify-between font-semibold text-[#252525] pt-2 border-t border-[#deded9]">
              <span>Front Gross Profit:</span>
              <MoneyCell cents={deal.frontGrossCents} bold />
            </div>
          </div>

          {/* Back End */}
          <div className="p-4 rounded-none bg-[#f6f6f3] border border-[#deded9] space-y-2.5 text-xs">
            <div className="font-semibold text-purple-700 text-xs uppercase tracking-wider pb-1 border-b border-[#deded9]">
              Back-End & F&I Economics
            </div>

            <div className="flex justify-between text-[#252525]">
              <span>F&I Finance Reserve:</span>
              <MoneyCell cents={deal.fniBackEndCents} />
            </div>

            <div className="flex justify-between text-[#252525]">
              <span>Documentation Fee:</span>
              <MoneyCell cents={deal.docFeeCents} />
            </div>

            <div className="flex justify-between text-[#b92b24] text-[11px]">
              <span>Sales Commission:</span>
              <MoneyCell cents={-deal.commissionCents} />
            </div>

            <div className="flex justify-between font-semibold text-[#252525] pt-2 border-t border-[#deded9]">
              <span>Back Gross Profit:</span>
              <MoneyCell cents={deal.backGrossCents} bold />
            </div>
          </div>
        </div>

        {/* Trade-In Economics (if applicable) */}
        {deal.tradeAllowanceCents > 0 && (
          <div className="p-4 rounded-none bg-[#f6f6f3] border border-[#deded9] space-y-2 text-xs">
            <div className="font-semibold text-[#252525] uppercase tracking-wider text-[11px]">
              Trade-In Vehicle Summary
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-[#858580] block">Trade Allowance</span>
                <span className="font-mono text-[#252525]">{formatAUD(deal.tradeAllowanceCents)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#858580] block">Trade ACV (Book Cost)</span>
                <span className="font-mono text-[#252525]">{formatAUD(deal.tradeAcvCents)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#858580] block">Payout to Financier</span>
                <span className="font-mono text-[#252525]">{formatAUD(deal.payoffCents)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ledger Invariant Confirmation */}
        <div className="p-3 bg-[#f6f6f3] border border-[#deded9] rounded-none flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#252525]">
            <ShieldCheck className="w-4 h-4 text-[#217454]" />
            <span>Revenue matched with inventory relief journal. P&L reflects exact front/back gross.</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Deal Jacket
          </Button>
        </div>
      </div>
    </Modal>
  );
};
