"use client";

import MapTillerView from "@/components/MapTillerView";
import Navbar from "@/components/Navbar";
import ParcelInfo from "@/components/ParcelFrame/ParcelInfo";
import { useState, useMemo } from "react";

const whiteListedParcels: Parcel[] = [
  {
    mapTillerId: "781280000B0654",
    nftId: "1",
    price: 100,
    owner: {
      id: "1",
      firstName: "John",
      lastName: "Doe",
    },
    cadastreId: "1",
    cadastreRef: "1",
    name: "Foret de la Forêt",
    carbonRewardRate: 10,
    claimableCarbon: 100,
    legalDocuments: {
      id: "1",
      name: "OAJRFJ",
    },
    sellPrice: 100,
    type: "minted",
    id: "1",
  },
  {
    mapTillerId: "781280000B0275",
    nftId: "1",
    price: 234,
    owner: {
      id: "1",
      firstName: "John",
      lastName: "Doe",
    },
    cadastreId: "1",
    cadastreRef: "1",
    name: "Terrain achetable miam",
    carbonRewardRate: 10,
    claimableCarbon: 100,
    legalDocuments: {
      id: "1",
      name: "OAJRFJ",
    },
    sellPrice: 100,
    type: "minted_buyable",
    id: "1",
  },

  {
    mapTillerId: "785900000A0061",
    nftId: "1",
    price: 234,
    owner: {
      id: "1",
      firstName: "John",
      lastName: "Doe",
    },
    cadastreId: "1",
    cadastreRef: "1",
    name: "Terrain INVALIDE",
    carbonRewardRate: 10,
    claimableCarbon: 100,
    legalDocuments: {
      id: "1",
      name: "OAJRFJ",
    },
    sellPrice: 100,
    type: "invalid",
    id: "1",
  },
  {
    mapTillerId: "781280000A0076",
    nftId: "1",
    price: 0,
    owner: {
      id: "1",
      firstName: "John",
      lastName: "Doe",
    },
    cadastreId: "1",
    cadastreRef: "1",
    name: "Terrain protege",
    carbonRewardRate: 10,
    claimableCarbon: 100,
    legalDocuments: {
      id: "1",
      name: "OAJRFJ",
    },
    sellPrice: 100,
    type: "mintable",
    id: "1",
  },
];

function MapPage() {
  const MAP_TILLER_TOKEN: string = process.env.NEXT_PUBLIC_MAPTILLER_API_KEY || "your_mapbox_access_token_here";
  const [selectedMapTillerId, setSelectedMapTillerId] = useState<string | null>(null);
  const selectedParcel = useMemo(() => whiteListedParcels.find((parcel) => parcel.mapTillerId === selectedMapTillerId), [selectedMapTillerId]);
  console.log("🚀 ~ MapPage ~ selectedMapTillerId:", selectedMapTillerId);
  console.log("🚀 ~ MapPage ~ selectedParcel:", selectedParcel);
  const mintedParcels = useMemo(() => whiteListedParcels.filter((parcel) => parcel.type === "minted"), [whiteListedParcels]);
  const mintableParcels = useMemo(() => whiteListedParcels.filter((parcel) => parcel.type === "mintable"), [whiteListedParcels]);
  const buyableParcels = useMemo(() => whiteListedParcels.filter((parcel) => parcel.type === "minted_buyable"), [whiteListedParcels]);
  const invalidParcels = useMemo(() => whiteListedParcels.filter((parcel) => parcel.type === "invalid"), [whiteListedParcels]);

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <Navbar />
      <div className="flex-1 flex justify-start items-center overflow-hidden bg-white">
        <div className="w-[60%] h-full z-10">
          <MapTillerView
            selectedMapTillerId={selectedMapTillerId}
            onMapTillerIdSelect={setSelectedMapTillerId}
            apiKey={MAP_TILLER_TOKEN}
            whiteListedParcels={whiteListedParcels}
            mintedParcels={mintedParcels}
            mintableParcel={mintableParcels[0]}
            buyableParcels={buyableParcels}
            invalidParcels={invalidParcels}
          />
        </div>
        <div className="flex-grow flex justify-center items-center h-full">
          <ParcelInfo parcel={selectedParcel} />
        </div>
      </div>
    </div>
  );
}

export default MapPage;
