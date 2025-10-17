# 🚀 Attiva le Notifiche ADESSO - Guida Rapida

## ⚠️ Situazione Attuale

✅ Tabella `notifications` creata (Migration 1 eseguita)  
❌ Trigger NON attivi (Migration 2 e 3 da eseguire)  
📊 0 notifiche nel database (i trigger mancano)

---

## 📝 AZIONE RICHIESTA (5 minuti)

### Step 1: Apri Supabase Dashboard

1. Vai su: **https://supabase.com/dashboard**
2. Fai login
3. Seleziona il progetto **creditprofile**
4. Click su **"SQL Editor"** nel menu laterale

---

### Step 2: Esegui Migration 2 (Trigger Base)

1. In SQL Editor, click su **"+ New Query"**
2. Apri il file: `supabase/migrations/20251016140000_add_notification_triggers.sql`
3. **Copia TUTTO il contenuto** (Cmd+A, Cmd+C)
4. **Incolla** nel SQL Editor di Supabase (Cmd+V)
5. Click su **"Run"** (o premi F5)
6. ✅ Dovresti vedere: "Success. No rows returned"

**Cosa crea questa migrazione:**
- ✅ Trigger per notificare broker quando cliente carica documento
- ✅ Trigger per notificare cliente quando documento cambia status
- ✅ Trigger per notificare broker quando credit score completato
- ✅ Trigger per notificare broker quando credit profile completato

---

### Step 3: Esegui Migration 3 (Fix Upload)

1. In SQL Editor, click su **"+ New Query"** (nuova query)
2. Apri il file: `supabase/migrations/20251016150000_fix_document_upload_notifications.sql`
3. **Copia TUTTO il contenuto** (Cmd+A, Cmd+C)
4. **Incolla** nel SQL Editor di Supabase (Cmd+V)
5. Click su **"Run"** (o premi F5)
6. ✅ Dovresti vedere: "Success. No rows returned"

**Cosa fa questa migrazione:**
- ✅ Aggiorna documenti esistenti con `uploaded_by_user_id`
- ✅ Migliora trigger per distinguere broker/cliente
- ✅ Evita auto-notifiche
- ✅ Aggiunge notifiche di conferma per broker

---

### Step 4: Verifica che i Trigger Siano Attivi

1. In SQL Editor, crea una **nuova query**
2. Copia e incolla questo:

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

3. Click su **"Run"**
4. ✅ Dovresti vedere **4 trigger**:
   - `trigger_notify_credit_score_completed` (credit_scores)
   - `trigger_notify_document_status_changed` (documents)
   - `trigger_notify_document_uploaded` (documents)
   - `trigger_notify_profile_status_changed` (credit_profiles)

---

### Step 5: Verifica Locale

Torna nel terminale e lancia:

```bash
node verifica-notifiche.cjs
```

✅ Dovresti vedere: "TUTTO OK! Le notifiche funzionano."

---

## 🧪 Test Rapido (Dopo le Migrazioni)

### Test 1: Upload Documento

1. **Apri l'app locale** (se non è attiva: `npm run dev`)
2. **Login come broker**
3. Vai su **"Clienti"** → Seleziona un cliente
4. **Carica un documento PDF**
5. 🔔 **Controlla la campanella** → Dovresti vedere una notifica!
   - "Hai caricato il documento 'X' per [Cliente]"

### Test 2: Approva Documento

1. Vai su **"Documenti"**
2. Cambia lo status di un documento → **"Approvato"**
3. 🔔 **Controlla la campanella** → Dovresti vedere:
   - "Hai approvato il documento 'X' di [Cliente]"

### Test 3: Real-time

1. Apri **2 finestre browser** (normale + incognito)
2. Finestra 1: Login come **broker**
3. Finestra 2: Login come **cliente** (usa le credenziali di test)
4. Finestra 2: **Carica un documento**
5. Finestra 1: 🔔 La notifica **appare automaticamente** (senza refresh!)

---

## 🎯 Cosa Succede Dopo

Una volta eseguite le migrazioni, **le notifiche funzioneranno automaticamente** per:

✅ Upload documenti (broker ← cliente)  
✅ Upload documenti (cliente ← broker, con conferma a broker)  
✅ Approvazione documenti (cliente + broker)  
✅ Rifiuto documenti (cliente + broker)  
✅ Richiesta modifiche (cliente + broker)  
✅ Credit score completato (broker)  
✅ Credit profile completato (broker)  

**Real-time:** Le notifiche appaiono istantaneamente grazie a Supabase Realtime ⚡

---

## 🐛 Troubleshooting

### Errore durante esecuzione Migration 2 o 3

**Errore: "trigger already exists"**
- ✅ Va bene! Significa che il trigger è già stato creato
- Skip al prossimo step

**Errore: "function already exists"**
- ✅ Va bene! La funzione esiste già
- Skip al prossimo step

**Errore: "permission denied"**
- ❌ Verifica di essere loggato con l'account giusto su Supabase
- ❌ Verifica di avere permessi di amministratore sul progetto

### Notifiche non appaiono dopo le migrazioni

1. **Hard refresh** dell'app: Cmd+Shift+R (Mac) o Ctrl+Shift+R (Win)
2. **Riavvia il server locale**: 
   ```bash
   npm run dev
   ```
3. **Verifica di essere loggato come broker**
4. **Controlla la console del browser** (F12) per errori
5. **Verifica che i trigger siano attivi** (Step 4 sopra)

### Verifica notifica manualmente

Per testare manualmente, puoi creare una notifica di test:

```sql
INSERT INTO public.notifications (user_id, type, title, message, link)
VALUES (
  'IL_TUO_USER_ID', -- Sostituisci con il tuo user_id (UUID del broker)
  'system_alert',
  'Test Notifica',
  'Questa è una notifica di test',
  '/broker/dashboard'
);
```

Poi ricarica l'app → Dovresti vedere la notifica nella campanella.

---

## ✅ Checklist Completa

Prima di procedere:

- [ ] Ho aperto Supabase Dashboard
- [ ] Ho eseguito Migration 2 (trigger base)
- [ ] Ho eseguito Migration 3 (fix upload)
- [ ] Ho verificato che i 4 trigger siano attivi
- [ ] Ho eseguito `node verifica-notifiche.cjs` e vedo "TUTTO OK"
- [ ] Ho testato caricando un documento
- [ ] Ho visto la notifica nella campanella 🔔
- [ ] Le notifiche appaiono in real-time (senza refresh)

---

## 📞 Se Hai Problemi

1. **Controlla il file di log**: `.cursor/agent-tools/*.txt`
2. **Verifica env**: Controlla che `.env` abbia `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. **Console browser**: Apri F12 e controlla errori JavaScript
4. **Supabase logs**: Vai su Dashboard > Logs per vedere errori del database

---

## 🎉 Risultato Finale

Dopo questi step, avrai:

✅ Sistema di notifiche **completamente funzionante**  
✅ **Real-time** (senza refresh)  
✅ **Badge rosso** sulla campanella con numero non lette  
✅ **Dropdown** con ultime 10 notifiche  
✅ **Pagina completa** `/broker/notifications` con tutte le notifiche  
✅ **Click su notifica** → Navigazione alla risorsa  
✅ **Storico completo** di tutte le azioni

---

**Tempo stimato:** 5-10 minuti  
**Difficoltà:** Facile (copia-incolla SQL)  
**Risultato:** Sistema notifiche production-ready ✨

---

**Pronto?** Apri Supabase Dashboard e inizia! 🚀

