export type PeriodStatus = 'open' | 'closed';

export interface Period {
  _id: string;
  code: string; // YYYY-MM
  start: string;
  end: string;
  status: PeriodStatus;
  createdAt?: string;
  updatedAt?: string;
}
