interface Owner {
  id: string;
  addressXRPL: string;
  firstName: string;
  lastName: string;
}

type ParcelType = "mintable" | "minted_buyable" | "invalid" | "minted";

interface LegalDocuments {
  id: string;
  name: string;
  uri?: string;
}

interface Parcel {
  id: string;
  name: string;
  cadastreRef: string;
  cadastreId: string;
  legalDocuments: LegalDocuments;
  claimableCarbon: number;
  carbonRewardRate: number;
  sellPrice: number;
  mapTillerId: string;
  nftId: string;
  price: number;
  owner: Owner;
  type: ParcelType;
  invalidReason?: string;
  lockedUntil?: number;
}
