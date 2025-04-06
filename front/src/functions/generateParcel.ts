import { useParcelStore } from "@/store/ParcelStore";

/**
 * Generates a new parcel
 * @param userAddressXRPL The XRPL address of the user
 * @param mapTillerId The map tiller ID for the parcel
 * @param type The type of parcel to generate
 * @param name The name of the parcel
 * @returns The generated parcel
 */
function generateParcel(userAddressXRPL: string, mapTillerId: string, type: ParcelType = "minted", name: string = "New Parcel"): Parcel {
  return {
    id: mapTillerId, // Use mapTillerId as the id for simplicity
    mapTillerId,
    nftId: "1",
    price: type === "mintable" ? 0 : 234,
    owner: {
      addressXRPL: userAddressXRPL,
      id: "1",
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

/**
 * Generates a new parcel and adds it to the parcel store
 * @param userAddressXRPL The XRPL address of the user
 * @param mapTillerId The map tiller ID for the parcel
 * @param type The type of parcel to generate
 * @param name The name of the parcel
 * @returns The generated parcel
 */
export function generateAndAddParcel(userAddressXRPL: string, mapTillerId: string, type: ParcelType = "minted", name: string = "New Parcel"): Parcel {
  // Generate the parcel
  const newParcel = generateParcel(userAddressXRPL, mapTillerId, type, name);

  // Add it to the store
  const addParcel = useParcelStore.getState().addParcel;
  addParcel(newParcel);

  return newParcel;
}

export default generateParcel;
