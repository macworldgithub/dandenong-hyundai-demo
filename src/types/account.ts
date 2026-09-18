import { Period } from './period';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type Department = 'New' | 'Used' | 'Service' | 'Parts' | 'F&I' | 'Admin';

export interface Account {
  _id: string;
  code: string;
  name: string;
  type: AccountType;
  department: Department;
  isControl: boolean;
  controlFor?: string;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  type: AccountType;
  department: Department;
  isControl: boolean;
  controlFor?: string;
  totalDebitCents: number;
  totalCreditCents: number;
  netDebitCents: number;
  netCreditCents: number;
}

export interface TrialBalanceResponse {
  period: Period;
  department?: Department;
  accounts: TrialBalanceRow[];
  totalDebitCents: number;
  totalCreditCents: number;
  differenceCents: number;
  isBalanced: boolean;
}
