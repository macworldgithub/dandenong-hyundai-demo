export type ControlRecType =
  | 'cash_operating'
  | 'cash_trust'
  | 'ap'
  | 'inventory_new'
  | 'inventory_used'
  | 'floorplan'
  | 'customer_deposits'
  | 'gst';

export type ControlRecStatus = 'pending' | 'in_progress' | 'completed' | 'exception';

export interface ReconcilingItem {
  _id?: string;
  description: string;
  amountCents: number;
  identifiedAt?: string;
}

export interface ControlRec {
  _id: string;
  type: ControlRecType;
  periodId: string;
  glBalanceCents: number;
  subLedgerBalanceCents: number;
  reconcilingItems: ReconcilingItem[];
  differenceCents: number;
  status: ControlRecStatus;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
