# 🔔 Notifiche Attive - Riepilogo Completo

## ✅ Notifiche Implementate e Funzionanti

### 1. 📄 **Documento Caricato**

#### Scenario A: Cliente carica documento
- **Chi carica**: Cliente
- **Chi riceve notifica**: **Broker**
- **Messaggio broker**: "{Cliente} ha caricato un nuovo documento: {nome_file}"
- **Link**: `/broker/documents`
- **Quando**: Appena il cliente fa upload di un PDF/documento

#### Scenario B: Broker carica documento per cliente  
- **Chi carica**: Broker
- **Chi riceve notifica**: **Cliente + Broker (conferma)**
- **Messaggio cliente**: "Il tuo broker {Nome} ha caricato un documento: {nome_file}"
- **Messaggio broker**: "Hai caricato il documento '{nome_file}' per {Cliente}"
- **Link**: `/client/documents` (cliente), `/broker/documents` (broker)
- **Quando**: Appena il broker fa upload per il cliente

**✅ Aggiornato**: 
- Il broker riceve **sempre** una notifica di conferma quando esegue azioni
- Il cliente riceve notifica quando il broker carica per lui

---

### 2. ✅ **Documento Approvato**

- **Chi riceve**: **Cliente + Broker (conferma)**
- **Quando**: Broker cambia status documento → `approved`
- **Messaggio cliente**: "Il tuo documento '{nome_file}' è stato approvato"
- **Messaggio broker**: "Hai approvato il documento '{nome_file}' di {Cliente}"
- **Link**: `/client/documents` (cliente), `/broker/documents` (broker)
- **Trigger**: Database (automatico su UPDATE status)

---

### 3. ❌ **Documento Rifiutato**

- **Chi riceve**: **Cliente + Broker (conferma)**
- **Quando**: Broker cambia status documento → `rejected`
- **Messaggio cliente**: "Il documento '{nome_file}' è stato rifiutato"
- **Messaggio broker**: "Hai rifiutato il documento '{nome_file}' di {Cliente}"
- **Link**: `/client/documents` (cliente), `/broker/documents` (broker)
- **Trigger**: Database (automatico su UPDATE status)

---

### 4. ⚠️ **Documento Richiede Modifiche**

- **Chi riceve**: **Cliente + Broker (conferma)**
- **Quando**: Broker cambia status documento → `requires_changes`
- **Messaggio cliente**: "Il documento '{nome_file}' richiede delle modifiche"
- **Messaggio broker**: "Hai richiesto modifiche per '{nome_file}' di {Cliente}"
- **Link**: `/client/documents` (cliente), `/broker/documents` (broker)
- **Trigger**: Database (automatico su UPDATE status)

---

### 5. 📊 **Credit Score Completato**

- **Chi riceve**: Broker
- **Quando**: Credit score status → `completed`
- **Messaggio**: "Credit score per {Cliente} completato con punteggio: {score}"
- **Link**: `/broker/credit-score`
- **Trigger**: Database (automatico su UPDATE status)

---

### 6. 🎯 **Credit Profile Completato**

- **Chi riceve**: Broker
- **Quando**: Credit profile status → `completed`
- **Messaggio**: "Il profilo credito per {Cliente} è stato completato"
- **Link**: `/broker/credit-profiles/{id}`
- **Trigger**: Database (automatico su UPDATE status)

---

## 🔧 Come Funziona Tecnicamente

### Upload Documento (Fix Applicato)

**Prima del Fix**:
```typescript
uploaded_by_user_id: client.id  // ❌ Sempre il cliente
```

**Dopo il Fix**:
```typescript
uploaded_by_user_id: brokerUser.id  // ✅ Chi è loggato (broker o cliente)
```

**Trigger Database**:
```sql
-- Se uploaded_by = broker_id → Notifica cliente
-- Se uploaded_by != broker_id → Notifica broker
```

---

## 📋 Migrazioni da Eseguire

### Migration 3 (NUOVO - FIX)
```bash
File: supabase/migrations/20251016150000_fix_document_upload_notifications.sql
```

**Cosa fa**:
- ✅ Aggiorna il trigger `notify_document_uploaded()`
- ✅ Distingue se è il broker o il cliente a caricare
- ✅ Invia la notifica alla persona giusta
- ✅ Aggiorna i documenti esistenti per avere `uploaded_by_user_id`

**⚠️ IMPORTANTE**: Eseguire questa migration DOPO le prime 2!

---

## 🧪 Test Completo

### Test 1: Broker Carica Documento per Cliente

1. **Login come broker**
2. Vai su "Clienti" → Seleziona un cliente
3. Carica un documento PDF
4. **Guarda la campanella 🔔** → Dovresti vedere:
   - **Titolo**: "Documento caricato con successo"
   - **Messaggio**: "Hai caricato il documento 'X' per {Cliente}"
