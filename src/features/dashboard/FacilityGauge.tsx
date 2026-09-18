import React from 'react';
import { ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { formatAUD } from '../../lib/money';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface FacilityGaugeProps {
  headroomCents?: number;
  limitCents?: number;
}

export const FacilityGauge: React.FC<FacilityGaugeProps> = ({
  headroomCents = 580000000, // $5.8M
  limitCents = 1000000000,    // $10.0M facility limit
}) => {
  const navigate = useNavigate();
  const drawnCents = Math.max(0, limitCents - headroomCents);
  const utilizationPct = Math.min(100, Math.round((drawnCents / limitCents) * 100));

  let barColor = 'bg-sky-500';
  if (utilizationPct > 85) barColor = 'bg-rose-500';
  else if (utilizationPct > 70) barColor = 'bg-amber-500';

  return (
    <Card variant="glass" className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-sky-50 border border-sky-200 flex items-center justify-center text-[#2936ff]">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#252525]">Floorplan Facility Headroom</h3>
            <p className="text-xs text-[#858580]">
              Hyundai Capital Wholesale Finance Line
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => navigate('/inventory')}
          className="text-[11px]"
        >
          <span>Floorplan Desk</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-[#f6f6f3] rounded-full overflow-hidden border border-[#deded9] p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${utilizationPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-[#858580]">
          <span>Drawn: {utilizationPct}%</span>
          <span>Available Headroom: {100 - utilizationPct}%</span>
        </div>
      </div>

      {/* Figures breakdown */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#deded9] text-xs">
        <div>
          <span className="text-[10px] text-[#858580] uppercase tracking-wider block">Total Facility</span>
          <span className="font-mono font-semibold text-[#252525] text-sm">
            {formatAUD(limitCents)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#858580] uppercase tracking-wider block">Currently Drawn</span>
          <span className="font-mono font-semibold text-[#2936ff] text-sm">
            {formatAUD(drawnCents)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#858580] uppercase tracking-wider block">Remaining Headroom</span>
          <span className="font-mono font-semibold text-[#217454] text-sm">
            {formatAUD(headroomCents)}
          </span>
        </div>
      </div>
    </Card>
  );
};
