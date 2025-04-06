"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SpinningLoader from "../../../components/SpinningLoader";
import { generateAndAddParcel } from "@/functions/generateParcel";
import { mapIdsToLock } from "@/data/mapIdsToLock";
import { tempAddressXRPL } from "@/data/tempAddressXRPL";
import { CardContent, CardTitle } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { useParcelStore } from "@/store/ParcelStore";
import { useWalletStore } from "@/store/WalletStore";
import { mintNewNFT } from "@/functions/gemwallet";

interface MintAlertDialogProps {
  greenLockDuration: number;
}

const convertIpfsToHttp = (uri: string) => {
  // Extract just the CID (hash) from the IPFS URI
  const parts = uri.replace("ipfs://", "").split("/");
  const cid = parts[0];
  return `https://ipfs.io/ipfs/${cid}`;
};

export function MintAlertDialog({ greenLockDuration }: MintAlertDialogProps) {
  const [loadingMint, setLoadingMint] = useState(false);
  const [success, setSuccess] = useState<boolean | undefined>(undefined);
  const { selectedParcel, updateParcel } = useParcelStore();
  const { address } = useWalletStore();
  const handleMint = async () => {
    if (!address) {
      console.error("No address found");
      return;
    }

    if (!selectedParcel) {
      console.error("No parcel selected");
      return;
    }
    setLoadingMint(true);

    const { tokenId, offerID, result, uri } = await mintNewNFT({
      gps: selectedParcel.mapTillerId,
      surface: 102,
      ref_cad: selectedParcel.mapTillerId,
      price: "0",
      address: address,
    });
    console.log("🚀 ~ handleMint ~ tokenId:", tokenId);

    const updatedParcel: Parcel = {
      ...selectedParcel,
      owner: {
        ...selectedParcel.owner,
        addressXRPL: address,
      },
      legalDocuments: {
        ...selectedParcel.legalDocuments,
        uri: convertIpfsToHttp(uri),
      },
      nftId: tokenId,
    };

    updateParcel(updatedParcel);

    setTimeout(() => {
      setLoadingMint(false);
      setSuccess(true);
      generateAndAddParcel(address, selectedParcel.mapTillerId);
    }, 1000);
  };

  const successContent = (
    <>
      <DialogContent className="bg-green-50 border-2 border-green-200">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold text-green-700">Success!</DialogTitle>
          <p className="text-center text-4xl mb-2">🥳</p>
          <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border border-green-200 shadow-sm">
            <p className="text-green-700 text-lg font-medium text-center">Congratulations! You have successfully minted your parcel.</p>
          </div>
        </DialogHeader>
        <DialogFooter className="flex justify-center items-center gap-4 mt-4">
          <DialogClose asChild>
            <Button className="text-white px-8 py-2">View My Parcel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </>
  );

  const modalContent = (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold text-amber-700">Warning</DialogTitle>
          <Image src="/satelitte_icon.svg" className=" mx-auto" alt="warning" width={200} height={200} />
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-700">You must keep your parcel green for the defined time, or you will lose your carbon rewards!</p>
          </div>
        </DialogHeader>
        <DialogFooter className="flex justify-center items-center gap-4">
          <Button variant="outline">Cancel</Button>
          <Button disabled={loadingMint} onClick={handleMint}>
            {loadingMint ? (
              <div className="flex items-center gap-2">
                <SpinningLoader />
                <span>Minting...</span>
              </div>
            ) : (
              "Mint NFT"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full mt-2 py-6 text-lg font-semibold bg-green-600 hover:bg-green-700">Green lock for {greenLockDuration} years !</Button>
      </DialogTrigger>
      {success ? successContent : modalContent}
    </Dialog>
  );
}
