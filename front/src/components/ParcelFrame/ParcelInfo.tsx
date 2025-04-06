import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import MintedParcelContent from "./Mint/MintedParcelContent";
import NoParcelSelected from "./NoParcelSelected";
import MintableParcelContent from "./MintableParcelContent";
import InvalidParcelContent from "./InvalidParcelContent";
import { tempAddressXRPL } from "@/data/tempAddressXRPL";
import MyParcelContent from "./My/MyParcelContent";
import NoParcelUploadContent from "./NoParcel/NoParcelUploadContent";

interface ParcelInfoProps {
  parcel: Parcel | undefined;
}

const getDisplayContent = (parcel: Parcel | undefined) => {
  if (!parcel) {
    return <NoParcelSelected />;
  }

  if (parcel.owner.addressXRPL === tempAddressXRPL) {
    return <MyParcelContent parcel={parcel} />;
  }

  if (parcel.type == "minted" || parcel.type == "minted_buyable") {
    return <MintedParcelContent parcel={parcel} />;
  }

  if (parcel.type == "mintable") {
    return <NoParcelUploadContent parcel={parcel} />;
  }

  if (parcel.type == "invalid") {
    return <InvalidParcelContent parcel={parcel} />;
  }

  return undefined;
};

function ParcelInfo({ parcel }: ParcelInfoProps) {
  return <Card className="w-[90%] h-[90%] max-w-[400px] shadow-lg">{getDisplayContent(parcel)}</Card>;
}

export default ParcelInfo;
