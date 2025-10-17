# 🔔 Attiva le Notifiche in Locale - GUIDA COMPLETA

## 📊 Stato Attuale

### ✅ Cosa Funziona GIÀ
- ✅ Frontend completo (NotificationContext, Header, Pagina notifiche)
- ✅ Tabella `notifications` creata nel database
- ✅ Real-time subscription attiva
- ✅ UI con campanella, badge, dropdown

### ❌ Cosa Manca
- ❌ Trigger del database NON attivi
- ❌ 0 notifiche nel database

**PROBLEMA:** I trigger che creano automaticamente le notifiche non sono stati eseguiti.

---

## 🚀 SOLUZIONE RAPIDA (10 minuti)

### Opzione 1: Esecuzione Manuale su Supabase Dashboard (CONSIGLIATA)

#### Step 1: Apri Supabase Dashboard

1. Vai su: https://supabase.com/dashboard
2. Login
3. Seleziona progetto **creditprofile**
4. Click su **"SQL Editor"** (icona </> nel menu laterale)

#### Step 2: Esegui Migration 2 (Trigger Base)

1. Click su **"+ New Query"**
2. **Copia** tutto il contenuto del file:
   ```
   supabase/migrations/20251016140000_add_notification_triggers.sql
   ```
3. **Incolla** nel SQL Editor
4. Click su **"Run"** (pulsante verde in basso a destra o F5)
5. ✅ Attendi: "Success. No rows returned"

**Cosa crea:**
- Trigger per notificare broker quando cliente carica documento
- Trigger per notificare cliente quando documento cambia status (approved/rejected/requires_changes)
- Trigger per notificare broker quando credit score completato
- Trigger per notificare broker quando credit profile completato

#### Step 3: Esegui Migration 3 (Fix Upload Documenti)

1. Click su **"+ New Query"** (nuova query)
2. **Copia** tutto il contenuto del file:
   ```
   supabase/migrations/20251016150000_fix_document_upload_notifications.sql
   ```
3. **Incolla** nel SQL Editor
4. Click su **"Run"**
5. ✅ Attendi: "Success. No rows returned"

**Cosa fa:**
- Aggiorna documenti esistenti con campo `uploaded_by_user_id`
- Migliora trigger per distinguere upload broker vs cliente
- Aggiunge notifiche di conferma per broker
- Evita auto-notifiche

#### Step 4: Verifica Trigger Attivi

1. In SQL Editor, **nuova query**
2. Copia e incolla:

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
4. ✅ **Dovresti vedere 4 trigger:**
   - `trigger_notify_credit_score_completed` su `credit_scores`
   - `trigger_notify_document_status_changed` su `documents`
   - `trigger_notify_document_uploaded` su `documents`
   - `trigger_notify_profile_status_changed` su `credit_profiles`

---

### Opzione 2: Script Automatico (Alternativa)

Se hai privilegi admin su Supabase, puoi usare lo script:

```bash
node esegui-migrazioni-notifiche.cjs
```

**Nota:** Questo script potrebbe non funzionare per limitazioni dell'API. Se fallisce, usa l'Opzione 1.

---

## 🧪 TEST DELLE NOTIFICHE

Dopo aver eseguito le migrazioni, testa il sistema:

### Test 1: Verifica Database

Nel terminale:

```bash
node verifica-notifiche.cjs
```

✅ Dovresti vedere: **"TUTTO OK! Le notifiche funzionano."**

### Test 2: Carica un Documento

1. **Avvia il server locale** (se non è attivo):
   ```bash
   npm run dev
   ```

2. **Apri browser**: http://localhost:5173

3. **Login come broker**

4. Vai su **"Clienti"** → Seleziona un cliente

5. **Carica un documento PDF**

6. 🔔 **VERIFICA:**
   - La campanella in alto a destra dovrebbe mostrare un **badge rosso con "1"**
   - Click sulla campanella → Vedi notifica:
     - "Hai caricato il documento 'X' per [Cliente]"

### Test 3: Approva un Documento

1. Vai su **"Documenti"**

2. Trova un documento e cambia status → **"Approvato"**

3. 🔔 **VERIFICA:**
   - Badge rosso incrementa
   - Nuova notifica: "Hai approvato il documento 'X' di [Cliente]"

### Test 4: Real-time (Bonus)

1. Apri **2 finestre browser**:
   - Finestra 1: Normale
   - Finestra 2: Incognito

2. Finestra 1: Login come **broker**

3. Finestra 2: Login come **cliente** (se hai credenziali di test)

4. Finestra 2: **Carica un documento**

5. Finestra 1: 🔔 **La notifica appare automaticamente** (senza refresh!)

---

## 📋 Checklist Finale

