import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  onFileSelect,
  title = 'Upload Document',
  subtitle = 'Drag & drop or browse files',
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-none p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-[#f6f6f3]',
        isDragging ? 'border-sky-500 bg-sky-50' : 'border-[#deded9] hover:border-[#deded9]',
        isLoading && 'opacity-60 pointer-events-none'
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-[#2936ff] mb-3 shadow-lg shadow-sky-950/50">
        {selectedFileName ? <CheckCircle2 className="w-6 h-6 text-[#217454]" /> : <UploadCloud className="w-6 h-6" />}
      </div>

      <h4 className="text-sm font-semibold text-[#252525]">{title}</h4>
      <p className="text-xs text-[#858580] mt-1 max-w-xs">{subtitle}</p>

      {selectedFileName && (
        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-[#f6f6f3] rounded-none border border-[#deded9] text-xs text-[#252525]">
          <FileText className="w-4 h-4 text-[#2936ff]" />
          <span className="font-mono truncate max-w-xs">{selectedFileName}</span>
        </div>
      )}

      <div className="mt-5">
        <Button variant="outline" size="sm" isLoading={isLoading} type="button">
          Select File
        </Button>
      </div>
    </div>
  );
};
