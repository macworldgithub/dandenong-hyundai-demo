import React from 'react';
import { KpiTileData } from '../../types/kpi';
import { cn } from '../../lib/cn';

interface KpiTileProps {
  kpi: KpiTileData;
  onClick?: () => void;
}

export const KpiTile: React.FC<KpiTileProps> = ({ kpi, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-300 rounded shadow-sm p-4 text-left hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
    >
      {/* Label */}
      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2 font-semibold leading-tight">
        {kpi.label}
      </div>

      {/* Value */}
      <div className="text-2xl font-bold text-gray-900 mb-2 tabular-nums">
        {kpi.formattedValue}
      </div>

      {/* Trend */}
      {kpi.trendPercentage !== undefined && (
        <div className={cn(
          'text-xs font-medium flex items-center gap-1',
          kpi.trendPercentage > 0 ? 'text-green-600' : 
          kpi.trendPercentage < 0 ? 'text-red-600' : 'text-gray-500'
        )}>
          <span>{kpi.trendPercentage > 0 ? '▲' : kpi.trendPercentage < 0 ? '▼' : '—'}</span>
          <span>{kpi.trendPercentage > 0 ? '+' : ''}{kpi.trendPercentage}%</span>
        </div>
      )}
    </button>
  );
};
