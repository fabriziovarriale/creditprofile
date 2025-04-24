import React from 'react';
import { X, Download, FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Logo from '@/components/ui/Logo';

// Utilizziamo gli stessi dati di mock della dashboard
const performanceData = [
  { mese: 'Gen', pratiche: 12, completate: 8, valore: 120000 },
  { mese: 'Feb', pratiche: 15, completate: 11, valore: 180000 },
  { mese: 'Mar', pratiche: 18, completate: 14, valore: 220000 },
  { mese: 'Apr', pratiche: 14, completate: 12, valore: 190000 },
  { mese: 'Mag', pratiche: 20, completate: 16, valore: 250000 },
  { mese: 'Giu', pratiche: 22, completate: 18, valore: 280000 },
];

const bankOptions = [
  {
    bank: "Intesa Sanpaolo",
    product: "Mutuo Domus Fisso",
    rate: "3.45%",
    maxAmount: "€300.000",
    duration: "25 anni",
    monthlyPayment: "€1.485",
    requirements: [
      "Reddito minimo €30.000",
      "Anzianità lavorativa 2 anni",
      "LTV massimo 80%"
    ]
  },
  {
    bank: "UniCredit",
    product: "Mutuo Prima Casa",
    rate: "3.55%",
    maxAmount: "€350.000",
    duration: "30 anni",
    monthlyPayment: "€1.580",
    requirements: [
      "Reddito minimo €28.000",
      "Anzianità lavorativa 1 anno",
      "LTV massimo 80%"
    ]
  },
  {
    bank: "BNL",
    product: "Mutuo BNL Giovani",
    rate: "3.65%",
    maxAmount: "€250.000",
    duration: "30 anni",
    monthlyPayment: "€1.145",
    requirements: [
      "Età massima 35 anni",
      "Reddito minimo €25.000",
      "LTV massimo 85%"
    ]
  },
  {
    bank: "Crédit Agricole",
    product: "Mutuo Crédit Agricole",
    rate: "3.50%",
    maxAmount: "€280.000",
    duration: "25 anni",
    monthlyPayment: "€1.395",
    requirements: [
      "Reddito minimo €27.000",
      "Anzianità lavorativa 18 mesi",
      "LTV massimo 80%"
    ]
  }
];

interface DemoReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoReportModal = ({ isOpen, onClose }: DemoReportModalProps) => {
  if (!isOpen) return null;

  const BankOptionsSection = () => (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Opzioni di Finanziamento Consigliate</h3>
      <div className="grid gap-4">
        {bankOptions.map((option, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-lg text-primary">{option.bank}</h4>
                <p className="text-sm text-muted-foreground">{option.product}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-primary">{option.rate}</div>
                <p className="text-sm text-muted-foreground">Tasso Fisso</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Importo Massimo</p>
                <p className="font-medium">{option.maxAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durata</p>
                <p className="font-medium">{option.duration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rata Mensile*</p>
                <p className="font-medium">{option.monthlyPayment}</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Requisiti principali:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {option.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        * Rata mensile calcolata su un importo di €200.000 per la durata massima indicata. 
        Le condizioni potrebbero variare in base al profilo del richiedente e alle politiche della banca.
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo iconSize={5} textSize="text-lg" />
            <span className="border-l pl-4 text-xl font-semibold text-gray-700">Report Analisi Creditizia</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Intestazione Report */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">Mario Rossi</h3>
            <p className="text-gray-600">Report generato il 20 Marzo 2024</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <div className="bg-sky-50 text-sky-700 p-4 rounded-lg border-none shadow-sm">
              <div className="text-sm font-medium mb-2">Credit Score</div>
              <div className="text-2xl font-bold">705</div>
              <p className="text-xs mt-1 text-emerald-600">+15 punti nell'ultimo mese</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg border-none shadow-sm">
              <div className="text-sm font-medium mb-2">Capacità di Rimborso</div>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs mt-1 text-emerald-600">Ottima</p>
            </div>
            <div className="bg-violet-50 text-violet-700 p-4 rounded-lg border-none shadow-sm">
              <div className="text-sm font-medium mb-2">Reddito Mensile</div>
              <div className="text-2xl font-bold">€3.500</div>
              <p className="text-xs mt-1">Stabile da 5+ anni</p>
            </div>
            <div className="bg-rose-50 text-rose-700 p-4 rounded-lg border-none shadow-sm">
              <div className="text-sm font-medium mb-2">Esposizione Totale</div>
              <div className="text-2xl font-bold">€167K</div>
              <p className="text-xs mt-1">35% del valore immobile</p>
            </div>
          </div>

          {/* Grafici */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Trend Credit Score</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorPratiche" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mese" />
                    <YAxis domain={[600, 800]} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb' }} />
                    <Area
                      type="monotone"
                      dataKey="completate"
                      stroke="#6366f1"
                      fill="url(#colorPratiche)"
                      name="Credit Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Esposizione Finanziaria (€K)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mese" />
                    <YAxis tickFormatter={(value) => `${value/1000}`} />
                    <Tooltip 
                      contentStyle={{ background: 'white', border: '1px solid #e5e7eb' }}
                      formatter={(value: number) => [`€${(value/1000).toFixed(1)}K`, 'Valore']}
                    />
                    <Bar 
                      dataKey="valore" 
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100">
              <div className="text-sm text-indigo-600 mb-1">Probabilità di Approvazione</div>
              <div className="text-2xl font-bold text-indigo-700">92%</div>
              <div className="text-xs text-indigo-500 mt-1">
                Ottima possibilità di successo
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100">
              <div className="text-sm text-emerald-600 mb-1">Rata Sostenibile</div>
              <div className="text-2xl font-bold text-emerald-700">€850/mese</div>
              <div className="text-xs text-emerald-500 mt-1">
                25% del reddito mensile
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-100">
              <div className="text-sm text-violet-600 mb-1">Importo Finanziabile</div>
              <div className="text-2xl font-bold text-violet-700">€280K</div>
              <div className="text-xs text-violet-500 mt-1">
                Fino a 80% del valore immobile
              </div>
            </div>
          </div>

          {/* Raccomandazioni */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">Raccomandazioni</h4>
            <div className="bg-gray-50 p-6 rounded-xl">
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Mutuo Prima Casa - Tasso Fisso</p>
                    <p className="text-sm text-gray-600">
                      Rata stimata: €850/mese - Durata: 25 anni - TAN: 3.2% - TAEG: 3.4%
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Mutuo Prima Casa - Tasso Variabile</p>
                    <p className="text-sm text-gray-600">
                      Rata stimata: €780/mese - Durata: 25 anni - TAN: 2.8% - TAEG: 3.0%
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <BankOptionsSection />

          {/* Footer con azioni */}
          <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Chiudi
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Scarica PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoReportModal; 