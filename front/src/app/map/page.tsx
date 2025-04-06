"use client";

import MapTillerView from "@/components/MapTillerView";
import Navbar from "@/components/Navbar";
import ParcelInfo from "@/components/ParcelFrame/ParcelInfo";
import { useState, useMemo, useEffect } from "react";
import { useParcelStore } from "@/store/ParcelStore";
import { tempAddressXRPL } from "@/data/tempAddressXRPL";

function MapPage() {
  const MAP_TILLER_TOKEN: string = process.env.NEXT_PUBLIC_MAPTILLER_API_KEY || "your_mapbox_access_token_here";
  const [selectedMapTillerId, setSelectedMapTillerId] = useState<string | null>(null);

  const { parcels, selectedParcel: storeSelectedParcel, selectParcel } = useParcelStore();

  const selectedParcel = useMemo(() => parcels.find((parcel) => parcel.mapTillerId === selectedMapTillerId), [parcels, selectedMapTillerId]);

  // Update store's selected parcel when MapTiller ID changes
  useEffect(() => {
    if (selectedParcel) {
      selectParcel(selectedParcel.id);
    } else {
      selectParcel(null);
    }
  }, [selectedParcel, selectParcel]);

  console.log("🚀 ~ MapPage ~ selectedMapTillerId:", selectedMapTillerId);
  console.log("🚀 ~ MapPage ~ selectedParcel:", selectedParcel);

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <Navbar />
      <div className="flex-1 flex justify-start items-center overflow-hidden bg-white">
        <div className="w-[60%] h-full z-10">
          <MapTillerView
            selectedMapTillerId={selectedMapTillerId}
            onMapTillerIdSelect={setSelectedMapTillerId}
            apiKey={MAP_TILLER_TOKEN}
            parcels={parcels}
            userAddress={tempAddressXRPL}
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
