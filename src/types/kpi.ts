export interface KpiTileData {
  key: string;
  label: string;
  value: number; // in cents or count or days
  formattedValue: string;
  trendPercentage?: number;
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  desk: 'bank' | 'ap' | 'inventory' | 'gl';
}

export interface ExceptionsSummary {
  unmatchedBankTxnsCount: number;
  openApExceptionsCount: number;
  unreconciledControlRecsCount: number;
  totalExceptionsCount: number;
}

export interface DashboardResponse {
  periodCode: string;
  kpis: KpiTileData[];
  exceptions: ExceptionsSummary;
  facilityHeadroomCents: number;
  facilityLimitCents: number;
  sixMonthGrossTrend?: {
    labels: string[];
    series: { name: string; color: string; values: number[] }[];
  };
  departmentContributions?: { name: string; revenue: number; costs: number; net: number }[];
}
