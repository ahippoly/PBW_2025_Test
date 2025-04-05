import { CardContent } from "../ui/card";

function NoParcelSelected() {
  return (
    <CardContent className="flex flex-col justify-center items-center gap-8 h-full">
      <h1 className="text-center text-3xl font-bold">No parcel selected yet</h1>
      <p className="text-sm text-gray-500 max-w-[300px] text-center">To begin, select a parcel you want to buy or one that you own</p>
    </CardContent>
  );
}

export default NoParcelSelected;
