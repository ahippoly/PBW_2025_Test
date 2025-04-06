/**
 * Creates a parcel object with the specified type and properties
 */
function createParcel(type: ParcelType, mapTillerId: string, name: string, ownerAddressXRPL: string = "1"): Parcel {
  return {
    id: mapTillerId, // Use mapTillerId as the id for simplicity
    mapTillerId,
    nftId: "1",
    price: type === "mintable" ? 0 : 234,
    owner: {
      id: "1",
      addressXRPL: ownerAddressXRPL,
      firstName: "John",
      lastName: "Doe",
    },
    cadastreId: "1",
    cadastreRef: "1",
    name,
    carbonRewardRate: 10,
    claimableCarbon: 100,
    legalDocuments: {
      id: "1",
      name: "OAJRFJ",
    },
    sellPrice: 100,
    type,
    ...(type === "minted" && { lockedUntil: 1717708800 }),
  };
}

// Single array of all parcels
export const allParcels: Parcel[] = [
  // Invalid parcels
  createParcel("invalid", "785900000A0061", "Terrain INVALIDE"),

  // Mintable parcels
  createParcel("mintable", "781280000A0076", "Terrain protege"),

  // Minted parcels
  createParcel("minted", "781280000B0654", "Foret de la Forêt"),

  // Buyable parcels
  createParcel("minted_buyable", "781280000B0275", "Terrain achetable miam"),
];

export default allParcels;
