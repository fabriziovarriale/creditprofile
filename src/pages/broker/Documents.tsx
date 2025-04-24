import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Filter, Download, Eye, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocuments } from '@/context/DocumentsContext';
import { mockClients } from '@/mocks/data';
import { FileText } from "lucide-react";

interface Document {
  id: string;
  name: string;
  client: string;
  type: string;
  status: 'validated' | 'pending' | 'rejected';
  uploadDate: string;
  size: string;
}

const DocumentsPage = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="h-16 bg-black flex items-center justify-between px-6">
        <h1 className="text-white font-medium">Documenti</h1>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg">
            Carica Documento
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-black rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Caricamento</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClients.flatMap(client => 
                client.documents?.map(doc => (
                  <TableRow key={`${client.id}-${doc.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-[#3b82f6]" />
                        <span className="text-white">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e40af] flex items-center justify-center text-white">
                          {client.name[0]}
                        </div>
                        <span className="text-gray-400">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date().toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        doc.status === 'verified' ? 'bg-green-900 text-green-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {doc.status === 'verified' ? 'Verificato' : 'In Attesa'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-[#1e1e1e] rounded">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-[#1e1e1e] rounded">
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) || []
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage; 