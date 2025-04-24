// Generazione report
interface Report {
  client: ClientData;
  creditScore: CreditScoreData;
  selectedProducts: FinancialProduct[];
  template: ReportTemplate;
  customizations: ReportCustomization;
} 