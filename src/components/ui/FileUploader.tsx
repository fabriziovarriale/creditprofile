import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileUpload?: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  label?: string;
  description?: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
  id?: string;
}

const FileUploader = ({
  onFileSelect,
  onFileUpload,
  accept = "application/pdf,image/jpeg,image/png",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  label = "Carica un file",
  description = "Trascina un file qui o clicca per selezionarlo",
  uploading = false,
  progress = 0,
  error,
  id
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileType = file.type;
    const validTypes = accept.split(',');
    if (!validTypes.includes(fileType)) {
      setFileError(`Tipo di file non supportato. Tipi accettati: ${accept}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      setFileError(`Il file è troppo grande. Dimensione massima: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleUploadClick = async () => {
    if (selectedFile && onFileUpload) {
      try {
        await onFileUpload(selectedFile);
      } catch (error) {
        console.error('Error uploading file:', error);
        setFileError('Si è verificato un errore durante il caricamento del file.');
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={cn("w-full", className)}>
      {!selectedFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
            (error || fileError) && "border-destructive/50 bg-destructive/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={label || "Carica file"}
          aria-describedby={`${id}-description`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
            aria-label={label || "Seleziona file"}
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200">{label}</h3>
            <p id={`${id}-description`} className="text-sm text-zinc-400">{description}</p>
            <p className="text-xs text-zinc-400">
              Formati supportati: {accept.split(',').join(', ')}
            </p>
            <p className="text-xs text-zinc-400">
              Dimensione massima: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRemoveFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Caricamento in corso...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {!uploading && onFileUpload && (
            <div className="mt-4">
              <Button
                onClick={handleUploadClick}
                className="w-full"
              >
                Carica File
              </Button>
            </div>
          )}
        </div>
      )}

      {(error || fileError) && (
        <div className="flex items-center space-x-2 mt-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error || fileError}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
