import { Button } from "@/components/ui/button";
import { CardHeader, CardContent } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Leaf, Tag, Coins, User, MapPin } from "lucide-react";

interface MintedParcelContentProps {
  parcel: Parcel;
}

const trimAddress = (address: string | undefined): string => {
  if (!address) return "N/A";
  return address.slice(0, 6) + "..." + address.slice(-4);
};

function MintedParcelContent({ parcel }: MintedParcelContentProps) {
  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl text-center font-bold">{parcel.mapTillerId}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full gap-4">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-blue-600" />
            <p className="font-semibold">
              Owner: <span className="font-bold">{"rPfLhLuzZEiyo7Y8VEfbmGBqqsSvBZjXYY"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <p className="font-semibold">
              Cadastre Ref: <span className="font-bold">{parcel.mapTillerId || "N/A"}</span>
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-lg mb-3 text-blue-800 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Parcel Details
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="font-medium">Sell Price:</p>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-blue-200">
                <Coins className="h-4 w-4 text-blue-600" />
                <p className="font-bold text-blue-600">10 XRP</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-medium">Claimable Carbon:</p>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-blue-200">
                <Leaf className="h-4 w-4 text-green-600" />
                <p className="font-bold text-green-600">10 FST</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-medium">Carbon Reward Rate:</p>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-blue-200">
                <Coins className="h-4 w-4 text-purple-600" />
                <p className="font-bold text-purple-600">10 FST / Year</p>
              </div>
            </div>
          </div>
        </div>

        {parcel.legalDocuments && (
          <div className="flex flex-col justify-center items-center py-4 bg-green-50 rounded-lg border border-green-200">
            <a href={parcel.legalDocuments.uri} target="_blank" className="cursor-pointer flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <p className="font-medium">
                ORE document: <span className="font-bold">{parcel.legalDocuments.name}</span>
              </p>
            </a>
          </div>
        )}

        <Button className="w-full mt-2 ">Buy NFT</Button>
      </CardContent>
    </>
  );
}

export default MintedParcelContent;
