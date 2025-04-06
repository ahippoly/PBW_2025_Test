import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import DragAndDropFileInput from "./DragAndDropFileInput";
import { MapIcon, Upload } from "lucide-react";
import { BaseContent } from "./NoParcel/NoParcelBaseContent";
import { useParcelStore } from "@/store/ParcelStore";
import { mapIdsToLock } from "@/data/mapIdsToLock";

function NoParcelSelected() {
  const [files, setFiles] = useState<File[]>([]);
  const { selectMapTillerId, selectedParcel } = useParcelStore();

  useEffect(() => {
    if (files.length > 0) {
      selectMapTillerId(mapIdsToLock[0]);
    }
  }, [files]);

  return (
    <>
      <BaseContent setFiles={setFiles} />
    </>
  );
}

export default NoParcelSelected;
