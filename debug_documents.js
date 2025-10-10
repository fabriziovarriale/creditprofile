// Script per debuggare i documenti nel localStorage
console.log('=== DEBUG DOCUMENTI ===');

// Recupera i documenti dal localStorage
const mockDocuments = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
console.log('Documenti totali:', mockDocuments.length);

// Mostra tutti i documenti con le loro date
mockDocuments.forEach((doc, index) => {
  console.log(`${index + 1}. ${doc.fileName || doc.name} - Cliente: ${doc.clientName} - Status: ${doc.status} - Data: ${doc.uploadedAt || doc.createdAt || 'N/A'}`);
});

// Ordina per data e mostra i 5 più recenti
const sortedDocs = mockDocuments.sort((a, b) => {
  const dateA = new Date(a.uploadedAt || a.createdAt || 0);
  const dateB = new Date(b.uploadedAt || b.createdAt || 0);
  return dateB.getTime() - dateA.getTime();
});

console.log('\n=== TOP 5 DOCUMENTI RECENTI ===');
sortedDocs.slice(0, 5).forEach((doc, index) => {
  console.log(`${index + 1}. ${doc.fileName || doc.name} - ${doc.clientName} - ${doc.status} - ${doc.uploadedAt || doc.createdAt || 'N/A'}`);
});

// Controlla se ci sono documenti con date di oggi
const today = new Date().toISOString().split('T')[0];
console.log('\n=== DOCUMENTI DI OGGI ===');
const todayDocs = mockDocuments.filter(doc => {
  const docDate = doc.uploadedAt || doc.createdAt;
  return docDate && docDate.includes(today);
});
console.log('Documenti di oggi:', todayDocs.length);
todayDocs.forEach(doc => {
  console.log(`- ${doc.fileName || doc.name} - ${doc.clientName} - ${doc.status} - ${doc.uploadedAt || doc.createdAt}`);
});
