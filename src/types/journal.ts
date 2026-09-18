import { Account, Department } from './account';
import { User } from './user';
import { Period } from './period';

export type JournalSource = 'bank' | 'ap' | 'deal' | 'manual' | 'floorplan';

export interface JournalLine {
  _id?: string;
  accountId: string | Account;
  debitCents: number;
  creditCents: number;
  department?: Department;
  vin?: string;
  dealId?: string;
  supplierId?: string;
}

export interface JournalEntry {
  _id: string;
  periodId: string | Period;
  date: string;
  source: JournalSource;
  sourceRef?: string;
  narration: string;
  isReversal: boolean;
  reversalOf?: string;
  postedBy?: string | User;
  postedAt: string;
  lines: JournalLine[];
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}
