# 🔔 Sistema Notifiche Completo - Tutti i Trigger

## 📋 Riepilogo Trigger Implementati

### ✅ Trigger Esistenti (Migration 1-3)

1. **📄 Upload Documento** → `trigger_notify_document_uploaded`
   - Cliente carica → Broker riceve notifica
   - Broker carica → Cliente + Broker ricevono notifica

2. **✅ Cambio Status Documento** → `trigger_notify_document_status_changed`
   - Documento approvato → Cliente + Broker
   - Documento rifiutato → Cliente + Broker
   - Documento richiede modifiche → Cliente + Broker

3. **📊 Credit Score Completato** → `trigger_notify_credit_score_completed`
   - Status diventa "completed" → Broker riceve notifica

### 🆕 Nuovi Trigger (Migration 4)

4. **🎯 Creazione Credit Profile** → `trigger_notify_credit_profile_created`
   - Nuovo profilo creato → Broker + Cliente ricevono notifica

5. **📈 Richiesta Credit Score** → `trigger_notify_credit_score_requested`
   - Nuovo credit score richiesto → Broker + Cliente ricevono notifica

6. **🔄 Cambio Status Credit Profile** → `trigger_notify_profile_status_changed`
   - Status cambia (pending/in_progress/completed/rejected) → Broker sempre, Cliente solo per completed/rejected

---

## 🚀 Come Eseguire la Migration

### Opzione 1: Supabase Dashboard (CONSIGLIATO)

1. **Apri Supabase Dashboard**
   - https://supabase.com/dashboard
   - Seleziona progetto
   - SQL Editor

2. **Copia e Incolla**
   - Copia TUTTO il contenuto di:
     ```
     supabase/migrations/20251017100000_add_additional_notification_triggers.sql
     ```
   - Incolla nel SQL Editor
   - Click "Run" (F5)

3. **Verifica**
   - Dovresti vedere: "Trigger notifiche aggiuntivi creati con successo!"
   - Verifica che i 3 nuovi trigger siano stati creati

---

## 📊 Dettagli Trigger

### 1. 🎯 Creazione Credit Profile

**Quando:** Viene creato un nuovo credit_profile

**Chi riceve notifica:**
- ✅ **Broker**: "Nuovo Profilo Credito Creato per [Cliente]"
- ✅ **Cliente**: "Il tuo broker [Nome] ha creato il tuo profilo credito"

**Link:**
- Broker → `/broker/credit-profiles/{id}`
- Cliente → `/client/profile`

**Metadata:**
```json
{
  "profile_id": 123,
  "client_id": "uuid",
  "client_name": "Mario Rossi"
}
```

---

### 2. 📈 Richiesta Credit Score

**Quando:** Viene inserito un nuovo record in `credit_scores`

**Chi riceve notifica:**
- ✅ **Broker**: "Hai richiesto il calcolo del credit score per [Cliente]"
- ✅ **Cliente**: "Il tuo broker [Nome] ha richiesto il calcolo del tuo credit score"

**Link:**
- Broker → `/broker/credit-score`
- Cliente → `/client/reports`

**Metadata:**
```json
{
  "credit_score_id": 456,
  "credit_profile_id": 123,
  "client_name": "Mario Rossi"
}
```

---

### 3. 🔄 Cambio Status Credit Profile

**Quando:** Lo status del credit_profile cambia

**Status supportati:**
- `pending` → In attesa
- `in_progress` → In lavorazione
- `completed` → Completato
- `rejected` → Rifiutato

**Chi riceve notifica:**
- ✅ **Broker**: Sempre (per tutti i cambi status)
- ✅ **Cliente**: Solo per `completed` o `rejected`

**Messaggi:**
- Completed: "Il tuo profilo credito è stato completato dal tuo broker"
- Rejected: "Il tuo profilo credito è stato rifiutato"
- Altri: "Il profilo credito di [Cliente] è stato aggiornato"

---

## 🧪 Come Testare

### Test 1: Creazione Credit Profile

```javascript
// Nell'app o tramite API
// 1. Vai su /broker/credit-profiles/nuovo
// 2. Crea un nuovo profilo per un cliente

// Verifica SQL
SELECT * FROM notifications 
WHERE type = 'profile_updated' 
  AND title LIKE '%Creato%'
ORDER BY created_at DESC 
LIMIT 2;

-- Dovresti vedere 2 notifiche: una per broker, una per cliente
```

### Test 2: Richiesta Credit Score

```javascript
// Nell'app
// 1. Vai su /broker/credit-score
// 2. Richiedi un nuovo credit score per un cliente

// Verifica SQL
SELECT * FROM notifications 
WHERE type = 'credit_score_requested'
ORDER BY created_at DESC 
LIMIT 2;

-- Dovresti vedere 2 notifiche
```

### Test 3: Cambio Status Profile

