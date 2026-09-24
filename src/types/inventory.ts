export type VehicleClass = 'new' | 'used' | 'demo';
export type VehicleStatus = 'in_transit' | 'in_stock' | 'allocated' | 'delivered';
export type CostLineType = 'invoice' | 'freight' | 'transport' | 'pdi' | 'recon' | 'accessories' | 'sublet' | 'holdback' | 'bonus' | 'other';

export interface CostLine {
  _id?: string;
  type: CostLineType;
  amountCents: number;
  sourceDocRef?: string;
  addedAt?: string;
}

export interface Vehicle {
  _id: string;
  vin: string;
  stockNumber: string;
  make: string;
  model: string;
  variant?: string;
  csvDescription?: string;
  registrationNumber?: string;
  odometerKm?: number | null;
  colour?: string;
  location?: string;
  listPriceCents: number;
  ageDays?: number | null;
  deal?: string;
  sourceStatus?: string;
  openRoPo?: string;
  csvSource?: string;
  year: number;
  class: VehicleClass;
  status: VehicleStatus;
  costLines: CostLine[];
  totalCostCents: number;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealJacket {
  _id: string;
  vehicleId: string | Vehicle;
  dealNumber: string;
  customerRef?: string;
  deliveryDate: string;
  sellingPriceCents: number;
  gstCents: number;
  tradeAllowanceCents: number;
  tradeAcvCents: number;
  payoffCents: number;
  fniBackEndCents: number;
  docFeeCents: number;
  commissionCents: number;
  frontGrossCents: number;
  backGrossCents: number;
  dealContributionCents: number;
  journalEntryId?: string;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FloorplanDraw {
  _id: string;
  vehicleId: string | Vehicle;
  financier: string;
  drawnAmountCents: number;
  drawnDate: string;
  interestAccruedCents: number;
  settledDate?: string;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}
