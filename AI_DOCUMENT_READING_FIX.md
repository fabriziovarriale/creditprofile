# Fix: AI non riesce a leggere i documenti caricati

## 🔴 Problema

In produzione, l'agente AI rispondeva:
> "Tuttavia, non ho accesso diretto al contenuto dei documenti. **Non posso leggere o estrarre informazioni specifiche** come il codice fiscale dai documenti caricati."

Questo nonostante il sistema estragga il contenuto dei PDF e lo salvi nel database.

## 🔍 Analisi del Problema

### Come funziona il sistema
1. **Caricamento PDF** → Il file viene salvato in Supabase Storage
2. **Estrazione contenuto** → `pdfExtractionService.ts` estrae il testo usando PDF.js
3. **Salvataggio** → Il testo estratto viene salvato in `documents.extracted_content`
4. **Prompt AI** → L'AI service recupera il contenuto e lo include nel system message
5. **Risposta AI** → L'AI dovrebbe leggere il contenuto e rispondere

### Cause Identificate

1. **Prompt poco chiaro**: L'AI (Groq Llama 3.3) non capiva di avere accesso al contenuto
2. **Contenuto limitato**: Solo 300 caratteri per documento erano troppo pochi
3. **Documenti vecchi**: I documenti caricati prima della migration potrebbero non avere `extracted_content`

## ✅ Soluzione Implementata

### 1. Prompt AI Migliorato
- ✅ Aggiunta sezione **"⚠️ IMPORTANTE - ACCESSO AI DOCUMENTI"**
- ✅ Istruzioni esplicite che l'AI HA accesso al contenuto
- ✅ Aumentato limite caratteri da 300 a 1000 per documento

### 2. Script di Debug
Creati due nuovi script per diagnosticare il problema:

#### `check-extracted-documents.js`
Verifica quanti documenti hanno contenuto estratto:
```bash
node check-extracted-documents.js
```

Output:
- Statistiche documenti con/senza contenuto estratto
- Status estrazione (completed/pending/failed)
- Raccomandazioni per il fix

#### `debug-ai-prompt.js`
Simula cosa riceve l'AI nel prompt:
```bash
node debug-ai-prompt.js [broker_id]
```

Output:
- Contenuto disponibile per ogni cliente
- Preview del prompt generato
- Stima dimensione token per Groq

## 🔧 Come Verificare il Fix

### Passo 1: Verificare Documenti Esistenti
```bash
node check-extracted-documents.js
```

Se l'output dice **"Nessun documento con contenuto estratto"**:
- ⚠️ I documenti esistenti NON hanno contenuto estratto
- 💡 Soluzione: Ri-caricare i documenti per triggerare l'estrazione

### Passo 2: Testare Nuovo Caricamento PDF
1. Vai su Credit Profile di un cliente
2. Carica un nuovo PDF
3. Apri la console del browser (F12)
4. Cerca log tipo:
   ```
   📄 Estrazione contenuto PDF per l'AI...
   ✅ Contenuto PDF estratto e salvato per l'AI
   ```

Se vedi questi log → **Estrazione funzionante! ✅**

Se vedi errori → Vedi sezione "Troubleshooting" sotto

### Passo 3: Testare AI Chat
1. Apri l'AI Chat (icona robot in basso a destra)
2. Chiedi: "Dammi il codice fiscale presente nel documento di [nome cliente]"
3. L'AI dovrebbe:
   - ✅ Cercare nel contenuto estratto
   - ✅ Fornire il codice fiscale se presente
   - ❌ NON dire "non ho accesso ai documenti"

## 🚨 Troubleshooting

### Problema: PDF.js Worker version mismatch

**Sintomo**: Console browser mostra errori tipo:
```
The API version "5.4.149" does not match the Worker version "3.11.174"
```

**Causa**: Il worker CDN aveva una versione hardcoded (3.11.174) diversa dal package installato (5.4.149).

**Soluzione**: ✅ **FIXATO** - Aggiornato worker a versione 5.4.149 in `pdfExtractionService.ts`

Se il problema persiste:
1. Verifica che il CDN sia accessibile: https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs
2. Se bloccato, modifica `src/services/pdfExtractionService.ts`:
   ```typescript
   // Cambia CDN se unpkg.com è bloccato
   GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
   ```

### Problema: Documenti vecchi senza contenuto estratto

**Sintomo**: `check-extracted-documents.js` mostra "Nessun contenuto estratto"

**Soluzione**:
1. **Opzione A - Ri-caricamento manuale** (consigliata):
   - Scarica i PDF da Supabase Storage
   - Elimina i documenti vecchi
   - Ri-carica i PDF tramite UI
   
