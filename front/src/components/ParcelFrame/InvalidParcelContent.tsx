import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { XCircle } from "lucide-react";

type InvalidParcelContentProps = {
  parcel: Parcel;
};

function InvalidParcelContent({ parcel }: InvalidParcelContentProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-center">{parcel.mapTillerId}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center gap-8 h-full">
        <div className="flex flex-col items-center gap-4">
          <XCircle className="w-16 h-16 text-red-500" />
          <h1 className="text-center text-3xl font-bold text-red-600">Invalid Parcel</h1>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500 max-w-[300px] text-center">This parcel has been flagged for validation issues</p>
          <p className="text-sm font-medium text-red-500 max-w-[300px] text-center">Issue details: Non-compliance with ORE contract terms</p>
        </div>
      </CardContent>
    </>
  );
}

export default InvalidParcelContent;
