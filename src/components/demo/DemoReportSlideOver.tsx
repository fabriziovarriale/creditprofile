import React from 'react';
import { X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import DemoReportModal from './DemoReportModal';

interface DemoReportSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
}

const DemoReportSlideOver: React.FC<DemoReportSlideOverProps> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div
        className={`fixed top-0 right-0 h-screen w-full md:w-[700px] bg-white border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-full overflow-y-auto flex flex-col">
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <Logo iconSize={24} textSize={24} />
              <span className="font-bold text-lg">Anteprima Credit Profile</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Riutilizza il contenuto di DemoReportModal, ma senza overlay e header */}
            <div className="p-6 space-y-8">
              <DemoReportModal isOpen={true} onClose={onClose} profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoReportSlideOver; 