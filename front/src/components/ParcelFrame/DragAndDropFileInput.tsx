"use client";

import { ChangeEvent, DragEvent, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileIcon, Loader2 } from "lucide-react";

interface DragAndDropFileInputProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
  accept?: string;
  multiple?: boolean;
}

function DragAndDropFileInput({ onFilesSelected, className, accept, multiple = false }: DragAndDropFileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state after 1 second
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileList = (fileList: FileList) => {
    const filesArray = multiple ? Array.from(fileList) : [fileList[0]];
    setIsLoading(true);
    setTimeout(() => {
      onFilesSelected(filesArray);
    }, 1000);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileList(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileList(e.target.files);
    }
  };

  return (
    <div
      className={cn(
        "relative bg-gray-50 flex flex-col items-center justify-center w-full min-h-[200px] p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        disabled={isLoading}
      />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {isLoading ? <Loader2 className="w-10 h-10 text-primary animate-spin" /> : <FileIcon className="w-10 h-10 text-gray-400" />}
        <p className="text-sm text-gray-500">
          {isLoading ? (
            <span className="font-medium text-primary">Processing file...</span>
          ) : (
            <>
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </>
          )}
        </p>
        {!isLoading && (
          <p className="text-xs text-gray-400">
            {multiple ? "Files" : "File"} {accept ? `(${accept})` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default DragAndDropFileInput;
