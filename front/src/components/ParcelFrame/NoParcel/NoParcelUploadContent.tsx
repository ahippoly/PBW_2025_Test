import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, AlertTriangle, Leaf, Clock } from "lucide-react";
import { useState } from "react";
import { MintAlertDialog } from "../Mint/MintAlertDialog";

interface NoParcelUploadContentProps {
  parcel: Parcel;
}

const rewardRate = 10;

function NoParcelUploadContent({ parcel }: NoParcelUploadContentProps) {
  const [greenLockDuration, setGreenLockDuration] = useState(33);
  const totalReward = rewardRate * greenLockDuration;

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

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <p className="font-semibold text-lg">Lock Duration: {greenLockDuration} Years</p>
          </div>
          <Slider value={[greenLockDuration]} max={100} min={0} step={1} onValueChange={(value) => setGreenLockDuration(value[0])} className="my-2" />
          <div className="flex justify-between text-sm text-slate-500 mt-1">
            <span>0 Years</span>
            <span>50 Years</span>
            <span>100 Years</span>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-bold text-lg mb-3 text-green-800 flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Reward Summary
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="font-medium">Annual Reward Rate:</p>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-green-200">
                <Leaf className="h-4 w-4 text-purple-600" />
                <p className="font-bold text-purple-600">{rewardRate} TEC / Year</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-semibold text-lg">Total Estimated Reward:</p>
              <div className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full">
                <Leaf className="h-5 w-5 text-purple-700" />
                <p className="font-bold text-purple-700 text-lg whitespace-nowrap">~ {totalReward} TEC</p>
              </div>
            </div>
          </div>
        </div>

        {/* <Separator className="my-2" /> */}
        <MintAlertDialog greenLockDuration={greenLockDuration} />
      </CardContent>
    </>
  );
}

export default NoParcelUploadContent;
