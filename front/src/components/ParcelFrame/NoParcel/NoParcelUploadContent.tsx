import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, AlertTriangle, Leaf } from "lucide-react";
import { useState } from "react";
import { MintAlertDialog } from "../Mint/MintAlertDialog";

interface NoParcelUploadContentProps {
  parcel: Parcel;
}

const rewardRate = 10;

function NoParcelUploadContent({ parcel }: NoParcelUploadContentProps) {
  const [greenLockDuration, setGreenLockDuration] = useState(33);
  return (
    <>
      <CardHeader className="pb-3">
        <h1 className="text-2xl text-center font-bold">{parcel.name}</h1>
      </CardHeader>
      <CardContent className="flex flex-col h-full gap-4">
        <div className="flex flex-col justify-center items-center flex-grow py-6 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <p className="text-lg font-medium text-green-600">Assessment is verified and valid!</p>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <p className="font-semibold">Lock Time</p>
          <Slider value={[greenLockDuration]} max={100} min={0} step={1} onValueChange={(value) => setGreenLockDuration(value[0])} />
        </div>

        <div className="flex flex-col justify-start mt-2">
          <div className="flex flex-row justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-semibold">Land carbon reward rate:</p>
            <div className="flex items-center gap-1">
              <Leaf className="h-4 w-4 text-purple-600" />
              <p className="font-bold text-purple-600">{rewardRate} TEC / Year</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-start mt-2">
          <div className="flex flex-row justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-semibold">Estimated total carbon reward:</p>
            <div className="flex items-center gap-1">
              <Leaf className="h-4 w-4 text-purple-600" />
              <p className="font-bold text-purple-600">~ {rewardRate * greenLockDuration} TEC</p>
            </div>
          </div>
        </div>

        <Separator className="my-2" />
        <MintAlertDialog greenLockDuration={greenLockDuration} />
      </CardContent>
    </>
  );
}

export default NoParcelUploadContent;
