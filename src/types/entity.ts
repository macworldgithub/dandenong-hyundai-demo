export interface EntityAddress {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface Entity {
  _id: string;
  name: string;
  abn: string;
  address: EntityAddress;
  isLocked: boolean;
  activePeriod?: string | { _id: string; code: string; status: string };
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}
