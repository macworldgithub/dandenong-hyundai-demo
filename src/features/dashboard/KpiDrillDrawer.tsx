import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Layers, ArrowRight } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { MoneyCell } from '../../components/ui/MoneyCell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { drillKPIApi } from '../../api/dashboard';
import { formatDate } from '../../lib/dates';
import { KpiTileData } from '../../types/kpi';

interface KpiDrillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: KpiTileData | null;
  periodId?: string;
}

export const KpiDrillDrawer: React.FC<KpiDrillDrawerProps> = ({
  isOpen,
  onClose,
  kpi,
  periodId,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && kpi) {
      setIsLoading(true);
      drillKPIApi(kpi.key, periodId)
        .then((res) => setData(res))
        .catch((err) => console.error('Failed to load drill data:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, kpi, periodId]);

  if (!kpi) return null;

  const navigateToDesk = () => {
    onClose();
    switch (kpi.desk) {
      case 'bank':
        navigate('/bank');
        break;
      case 'ap':
        navigate('/ap');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'gl':
        navigate('/gl');
        break;
      default:
        break;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Drilldown: ${kpi.label}`}
      subtitle={`Source documents and ledger breakdown supporting ${kpi.formattedValue}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Metric summary banner */}
        <div className="p-4 bg-[#f6f6f3] rounded-none border border-[#deded9] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#858580] font-medium">Reported KPI Value</div>
            <div className="text-2xl font-bold font-mono text-[#252525]">{kpi.formattedValue}</div>
          </div>
          <Button variant="outline" size="sm" onClick={navigateToDesk} className="text-xs">
            <span>Open {kpi.desk.toUpperCase()} Desk</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Drill breakdown items */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#858580]">Loading sub-ledger drill...</div>
        ) : data && data.items && data.items.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#252525]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2936ff]" />
                <span>Supporting Items ({data.items.length})</span>
              </span>
              <span className="text-[11px] text-[#858580] font-normal">
                Double-click or open desk to view full audit record
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date / Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item: any, idx: number) => (
                  <TableRow key={item._id || idx}>
                    <TableCell className="font-mono text-xs font-semibold text-[#2936ff]">
                      {item.ref || item.vin || item.invoiceNumber || item.code || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-[#252525]">{item.description || item.name || item.narration}</div>
                      {item.date && (
                        <div className="text-[10px] text-[#858580] font-mono">{formatDate(item.date)}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.status ? <StatusBadge status={item.status} /> : <span className="text-[#858580]">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyCell cents={item.amountCents || item.totalCostCents || item.grossCents} bold />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#858580]">
            No individual line items found for this metric.
          </div>
        )}

        {/* Action footer */}
        <div className="pt-4 border-t border-[#deded9] flex items-center justify-between">
          <span className="text-[11px] text-[#858580]">
            All items trace directly to General Ledger journal entries.
          </span>
          <Button variant="primary" size="sm" onClick={navigateToDesk}>
            <span>View Full Sub-Ledger Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
