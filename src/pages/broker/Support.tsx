import React from 'react';
import { Mail, Phone, MessageCircle, FileQuestion } from "lucide-react";

const SupportPage = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="h-16 bg-black flex items-center px-6">
        <h1 className="text-white font-medium">Supporto</h1>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-black p-6 rounded-lg">
            <h2 className="text-white font-medium mb-4">Contatti Diretti</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#3b82f6]" />
                <div>
                  <p className="text-white">Email Supporto</p>
                  <p className="text-gray-400">supporto@creditprofile.it</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#3b82f6]" />
                <div>
                  <p className="text-white">Telefono</p>
                  <p className="text-gray-400">+39 02 1234567</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black p-6 rounded-lg">
            <h2 className="text-white font-medium mb-4">Chat Live</h2>
            <button className="w-full px-4 py-3 bg-[#3b82f6] text-white rounded-lg flex items-center justify-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Inizia Chat</span>
            </button>
          </div>

          <div className="col-span-2 bg-black p-6 rounded-lg">
            <h2 className="text-white font-medium mb-4">FAQ</h2>
            <div className="space-y-4">
              {[
                "Come posso caricare i documenti dei clienti?",
                "Come funziona la validazione dei documenti?",
                "Come posso modificare i dati di un cliente?",
                "Come funziona il sistema di notifiche?"
              ].map((question, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-[#1e1e1e] rounded-lg cursor-pointer">
                  <FileQuestion className="w-5 h-5 text-[#3b82f6]" />
                  <span className="text-gray-400">{question}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage; 