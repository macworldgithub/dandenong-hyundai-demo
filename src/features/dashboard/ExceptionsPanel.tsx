import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronRight, Landmark, Receipt, ShieldAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExceptionsSummary } from '../../types/kpi';

interface ExceptionsPanelProps {
  exceptions?: ExceptionsSummary;
}

export const ExceptionsPanel: React.FC<ExceptionsPanelProps> = ({ exceptions }) => {
  const navigate = useNavigate();

  const total = exceptions?.totalExceptionsCount || 0;

  if (total === 0) {
    return (
      <Card variant="glass" className="border-emerald-900/40 bg-emerald-50 p-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-900/40 border border-emerald-700/60 flex items-center justify-center text-[#217454]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#252525]">Dealership Books in Equilibrium</h3>
            <p className="text-xs text-[#217454]/90 mt-0.5">
              Zero un-reconciled items. Bank matched, AP approved, and all control accounts balanced.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="border-amber-900/40 bg-amber-50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-amber-50 border border-amber-700/60 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#252525]">
              Controller Action Required ({total} Exceptions)
            </h3>
            <p className="text-xs text-amber-700">
              Items pending clearance before period end reconciliation
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Bank exceptions */}
        <div
          onClick={() => navigate('/bank')}
          className="p-3.5 rounded-none bg-[#f6f6f3] border border-[#deded9] hover:border-sky-500/40 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#f6f6f3] text-[#2936ff] group-hover:bg-sky-50 transition-colors">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#252525]">
                {exceptions?.unmatchedBankTxnsCount || 0} Unmatched Txns
              </div>
              <div className="text-[11px] text-[#858580]">Bank Desk match suggestions</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#858580] group-hover:text-[#2936ff] transition-colors" />
        </div>

        {/* AP exceptions */}
        <div
          onClick={() => navigate('/ap')}
          className="p-3.5 rounded-none bg-[#f6f6f3] border border-[#deded9] hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#f6f6f3] text-amber-700 group-hover:bg-amber-50 transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#252525]">
                {exceptions?.openApExceptionsCount || 0} Invoice Variances
              </div>
              <div className="text-[11px] text-[#858580]">Price & quantity mismatches</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#858580] group-hover:text-amber-700 transition-colors" />
        </div>

        {/* GL Control Rec exceptions */}
        <div
          onClick={() => navigate('/gl')}
          className="p-3.5 rounded-none bg-[#f6f6f3] border border-[#deded9] hover:border-rose-500/40 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#f6f6f3] text-[#b92b24] group-hover:bg-rose-50 transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#252525]">
                {exceptions?.unreconciledControlRecsCount || 0} Control Recs
              </div>
              <div className="text-[11px] text-[#858580]">Monthly sign-off templates</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#858580] group-hover:text-[#b92b24] transition-colors" />
        </div>
      </div>
    </Card>
  );
};
