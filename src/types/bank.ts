import { Account } from './account';

export type BankAccountType = 'operating' | 'trust' | 'deposits';
export type BankTxnStatus = 'unmatched' | 'suggested' | 'matched' | 'parked' | 'split';
export type BankTxnDirection = 'debit' | 'credit';

export interface BankAccount {
  _id: string;
  name: string;
  bsb: string;
  accountNumber: string;
  type: BankAccountType;
  glAccountId: string | Account;
  openingBalanceCents: number;
  currentBalanceCents?: number;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAllocation {
  _id?: string;
  amountCents: number;
  accountId?: string | Account;
  dealId?: string;
  vin?: string;
  supplierId?: string;
  note?: string;
}

export interface BankTransaction {
  _id: string;
  statementId: string;
  bankAccountId: string | BankAccount;
  date: string;
  description: string;
  amountCents: number;
  direction: BankTxnDirection;
  status: BankTxnStatus;
  matchConfidence?: number;
  matchType?: string;
  allocations: BankAllocation[];
  journalEntryId?: string;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankStatement {
  _id: string;
  bankAccountId: string | BankAccount;
  periodId: string;
  fileName: string;
  importedAt: string;
  openingBalanceCents: number;
  closingBalanceCents: number;
  lineCount: number;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutstandingItem {
  description: string;
  amountCents: number;
  date: string;
  type: string;
}

export interface ReconciliationPack {
  _id: string;
  bankAccountId: string | BankAccount;
  periodId: string;
  bookBalanceCents: number;
  statementBalanceCents: number;
  outstandingItems: OutstandingItem[];
  differenceCents: number;
  generatedAt: string;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}