- [ ] Ho eseguito Migration 2 su Supabase Dashboard
- [ ] Ho eseguito Migration 3 su Supabase Dashboard
- [ ] Ho verificato che i 4 trigger siano attivi
- [ ] Ho eseguito `node verifica-notifiche.cjs` → Vedo "TUTTO OK"
- [ ] Ho avviato il server locale (`npm run dev`)
- [ ] Ho caricato un documento di test
- [ ] Ho visto la notifica nella campanella 🔔
- [ ] Il badge rosso mostra il numero corretto
- [ ] Click sulla notifica mi porta alla risorsa corretta
- [ ] Real-time funziona (notifiche senza refresh)

---

## 🎯 Cosa Succede Dopo

Una volta completati gli step, avrai:

✅ **Sistema notifiche completamente funzionante** in locale  
✅ **Real-time** - notifiche appaiono istantaneamente  
✅ **Badge rosso** con conteggio non lette  
✅ **Dropdown** con ultime 10 notifiche  
✅ **Pagina completa** `/broker/notifications` con storico  
✅ **Navigazione** click su notifica → vai alla risorsa  
✅ **Gestione** marca lette, elimina, filtra

### Notifiche Attive

Il broker riceverà notifiche per:

1. **Cliente carica documento** → "Mario Rossi ha caricato un nuovo documento: X"
2. **Broker carica documento** → "Hai caricato il documento 'X' per Mario Rossi" (conferma)
3. **Approva documento** → "Hai approvato il documento 'X' di Mario Rossi"
4. **Rifiuta documento** → "Hai rifiutato il documento 'X' di Mario Rossi"
5. **Richiede modifiche** → "Hai richiesto modifiche per 'X' di Mario Rossi"
6. **Credit score completato** → "Credit score per Mario Rossi completato: 750/1000"
7. **Credit profile completato** → "Il profilo credito per Mario Rossi è stato completato"

Il cliente riceverà notifiche per:

1. **Broker carica documento** → "Il tuo broker Giovanni ha caricato un documento: X"
2. **Documento approvato** → "Il tuo documento 'X' è stato approvato"
3. **Documento rifiutato** → "Il documento 'X' è stato rifiutato"
4. **Richiede modifiche** → "Il documento 'X' richiede delle modifiche"

---

## 🐛 Troubleshooting

### Problema: Trigger non vengono creati

**Sintomo:** Errore durante esecuzione SQL su Supabase Dashboard

**Soluzione:**
1. Verifica di essere loggato con l'account corretto
2. Verifica di avere permessi admin sul progetto
3. Controlla che non ci siano errori di sintassi nel SQL copiato

### Problema: Notifiche non appaiono dopo le migrazioni

**Soluzione:**
1. **Hard refresh**: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Win)
2. **Riavvia server**: Ferma con Ctrl+C, poi `npm run dev`
3. **Controlla console browser**: F12 → Console (cerca errori JavaScript)
4. **Verifica login**: Assicurati di essere loggato come broker
5. **Testa manualmente**: Crea una notifica di test (vedi sotto)

### Problema: Badge non si aggiorna

**Soluzione:**
1. Ricarica la pagina (F5)
2. Verifica che il `NotificationProvider` sia wrappato correttamente in `App.tsx`
3. Controlla console browser per errori del real-time

### Creare Notifica di Test Manuale

Se vuoi testare senza caricare documenti, puoi creare una notifica manualmente:

1. Vai su Supabase Dashboard → SQL Editor
2. Esegui:

```sql
-- Trova il tuo user_id (broker)
SELECT id, email, first_name, last_name, role
FROM public.users
WHERE role = 'broker'
LIMIT 5;

-- Crea notifica di test (sostituisci IL_TUO_USER_ID)
INSERT INTO public.notifications (user_id, type, title, message, link)
VALUES (
  'IL_TUO_USER_ID',  -- Sostituisci con il tuo UUID
  'system_alert',
  '🧪 Test Notifica',
  'Questa è una notifica di test per verificare il sistema',
  '/broker/dashboard'
);
```

3. Ricarica l'app → Dovresti vedere la notifica!

---

## 📖 Documentazione Completa

Per maggiori dettagli:

- **Notifiche attive**: `NOTIFICHE_ATTIVE.md`
- **Come accedere**: `COME_ACCEDERE_NOTIFICHE.md`
- **Per broker**: `NOTIFICHE_BROKER_SUMMARY.md`
- **Migrazioni**: `ESEGUI_MIGRAZIONI.md`

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Esegui migrazioni su Supabase Dashboard (copia-incolla SQL)
# 2. Verifica
node verifica-notifiche.cjs

# 3. Avvia server
npm run dev

# 4. Test: carica documento → vedi notifica 🔔
```

---

**Pronto?** Apri Supabase Dashboard e inizia! 🚀

**Tempo richiesto:** ~10 minuti  
**Difficoltà:** Facile (copia-incolla)  
**Risultato:** Sistema notifiche production-ready ✨

