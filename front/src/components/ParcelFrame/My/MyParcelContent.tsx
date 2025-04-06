import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { FileText, Leaf, Clock, Tag, Coins } from "lucide-react";

interface MyParcelContentProps {
  parcel: Parcel;
}

function MyParcelContent({ parcel }: MyParcelContentProps) {
  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl text-center font-bold">My Parcel</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full gap-4">
        <div className="flex flex-col justify-center items-center flex-grow py-6 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <p className="font-medium">
              ORE document link: <span className="font-bold">{parcel.legalDocuments.name}</span>
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-5 w-5 text-purple-600" />
            <p className="font-semibold text-lg">
              NFT ID: <span className="font-bold">{parcel.nftId}</span>
            </p>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-bold text-lg mb-3 text-green-800 flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Carbon Details
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="font-medium">Claimable Carbon:</p>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-green-200">
                <Leaf className="h-4 w-4 text-purple-600" />
                <p className="font-bold text-purple-600">{parcel.claimableCarbon} TEC</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-medium">Carbon Reward Rate:</p>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-green-200">
                <Coins className="h-4 w-4 text-purple-600" />
                <p className="font-bold text-purple-600">{parcel.carbonRewardRate} TEC / Year</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-medium">Locked until:</p>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-green-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <p className="font-bold text-blue-600">{parcel.lockedUntil}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-center mt-2">
          <Button className="bg-purple-600 hover:bg-purple-700">Sell</Button>
          <Button className="bg-green-600 hover:bg-green-700">Claim Carbon</Button>
        </div>
      </CardContent>
    </>
  );
}

export default MyParcelContent;
