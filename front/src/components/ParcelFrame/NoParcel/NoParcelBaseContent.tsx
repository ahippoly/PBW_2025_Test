import { CardContent } from "@/components/ui/card";
import { MapIcon } from "lucide-react";
import DragAndDropFileInput from "../DragAndDropFileInput";

interface NoParcelBaseContentProps {
  setFiles: (files: File[]) => void;
}

export const BaseContent = ({ setFiles }: NoParcelBaseContentProps) => {
  return (
    <>
      <CardContent className="flex flex-col justify-center items-center h-full pt-6 gap-10">
        <div className="flex flex-col items-center  text-center ">
          <MapIcon className="h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Green Parcel to begin</h2>
        </div>

        <div className="w-full flex items-center gap-4 my-4">
          <div className="h-px bg-slate-200 flex-grow"></div>
          <p className="text-sm font-medium text-slate-500">OR</p>
          <div className="h-px bg-slate-200 flex-grow"></div>
        </div>

        <div className="flex flex-col items-center max-w-[500px] w-full">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Upload your land folder to make it Green !</h2>
          </div>
          <DragAndDropFileInput
            onFilesSelected={(files) => {
              setFiles(files);
            }}
            className="w-full border-green-200 hover:border-green-500"
          />
        </div>
      </CardContent>
    </>
  );
};
