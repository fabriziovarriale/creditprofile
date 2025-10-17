# 🚀 Guida: Eseguire Migrazioni Notifiche in Produzione

## ❌ Problema

Le notifiche non funzionano perché i **trigger del database non sono stati creati**.

## ✅ Soluzione

Eseguire 3 migrazioni SQL su Supabase Dashboard.

---

## 📋 Passo-Passo

### 1️⃣ Apri Supabase Dashboard

1. Vai su: https://supabase.com/dashboard
2. **Login** con le tue credenziali
3. Seleziona il progetto **"creditprofile"**
4. Nel menu laterale, cerca **"SQL Editor"** (icona 📝)
5. Click su **"SQL Editor"**

---

### 2️⃣ Esegui Migration 1: Crea Tabella Notifications

**File**: `supabase/migrations/20251016130000_create_notifications_table.sql`

**Passaggi**:
1. Nel SQL Editor, click su **"+ New query"**
2. Apri il file sul tuo computer:
   ```
   /Users/macbookpro/Developer/creditprofile/creditprofile/supabase/migrations/20251016130000_create_notifications_table.sql
   ```
3. **Copia TUTTO il contenuto** del file
4. **Incolla** nel SQL Editor di Supabase
5. Click sul pulsante **"RUN"** (in basso a destra)
6. **Attendi** il completamento (dovrebbe dire "Success")

**Cosa fa**:
- Crea la tabella `notifications`
- Crea l'ENUM `notification_type`
- Crea funzioni helper
- Imposta RLS policies

**Verifica**:
```sql
SELECT COUNT(*) FROM notifications;
```
Dovrebbe restituire `0` (tabella vuota ma creata).

---

### 3️⃣ Esegui Migration 2: Crea Trigger Notifiche

**File**: `supabase/migrations/20251016140000_add_notification_triggers.sql`

**Passaggi**:
1. Nel SQL Editor, click su **"+ New query"** (nuova query)
2. Apri il file:
   ```
   /Users/macbookpro/Developer/creditprofile/creditprofile/supabase/migrations/20251016140000_add_notification_triggers.sql
   ```
3. **Copia TUTTO il contenuto**
4. **Incolla** nel SQL Editor
5. Click **"RUN"**
6. Attendi "Success"

**Cosa fa**:
- Crea trigger per documento caricato
- Crea trigger per documento status cambiato
- Crea trigger per credit score completato
- Crea trigger per credit profile completato

**Verifica**:
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE 'trigger_notify%';
```
Dovresti vedere 4 trigger.

---

### 4️⃣ Esegui Migration 3: Fix Upload Documenti

**File**: `supabase/migrations/20251016150000_fix_document_upload_notifications.sql`

**Passaggi**:
1. Nel SQL Editor, click su **"+ New query"**
2. Apri il file:
   ```
   /Users/macbookpro/Developer/creditprofile/creditprofile/supabase/migrations/20251016150000_fix_document_upload_notifications.sql
   ```
3. **Copia TUTTO il contenuto**
4. **Incolla** nel SQL Editor
5. Click **"RUN"**
6. Attendi "Success"

**Cosa fa**:
- Aggiorna il trigger `notify_document_uploaded`
- Distingue se è broker o cliente a caricare
- Invia notifiche corrette a entrambi

**Verifica**:
```sql
SELECT proname FROM pg_proc 
WHERE proname = 'notify_document_uploaded';
```
Dovrebbe restituire 1 riga.

---

## ✅ Test Finale

Dopo aver eseguito TUTTE e 3 le migrazioni:

### Test 1: Carica un Documento

1. **Login** sulla web app come broker
2. Vai su **"Clienti"** → Seleziona un cliente
3. **Carica un documento PDF**
4. **Guarda la campanella 🔔** in alto a destra

**Risultato atteso**:
- Badge rosso con "1"
- Click → Vedi notifica: "Hai caricato il documento..."

### Test 2: Approva un Documento

1. Vai su **"Documenti"**
2. Seleziona un documento
3. Cambia status → **"Approved"**
4. **Guarda la campanella 🔔**

**Risultato atteso**:
- Badge rosso aggiornato
- Click → Vedi notifica: "Hai approvato il documento..."

### Test 3: Verifica nel Database

Esegui questa query nel SQL Editor:

```sql
SELECT id, type, title, message, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

