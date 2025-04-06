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

interface MintAlertDialogProps {
  greenLockDuration: number;
}

export function MintAlertDialog({ greenLockDuration }: MintAlertDialogProps) {
  const [loadingMint, setLoadingMint] = useState(false);

  const handleMint = () => {
    setLoadingMint(true);
    setTimeout(() => {
      setLoadingMint(false);
      generateAndAddParcel(tempAddressXRPL, mapIdsToLock[0]);
    }, 3000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full mt-2 py-6 text-lg font-semibold bg-green-600 hover:bg-green-700">Green lock for {greenLockDuration} years !</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold text-amber-700">Warning</DialogTitle>
          <Image src="/satelitte_icon.svg" className=" mx-auto" alt="warning" width={200} height={200} />
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-700">You must keep your parcel green for the defined time, or you will lose your carbon rewards!</p>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={loadingMint} onClick={handleMint}>
            {loadingMint ? (
              <div className="flex items-center gap-2">
                <SpinningLoader />
                <span>Minting...</span>
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
