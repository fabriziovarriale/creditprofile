
import React, { useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  className?: string;
}

const FileUploader = ({ 
  onFileSelect, 
  acceptedFileTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png", 
  maxSizeMB = 10,
  className 
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    const fileType = file.type;
    const fileSize = file.size / (1024 * 1024); // Convert to MB
    
    // Check file type
    const acceptedTypes = acceptedFileTypes.split(',').map(type => 
      type.startsWith('.') ? type.substring(1) : type
    );
    
    const isValidType = acceptedTypes.some(type => 
      fileType.includes(type) || file.name.endsWith(`.${type}`)
    );
    
    if (!isValidType) {
      setUploadError(`Tipo di file non supportato. Accettiamo: ${acceptedFileTypes}`);
      return false;
    }
    
    // Check file size
    if (fileSize > maxSizeMB) {
      setUploadError(`Il file è troppo grande. Dimensione massima: ${maxSizeMB}MB`);
      return false;
    }
    
    setUploadError(null);
    return true;
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setIsUploading(true);
      
      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false);
        onFileSelect(file);
        toast.success("File caricato con successo");
      }, 1500);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {!selectedFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
            "flex flex-col items-center justify-center gap-2",
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <Upload 
            className={cn(
              "w-10 h-10 mb-2 transition-colors",
              isDragging ? "text-primary" : "text-gray-400"
            )} 
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              Trascina qui il file o <span className="text-primary">selezionalo</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supportiamo {acceptedFileTypes.replaceAll('.', '')} fino a {maxSizeMB}MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedFileTypes}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative flex items-center p-4 border rounded-lg bg-gray-50">
          <div className="mr-3 text-gray-400">
            <File size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div className="flex items-center">
            {isUploading ? (
              <div className="animate-pulse text-primary">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
              </div>
            ) : (
              uploadError ? (
                <AlertCircle className="text-red-500" size={20} />
              ) : (
                <CheckCircle className="text-green-500" size={20} />
              )
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="ml-2 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      {uploadError && (
        <p className="mt-2 text-xs text-red-500">{uploadError}</p>
      )}
    </div>
  );
};

export default FileUploader;