**Risultato atteso**:
- Vedi le notifiche che hai generato nei test 1 e 2

---

## 🐛 Troubleshooting

### Errore durante Migration 1

**Errore**: `type "notification_type" already exists`

**Soluzione**: La migration è già stata eseguita parzialmente. Salta alla Migration 2.

### Errore durante Migration 2

**Errore**: `trigger "trigger_notify_document_uploaded" already exists`

**Soluzione**: 
```sql
DROP TRIGGER IF EXISTS trigger_notify_document_uploaded ON documents;
```
Poi ri-esegui la migration.

### Errore durante Migration 3

**Errore**: `function "notify_document_uploaded" does not exist`

**Soluzione**: Assicurati di aver eseguito Migration 2 prima.

### Le notifiche non appaiono ancora

**Verifica**:
1. Hard refresh del browser (Cmd+Shift+R)
2. Controlla console browser (F12) per errori
3. Verifica che il NotificationProvider sia attivo:
   ```
   Console → Cerca "NotificationContext" o "useNotifications"
   ```

### Badge campanella sempre a 0

**Verifica**:
1. Esegui query:
   ```sql
   SELECT COUNT(*) FROM notifications WHERE read = false;
   ```
2. Se risultato > 0 ma badge = 0 → problema frontend
3. Se risultato = 0 → i trigger non stanno creando notifiche

---

## 📊 Checklist Completa

Dopo le migrazioni, verifica:

- [ ] Migration 1 eseguita (tabella notifications esiste)
- [ ] Migration 2 eseguita (4 trigger creati)
- [ ] Migration 3 eseguita (trigger aggiornato)
- [ ] Test carica documento → Notifica appare
- [ ] Test approva documento → Notifica appare
- [ ] Badge campanella si aggiorna
- [ ] Click notifica → Naviga alla risorsa
- [ ] Pagina `/broker/notifications` accessibile

---

## 🎯 Verifica Rapida

Esegui questa query nel SQL Editor per verificare tutto:

```sql
-- 1. Verifica tabella notifications
SELECT 'Tabella notifications' as check, COUNT(*) as result FROM notifications;

-- 2. Verifica trigger
SELECT 'Trigger attivi' as check, COUNT(*) as result 
FROM information_schema.triggers 
WHERE trigger_name LIKE 'trigger_notify%';

-- 3. Verifica funzioni
SELECT 'Funzioni notifica' as check, COUNT(*) as result 
FROM pg_proc 
WHERE proname LIKE 'notify_%';

-- 4. Verifica ENUM types
SELECT 'Tipo notification_type' as check, COUNT(*) as result 
FROM pg_type 
WHERE typname = 'notification_type';
```

**Risultati attesi**:
- Tabella notifications: 0+ (dipende da quante notifiche hai)
- Trigger attivi: 4
- Funzioni notifica: 5+
- Tipo notification_type: 1

---

## 📝 Note Importanti

1. **Ordine**: Esegui le migrazioni nell'ordine 1 → 2 → 3
2. **Errori**: Se vedi errori, non panico. Leggi il messaggio e cerca nella sezione Troubleshooting
3. **Backup**: Supabase fa backup automatici, ma se vuoi essere sicuro, fai uno snapshot prima
4. **Tempo**: Ogni migration dovrebbe richiedere < 10 secondi
5. **RLS**: Le policies sono già incluse, non serve configurare altro

---

## 🆘 Se Nulla Funziona

1. **Verifica URL database**: Assicurati di essere sul progetto giusto
2. **Permessi**: Verifica di avere permessi admin su Supabase
3. **Console errori**: Apri DevTools (F12) e cerca errori JavaScript
4. **Contatta**: Se tutto fallisce, condividi gli errori del SQL Editor

---

**Buona fortuna!** 🚀

Dopo le migrazioni, le notifiche dovrebbero funzionare immediatamente!

---

**Data**: 16 Ottobre 2025  
**Versione**: 1.0