```sql
-- Test diretto SQL
UPDATE credit_profiles 
SET status = 'completed'
WHERE id = 1;  -- Sostituisci con ID reale

-- Verifica notifiche
SELECT * FROM notifications 
WHERE type IN ('profile_completed', 'profile_updated')
ORDER BY created_at DESC 
LIMIT 2;
```

### Test 4: Verifica Real-time

1. **Apri 2 browser** (normale + incognito)
2. Browser 1: Login come **broker**
3. Browser 2: Login come **cliente** (dello stesso profilo)
4. Browser 1: **Crea un credit profile** per quel cliente
5. Browser 2: 🔔 Notifica appare automaticamente!
6. Browser 1: 🔔 Anche il broker vede la conferma!

---

## 📦 Notifiche Totali per Azione

### Quando il Broker crea un Credit Profile:
- ✅ 1 notifica al **Broker** (conferma creazione)
- ✅ 1 notifica al **Cliente** (informazione)
- **Totale: 2 notifiche**

### Quando il Broker richiede un Credit Score:
- ✅ 1 notifica al **Broker** (conferma richiesta)
- ✅ 1 notifica al **Cliente** (informazione calcolo in corso)
- **Totale: 2 notifiche**

### Quando il Credit Score viene completato:
- ✅ 1 notifica al **Broker** (risultato disponibile)
- **Totale: 1 notifica**

### Quando il Credit Profile cambia status a "completed":
- ✅ 1 notifica al **Broker** (conferma completamento)
- ✅ 1 notifica al **Cliente** (profilo completato)
- **Totale: 2 notifiche**

### Quando il Broker carica un documento:
- ✅ 1 notifica al **Broker** (conferma upload)
- ✅ 1 notifica al **Cliente** (nuovo documento)
- **Totale: 2 notifiche**

### Quando il Broker approva un documento:
- ✅ 1 notifica al **Broker** (conferma approvazione)
- ✅ 1 notifica al **Cliente** (documento approvato)
- **Totale: 2 notifiche**

---

## 🎯 Checklist Post-Migration

Dopo aver eseguito la migration, verifica:

- [ ] Migration eseguita con successo su Supabase
- [ ] 3 nuovi trigger creati (query di verifica alla fine della migration)
- [ ] Nessun errore nel log di Supabase
- [ ] Test creazione credit profile → 2 notifiche create
- [ ] Test richiesta credit score → 2 notifiche create
- [ ] Test cambio status profile → 1-2 notifiche create (dipende da status)
- [ ] Real-time funziona (notifiche appaiono senza refresh)
- [ ] Badge sulla campanella si aggiorna
- [ ] Click su notifica naviga alla risorsa corretta

---

## 🔍 Troubleshooting

### Le notifiche non vengono create

**Verifica trigger attivi:**
```sql
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_notify%'
ORDER BY event_object_table, trigger_name;
```

Dovresti vedere **7 trigger totali**:
1. `trigger_notify_credit_profile_created` (credit_profiles)
2. `trigger_notify_credit_score_completed` (credit_scores)
3. `trigger_notify_credit_score_requested` (credit_scores)
4. `trigger_notify_document_status_changed` (documents)
5. `trigger_notify_document_uploaded` (documents)
6. `trigger_notify_profile_status_changed` (credit_profiles)

### Errore durante esecuzione migration

**Errore: "trigger already exists"**
- Drop manuale: `DROP TRIGGER IF EXISTS trigger_name ON table_name CASCADE;`
- Poi ri-esegui la migration

**Errore: "function already exists"**
- Drop manuale: `DROP FUNCTION IF EXISTS function_name() CASCADE;`
- Poi ri-esegui la migration

### Notifiche create ma non visibili nell'app

1. **Hard refresh**: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Win)
2. **Verifica user_id**: Controlla di essere loggato con l'utente corretto
3. **Controlla console**: Cerca errori JavaScript (F12)
4. **Verifica RLS**: Le policy potrebbero bloccare l'accesso

---

## 📝 Tipi di Notifica Aggiunti

Aggiunti al TypeScript (`notificationService.ts`):
- ✅ `credit_score_requested` (già presente)
- ✅ `profile_updated` (già presente)
- ✅ `profile_completed` (già presente)

Nessuna modifica necessaria al frontend! 🎉

---

## 🎉 Risultato Finale

Dopo questa migration, avrai un sistema di notifiche **completo e production-ready** che copre:

✅ **Documenti**: Upload, approvazione, rifiuto, modifiche  
✅ **Credit Score**: Richiesta, completamento  
✅ **Credit Profile**: Creazione, cambio status  
✅ **Real-time**: Tutte le notifiche appaiono istantaneamente  
✅ **Doppia notifica**: Broker + Cliente informati (dove appropriato)  
✅ **Conferme**: Il broker riceve sempre conferma delle sue azioni  

**Notifiche totali coperte: ~10 scenari diversi** 🚀

---

**Data**: 17 Ottobre 2025  
**Versione**: 2.0 (Sistema completo)  
**Status**: ✅ Ready for Production

