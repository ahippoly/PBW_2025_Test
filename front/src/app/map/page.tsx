"use client";

import MapTillerView from "@/components/MapTillerView";
import Navbar from "@/components/NavBar/Navbar";
import ParcelInfo from "@/components/ParcelFrame/ParcelInfo";
import { useState, useMemo, useEffect } from "react";
import { useParcelStore } from "@/store/ParcelStore";
import { tempAddressXRPL } from "@/data/tempAddressXRPL";
import { useWalletStore } from "@/store/WalletStore";
import { useNftsStore } from "@/store/NftsStore";

function MapPage() {
  const MAP_TILLER_TOKEN: string = process.env.NEXT_PUBLIC_MAPTILLER_API_KEY || "PIazgw19EgeyDQ6KVWmO";

  const { parcels, selectMapTillerId, selectedParcel, selectedMapTillerId } = useParcelStore();
  const { address } = useWalletStore();
  const { getAllRemotesNfts } = useNftsStore();
  // Update store's selected parcel when MapTiller ID changes
  useEffect(() => {
    selectMapTillerId(selectedMapTillerId);
  }, [selectedMapTillerId]);

  useEffect(() => {
    if (selectedParcel && selectedParcel.mapTillerId !== selectedMapTillerId) {
      selectMapTillerId(selectedParcel.mapTillerId);
    }
  }, [selectedParcel]);

  // useEffect(() => {
  //   if (address) {
  //     getAllRemotesNfts();
  //   }
  // }, [address]);

  console.log("🚀 ~ MapPage ~ selectedMapTillerId:", selectedMapTillerId);
  console.log("🚀 ~ MapPage ~ selectedParcel:", selectedParcel);

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <Navbar />
      <div className="flex-1 flex justify-start items-center overflow-hidden bg-white">
        <div className="w-[60%] h-full z-10 drop-shadow-[0px_5px_10px_rgba(0,0,0,0.3)]">
          <MapTillerView
            selectedMapTillerId={selectedMapTillerId}
            onMapTillerIdSelect={selectMapTillerId}
            apiKey={MAP_TILLER_TOKEN}
            parcels={parcels}
            userAddress={address || undefined}
          />
        </div>
        <div className="flex-grow flex justify-center items-center h-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 animate-gradient-background"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -inset-[50%] bg-[radial-gradient(circle_at_50%_50%,rgba(134,239,172,0.3),transparent_40%)] animate-blob-slow"></div>
            <div className="absolute -inset-[50%] bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.25),transparent_30%)] animate-blob-slow animation-delay-2000"></div>
            <div className="absolute -inset-[50%] bg-[radial-gradient(circle_at_50%_50%,rgba(187,247,208,0.2),transparent_35%)] animate-blob-slow animation-delay-4000"></div>
          </div>
          <div className="relative z-10 w-full h-full flex justify-center items-center">
            <ParcelInfo parcel={selectedParcel || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
