
import React from 'react';
import { cn } from "@/lib/utils";
import { File, FileText, Calendar, Download } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import StatusBadge, { StatusType } from './StatusBadge';
import AnimatedCard from './AnimatedCard';

export interface DocumentProps {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: StatusType;
  comments?: string;
  url?: string;
}

interface DocumentCardProps {
  document: DocumentProps;
  className?: string;
  onDownload?: (doc: DocumentProps) => void;
  onStatusChange?: (doc: DocumentProps, newStatus: StatusType) => void;
}

const DocumentCard = ({ 
  document, 
  className,
  onDownload,
  onStatusChange
}: DocumentCardProps) => {
  const { name, type, size, uploadDate, status, comments, url } = document;
  
  const getFileIcon = () => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="text-red-500" size={24} />;
      default:
        return <File className="text-blue-500" size={24} />;
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(document);
    }
  };

  return (
    <AnimatedCard 
      className={cn(
        "p-4 h-full flex flex-col",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-balance line-clamp-2">
            {name}
          </h3>
          <div className="mt-1 flex flex-wrap gap-2 items-center text-sm text-gray-500">
            <span className="uppercase">{type}</span>
            <span>•</span>
            <span>{formatFileSize(size)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>
            {format(uploadDate, "d MMMM yyyy", { locale: it })}
          </span>
        </div>
        
        <StatusBadge status={status} />
        
        {comments && (
          <p className="text-sm text-gray-500 mt-2 italic">
            "{comments}"
          </p>
        )}
      </div>
      
      {url && (
        <div className="mt-auto pt-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Download size={16} />
            Scarica
          </button>
        </div>
      )}
    </AnimatedCard>
  );
};

export default DocumentCard;
