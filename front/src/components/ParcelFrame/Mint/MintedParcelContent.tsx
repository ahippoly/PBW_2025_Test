import { Button } from "@/components/ui/button";
import { CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MintedParcelContentProps {
  parcel: Parcel;
}

function MintedParcelContent({ parcel }: MintedParcelContentProps) {
  return (
    <>
      <CardHeader>
        <h1 className="text-2xl text-center font-bold mb-2">{parcel.name}</h1>
      </CardHeader>
      <CardContent className="flex flex-col h-full gap-2">
        <div className="flex flex-col justify-start  flex-grow">
          <p className="font-semibold">Owner :</p>
          <p className="font-semibold">Cadastre Ref :</p>
        </div>
        <div className="flex flex-col justify-start">
          <div className="flex flex-row justify-between p-2 bg-slate-100 rounded-md mb-2">
            <p className="font-bold">Sell Price :</p>
            <p className="font-bold text-blue-600">10</p>
          </div>
          <div className="flex flex-row justify-between p-2 bg-slate-100 rounded-md mb-2">
            <p className="font-bold">Claimable carbon : </p>
            <p className="font-bold text-green-600">10</p>
          </div>
          <div className="flex flex-row justify-between p-2 bg-slate-100 rounded-md mb-2">
            <p className="font-bold">Carbon reward rate : </p>
            <p className="font-bold text-purple-600">10</p>
          </div>
        </div>

        <Separator className="" />
        <Button className="w-full mt-2">Buy</Button>
      </CardContent>
    </>
  );
}

export default MintedParcelContent;
