import { Account, Department } from './account';

export type SupplierCategory = 'oem' | 'transport' | 'accessories' | 'recon' | 'parts' | 'equipment' | 'utilities' | 'government' | 'insurance' | 'advertising' | 'software' | 'professional' | 'financier';

export interface Supplier {
  _id: string;
  name: string;
  abn: string;
  category: SupplierCategory;
  defaultAccountId?: string | Account;
  paymentTerms: number;
  bankDetails?: {
    bsb: string;
    accountNumber: string;
    accountName: string;
  };
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceLine {
  _id?: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  accountId?: string | Account;
  department?: Department;
}

export interface ExtractionField {
  name: string;
  value: string;
  confidence: number;
}

export type ApExceptionType = 'price_variance' | 'quantity_variance' | 'duplicate' | 'missing_po' | 'other';
export type ApExceptionStatus = 'open' | 'resolved' | 'waived';

export interface ApException {
  _id: string;
  type: ApExceptionType;
  description: string;
  expectedCents?: number;
  actualCents?: number;
  varianceCents?: number;
  status: ApExceptionStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

export type ApInvoiceStatus = 'captured' | 'coded' | 'matched' | 'exception' | 'approved' | 'paid';

export interface ApInvoice {
  _id: string;
  supplierId: string | Supplier;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  subtotalCents: number;
  gstCents: number;
  grossCents: number;
  status: ApInvoiceStatus;
  extraction?: {
    confidence: number;
    fields: ExtractionField[];
  };
  poId?: string;
  vin?: string;
  exceptions: ApException[];
  journalEntryId?: string;
  paidInRunId?: string;
  approvedBy?: string[];
  fileName?: string;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentRunStatus = 'draft' | 'approved' | 'paid';

export interface PaymentRun {
  _id: string;
  periodId: string;
  createdBy: string;
  invoiceIds: string[] | ApInvoice[];
  totalCents: number;
  status: PaymentRunStatus;
  abaFileRef?: string;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApAgeingBucket {
  supplierId: string;
  supplierName: string;
  currentCents: number;
  days30Cents: number;
  days60Cents: number;
  days90PlusCents: number;
  totalCents: number;
}

export interface ApAgeingSummary {
  buckets: ApAgeingBucket[];
  totals: {
    currentCents: number;
    days30Cents: number;
    days60Cents: number;
    days90PlusCents: number;
    totalCents: number;
  };
  glControlBalanceCents: number;
  varianceCents: number;
}