5. **Logout**
6. **Login come quel cliente**
7. Guarda campanella 🔔 → Dovresti vedere:
   - **Titolo**: "Nuovo documento aggiunto"
   - **Messaggio**: "Il tuo broker {Nome} ha caricato un documento: ..."
   
**✅ RISULTATO ATTESO**: Entrambi ricevono notifica (broker = conferma, cliente = informazione)

### Test 2: Cliente Carica Documento

1. **Login come cliente**
2. Vai su "Documenti"
3. Carica un PDF
4. **Logout**
5. **Login come broker** (associato a quel cliente)
6. Guarda campanella 🔔 → Dovresti vedere:
   - **Titolo**: "Nuovo documento caricato"
   - **Messaggio**: "{Cliente} ha caricato un nuovo documento: ..."
   
**✅ RISULTATO ATTESO**: Broker riceve notifica, cliente NO

### Test 3: Approva/Rifiuta Documento

1. **Login come broker**
2. Vai su "Documenti"
3. Cambia status documento → "Approvato"
4. **Guarda la campanella 🔔** → Dovresti vedere:
   - **Titolo**: "Documento approvato"
   - **Messaggio**: "Hai approvato il documento 'X' di {Cliente}"
5. **Logout**
6. **Login come cliente**
7. Guarda campanella 🔔 → Dovresti vedere:
   - **Titolo**: "Documento approvato"
   - **Messaggio**: "Il tuo documento 'X' è stato approvato"

**✅ RISULTATO ATTESO**: Entrambi ricevono notifica (broker = conferma, cliente = informazione)

### Test 4: Real-time

1. Apri **2 browser** (normale + incognito)
2. Browser 1: Login come broker
3. Browser 2: Login come cliente
4. Browser 2: Carica documento
5. Browser 1: **Notifica appare automaticamente** (senza refresh!)

**✅ RISULTATO ATTESO**: Notifica real-time funziona

---

## 🐛 Troubleshooting

### Problema: Broker riceve notifica quando carica lui stesso

**Causa**: Migration 3 non eseguita o `uploaded_by_user_id` non impostato correttamente

**Soluzione**:
1. Esegui migration `20251016150000_fix_document_upload_notifications.sql`
2. Verifica che `DocumentUploadForm.tsx` usi `brokerUser.id`
3. Controlla che il trigger sia aggiornato:
   ```sql
   SELECT trigger_name, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_notify_document_uploaded';
   ```

### Problema: Notifica non arriva a nessuno

**Causa**: Trigger non attivo o `broker_id` NULL

**Soluzione**:
1. Verifica che il credit profile abbia `broker_id`:
   ```sql
   SELECT id, client_id, broker_id FROM credit_profiles;
   ```
2. Controlla trigger:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name LIKE 'trigger_notify%';
   ```

---

## 📊 Riepilogo Visivo

```
🏦 BROKER                          👤 CLIENTE
   |                                   |
   |-- Carica documento -------------> 🔔 Notifica
   🔔 (conferma)                       |
   |                                   |
   🔔 Notifica <-- Carica documento ---|
   |                                   |
   |-- Approva documento ------------> 🔔 Notifica
   🔔 (conferma)                       |
   |                                   |
   |-- Rifiuta documento ------------> 🔔 Notifica
   🔔 (conferma)                       |
   |                                   |
   🔔 <-- Credit score ready --------- (nessuna)
   |                                   |
```

**Il broker riceve SEMPRE conferma delle sue azioni + notifiche da eventi esterni**

---

## ✅ Checklist Finale

Dopo deploy, verifica:

- [ ] Migration 1 eseguita (tabella notifications)
- [ ] Migration 2 eseguita (trigger base + conferme broker)
- [ ] Migration 3 eseguita (fix upload documenti)
- [ ] Broker carica documento → Broker + Cliente ricevono notifica ✅
- [ ] Cliente carica documento → Broker riceve notifica
- [ ] Broker approva documento → Broker + Cliente ricevono notifica ✅
- [ ] Broker rifiuta documento → Broker + Cliente ricevono notifica ✅
- [ ] Real-time funziona (notifiche senza refresh)
- [ ] Campanella mostra badge rosso con conteggio
- [ ] Click su notifica naviga alla risorsa
- [ ] Pagina `/broker/notifications` accessibile

---

## 📝 File Modificati (Fix)

**Nuovi**:
- ✅ `supabase/migrations/20251016150000_fix_document_upload_notifications.sql`

**Aggiornati**:
- ✅ `src/components/broker/DocumentUploadForm.tsx` (usa `brokerUser.id`)

---

**Data**: 16 Ottobre 2025  
**Versione**: 1.1 (con fix)  
**Status**: ✅ Ready for Production