2. **Opzione B - Script di ri-processamento** (avanzato):
   - Richiederebbe accesso ai file originali da Supabase Storage
   - Non implementato per sicurezza
   - Richiede permessi storage admin

### Problema: AI continua a dire "non ho accesso"

**Sintomo**: Anche con documenti estratti, l'AI risponde che non ha accesso

**Possibili cause**:
1. **Contenuto non nel DB**: Verifica con `debug-ai-prompt.js`
2. **Broker ID sbagliato**: L'AI filtra per broker_id
3. **Credit Profile mancante**: Il documento deve essere collegato a un credit_profile
4. **Prompt troppo lungo**: Se >6000 token, Groq potrebbe troncare

**Debug**:
```bash
# Verifica cosa riceve l'AI
node debug-ai-prompt.js [your_broker_id]

# Se output mostra "Nessun contenuto disponibile per l'AI"
# → I documenti non sono collegati correttamente
```

## 📋 Checklist Deploy Produzione

Prima di deployare, verifica:

- [x] Modifiche a `src/services/ai.ts` committate
- [x] Migration `20250912130000_add_document_content.sql` eseguita in produzione
- [ ] Testato caricamento nuovo PDF in produzione
- [ ] Verificato che l'AI legga il contenuto con `debug-ai-prompt.js`
- [ ] Ri-caricati documenti critici per avere contenuto estratto
- [ ] Testato AI chat con query su documenti

## 🎯 Risultato Atteso

Dopo il fix, l'AI dovrebbe:

✅ **Leggere il contenuto dei PDF**
```
User: "Qual è il codice fiscale nel documento di Mario Rossi?"
AI: "Nel documento di Mario Rossi ho trovato il codice fiscale: RSSMRA80A01H501Z"
```

✅ **Estrarre informazioni specifiche**
```
User: "Che informazioni ci sono nella busta paga di Elena Bianchi?"
AI: "Nella busta paga di Elena Bianchi trovo:
- Datore di lavoro: ABC S.r.l.
- Periodo: Gennaio 2025
- Retribuzione netta: €2.450,00"
```

✅ **Indicare se il documento non è processato**
```
User: "Cosa c'è nel documento X?"
AI: "Il documento X non è ancora stato processato per l'estrazione del contenuto. 
Prova a ri-caricarlo per permettermi di analizzarlo."
```

❌ **NON dire mai**:
- "Non ho accesso diretto al contenuto dei documenti"
- "Non posso leggere o estrarre informazioni"

## 📝 Note Tecniche

### Colonne Database
```sql
ALTER TABLE documents 
ADD COLUMN extracted_content TEXT NULL,
ADD COLUMN extraction_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN content_metadata JSONB NULL;
```

### Stati Estrazione
- `pending`: In attesa di estrazione (default)
- `completed`: Estrazione completata con successo
- `failed`: Estrazione fallita (PDF corrotto, worker errore, etc.)

### Limiti Tecnici
- **PDF.js**: Estrae solo testo (non immagini)
- **Groq Llama 3.3**: Max ~8000 token input
- **Caratteri per documento**: 1000 (aumentabile se necessario)
- **Storage Supabase**: File caricati rimangono separati

## 🔗 File Modificati

- `src/services/ai.ts` - Prompt migliorato con istruzioni esplicite
- `src/services/pdfExtractionService.ts` - Estrazione PDF (già esistente)
- `check-extracted-documents.js` - Script verifica (nuovo)
- `debug-ai-prompt.js` - Script debug prompt (nuovo)

## ❓ Domande Frequenti

**Q: L'estrazione funziona anche per PDF scannerizzati (immagini)?**
A: No, PDF.js estrae solo testo. Per PDF scannerizzati serve OCR (non implementato).

**Q: Posso ri-processare documenti esistenti senza ri-caricarli?**
A: Tecnicamente sì, ma richiederebbe scaricare i file da Storage e ri-processarli. Non implementato per sicurezza.

**Q: Come posso vedere il contenuto estratto di un documento?**
A: Usa `check_document.js` con il nome del file, oppure query SQL:
```sql
SELECT file_name, extracted_content, extraction_status 
FROM documents 
WHERE file_name ILIKE '%nome_file%';
```

**Q: L'AI può analizzare anche immagini nei documenti?**
A: No, solo testo estratto. Per immagini serve vision model (es. GPT-4 Vision).

---

**Data Fix**: 16 Ottobre 2025  
**Versione**: 1.0  
**Autore**: AI Assistant

