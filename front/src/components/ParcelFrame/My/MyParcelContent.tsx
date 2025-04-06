import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";

import { CardTitle } from "@/components/ui/card";

interface MyParcelContentProps {
  parcel: Parcel;
}

function MyParcelContent({ parcel }: MyParcelContentProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>My Parcel</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {/* Add and icon */}
          <p>ORE document link : {parcel.legalDocuments.name}</p>
        </div>
        <p>Claimable Carbon : {parcel.claimableCarbon}</p>
        <p>Carbon Reward Rate : {parcel.carbonRewardRate}</p>
        <p>Locked until : {parcel.lockedUntil}</p>

        <div className="flex gap-2">
          <Button>Sell</Button>
          <Button>Claim Carbon</Button>
        </div>
      </CardContent>
    </>
  );
}

export default MyParcelContent;
