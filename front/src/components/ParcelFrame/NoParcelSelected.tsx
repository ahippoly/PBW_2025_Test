import { useState } from "react";
import { Button } from "../ui/button";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import DragAndDropFileInput from "./DragAndDropFileInput";
import { MapIcon, Upload } from "lucide-react";
import { BaseContent } from "./NoParcel/NoParcelBaseContent";
import NoParcelUploadContent from "./NoParcel/NoParcelUploadContent";
import { exampleUploadedParcel } from "@/data/exampleUploadedParcel";

function NoParcelSelected() {
  const [files, setFiles] = useState<File[]>([]);

  return <>{files.length > 0 ? <NoParcelUploadContent parcel={exampleUploadedParcel} /> : <BaseContent setFiles={setFiles} />}</>;
}

export default NoParcelSelected;
