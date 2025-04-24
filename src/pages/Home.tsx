import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  BarChart,
  Users, 
  ArrowRight,
  Shield,
  Database,
  FileCheck,
  Download,
  PieChart,
  LineChart,
  CheckCircle
} from 'lucide-react';
import DemoReportModal from '@/components/demo/DemoReportModal';
import Navbar from '@/components/layout/Navbar';

const features = [
  {
    icon: Database,
    title: "Analisi Credit Score Avanzata",
    description: "Accesso diretto alle principali banche dati finanziarie per una valutazione completa del profilo creditizio del cliente"
  },
  {
    icon: LineChart,
    title: "Report Professionali Personalizzati",
    description: "Genera report dettagliati che combinano dati finanziari, credit score e opportunità di finanziamento più adatte"
  },
  {
    icon: FileText,
    title: "Gestione Documenti Intelligente",
    description: "Sistema centralizzato per la raccolta e validazione dei documenti necessari per l'analisi creditizia"
  },
  {
    icon: CheckCircle,
    title: "Validazione Automatizzata",
    description: "Processo di validazione documenti semplificato con feedback immediato tra segreteria e cliente"
  }
];

const reportFeatures = [
  {
    title: "Analisi Credit Score",
    description: "Valutazione dettagliata del merito creditizio basata su dati ufficiali delle banche dati finanziarie",
    points: [
      "Score creditizio attuale e storico",
      "Analisi delle esposizioni finanziarie",
      "Valutazione della capacità di rimborso",
      "Indicatori di affidabilità creditizia"
    ]
  },
  {
    title: "Profilo Finanziario Completo",
    description: "Panoramica completa della situazione finanziaria del cliente",
    points: [
      "Reddito e stabilità lavorativa",
      "Patrimonio e garanzie disponibili",
      "Storico dei pagamenti",
      "Impegni finanziari in corso"
    ]
  },
  {
    title: "Raccomandazioni Personalizzate",
    description: "Suggerimenti su misura per le migliori opportunità di finanziamento",
    points: [
      "Prodotti finanziari più adatti",
      "Simulazioni di rata e importo",
      "Probabilità di approvazione",
      "Strategie di ottimizzazione"
    ]
  }
];

const Home = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 to-primary-300 pt-32 pb-24 text-primary-50 overflow-hidden mt-16">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Report Creditizi Professionali per Broker del Credito
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Analizza il credit score dei tuoi clienti e genera report dettagliati per trovare le migliori opportunità di finanziamento
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsDemoModalOpen(true);
                }}
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Vedi Demo Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Report Features Section - NUOVA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Report Creditizi Completi e Professionali
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Analisi approfondite che combinano dati ufficiali, credit score e opportunità di finanziamento
          </p>
          <div className="grid lg:grid-cols-3 gap-8">
            {reportFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Funzionalità della Piattaforma
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Strumenti avanzati per l'analisi creditizia e la generazione di report professionali
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-primary-50"
              >
                <feature.icon className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-xl font-semibold text-primary-900 mb-3">{feature.title}</h3>
                <p className="text-primary-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ottimizza il Tuo Processo di Analisi Creditizia
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Accedi a report professionali che combinano credit score, analisi finanziaria e opportunità di finanziamento
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-primary font-medium hover:bg-white/90 transition-colors"
            >
              Inizia Ora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-white text-white font-medium hover:bg-white/10 transition-colors"
            >
              Richiedi una Demo
            </Link>
          </div>
        </div>
      </section>

      <DemoReportModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  );
};

export default Home; 