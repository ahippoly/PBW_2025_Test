import { Button } from "../ui/button";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import DragAndDropFileInput from "./DragAndDropFileInput";

interface MintableParcelContentProps {
  parcel: Parcel;
}

function MintableParcelContent({ parcel }: MintableParcelContentProps) {
  return (
    <>
      <CardHeader>
        <h1 className="text-2xl text-center font-bold mb-2">{parcel.name}</h1>
      </CardHeader>
      <CardContent className="flex flex-col h-full gap-2">
        <div className="flex flex-col justify-start">
          <p className="font-semibold">Cadastre Ref :</p>
        </div>

        <div className="flex flex-col justify-center gap-2 items-center flex-grow">
          <h4 className="text-sm text-center">
            You are the owner ?<br></br>
            Upload your contract file
          </h4>
          <DragAndDropFileInput onFilesSelected={() => {}} />
        </div>
        <div className="flex flex-col justify-start">
          <div className="flex flex-row justify-between p-2 bg-slate-100 rounded-md mb-2">
            <p className="font-bold">Carbon reward rate : </p>
            <p className="font-bold text-purple-600">10</p>
          </div>
        </div>

        <Separator className="" />
        <Button className="w-full mt-2">Mint</Button>
      </CardContent>
    </>
  );
}

export default MintableParcelContent;
