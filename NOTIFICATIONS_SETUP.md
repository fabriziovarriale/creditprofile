# 🔔 Sistema Notifiche - Setup Completo

## ✅ Implementazione Completa

Il sistema di notifiche è stato implementato completamente con:

1. ✅ **Database**: Tabella notifications + triggers automatici
2. ✅ **Backend**: NotificationService per CRUD operations
3. ✅ **Real-time**: NotificationContext con subscriptions Supabase
4. ✅ **UI**: Header campanella + pagina Notifications completa
5. ✅ **Auto-trigger**: Notifiche automatiche su eventi chiave

---

## 📋 Migrazioni Database

Due migrazioni da eseguire:

### Migration 1: Tabella Notifications
```bash
# File: supabase/migrations/20251016130000_create_notifications_table.sql
```

**Crea**:
- Tabella `notifications` con RLS
- ENUM `notification_type`
- Funzioni helper (create_notification, mark_as_read, etc.)
- Policies per sicurezza

### Migration 2: Trigger Automatici
```bash
# File: supabase/migrations/20251016140000_add_notification_triggers.sql
```

**Crea trigger per**:
- 📄 Documento caricato → notifica broker
- ✅ Documento approvato/rifiutato → notifica cliente
- 📊 Credit score completato → notifica broker
- 🎯 Credit profile completato → notifica broker

---

## 🚀 Come Eseguire le Migrazioni

### Opzione A: Produzione (Supabase Dashboard)

1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto `creditprofile`
3. Vai su **SQL Editor**
4. Apri `supabase/migrations/20251016130000_create_notifications_table.sql`
5. Copia e incolla il contenuto
6. Clicca **RUN**
7. Ripeti per `20251016140000_add_notification_triggers.sql`

### Opzione B: Locale (se hai Supabase locale)

```bash
# Dalla root del progetto
supabase migration up
```

### Opzione C: Script diretto (se hai .env configurato)

```bash
# Dalla root del progetto
cd supabase
./migrate.sh migrations/20251016130000_create_notifications_table.sql
./migrate.sh migrations/20251016140000_add_notification_triggers.sql
```

---

## 🧪 Come Testare

### Test 1: Notifica Documento Caricato

1. **Fai login come cliente**
2. Vai su "Documenti"
3. Carica un PDF
4. **Fai logout**
5. **Fai login come broker** (associato a quel cliente)
6. Guarda la campanella 🔔 → dovresti vedere **1** notifica
7. Clicca sulla campanella → "Nuovo documento caricato"

### Test 2: Notifica Documento Approvato

1. **Come broker**, vai su "Documenti"
2. Trova un documento con status "pending"
3. Cambia status a "approved"
4. **Fai logout**
5. **Fai login come cliente**
6. Guarda la campanella → "Documento approvato"

### Test 3: Real-time Updates

1. Apri **due browser** (o normale + incognito)
2. Browser 1: Login come broker
3. Browser 2: Login come cliente
4. Browser 2: Carica un documento
5. Browser 1: La notifica dovrebbe apparire **automaticamente** (senza refresh!)
6. Vedi il toast in basso → "Nuovo documento caricato"

### Test 4: Pagina Notifications

1. Come broker con notifiche
2. Vai su `/broker/notifications`
3. Dovresti vedere:
   - Lista di tutte le notifiche
   - Filtri (Tutte/Non lette)
   - Pulsanti "Segna tutte lette" e "Elimina lette"
   - Icone colorate per tipo notifica

---

## 🎯 Tipi di Notifiche Implementate

| Evento | Ricevitore | Tipo | Trigger |
|--------|-----------|------|---------|
| Documento caricato | Broker | `document_uploaded` | Database trigger |
| Documento approvato | Cliente | `document_approved` | Database trigger |
| Documento rifiutato | Cliente | `document_rejected` | Database trigger |
| Documento richiede modifiche | Cliente | `document_requires_changes` | Database trigger |
| Credit score completato | Broker | `credit_score_completed` | Database trigger |
| Credit profile completato | Broker | `profile_completed` | Database trigger |

---

## 📱 UI Componenti

### Header Campanella
- **Posizione**: Header (in alto a destra)
- **Badge rosso**: Conta notifiche non lette
- **Dropdown**: Ultime 10 notifiche
- **Azioni**: Segna come letta, Elimina, Vedi tutte

### Pagina Notifications
- **URL**: `/broker/notifications`
- **Features**:
  - Lista completa notifiche
  - Filtri (Tutte/Non lette)
  - Segna tutte come lette
  - Elimina notifiche lette
  - Click per navigare alla risorsa
  - Icone colorate per tipo

---

## 🔧 Personalizzazione

### Aggiungere Nuovi Tipi di Notifica

1. **Aggiungi al ENUM** (migration):
```sql
ALTER TYPE notification_type ADD VALUE 'new_notification_type';
```

2. **Crea funzione helper** in `notificationService.ts`:
```typescript
async notifyNewEvent(userId: string, details: any) {
  return this.createNotification({
    userId,
    type: 'new_notification_type',
    title: 'Titolo',
    message: 'Messaggio',
    link: '/link/to/resource',
    metadata: details,
  });
}
```

3. **Chiama dove serve**:
```typescript
import { notificationService } from '@/services/notificationService';

// Dopo un evento
await notificationService.notifyNewEvent(userId, eventData);
```

### Aggiungere Trigger Database

Crea una nuova migration:
```sql
CREATE OR REPLACE FUNCTION notify_my_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  VALUES (...);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_my_event
  AFTER INSERT ON my_table
  FOR EACH ROW
  EXECUTE FUNCTION notify_my_event();
```

---

## 🐛 Troubleshooting

### Notifiche non appaiono

**Problema**: Campanella sempre a 0

**Soluzioni**:
1. Controlla che le migrazioni siano eseguite:
   ```sql
   SELECT * FROM public.notifications LIMIT 1;
   ```
2. Verifica RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```
3. Controlla trigger:
   ```sql
   SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'trigger_notify%';
   ```

### Real-time non funziona

**Problema**: Le notifiche non appaiono senza refresh

**Soluzioni**:
1. Verifica che Supabase Realtime sia abilitato sul progetto
2. Controlla la console browser per errori WebSocket
3. Verifica che NotificationProvider sia nel tree React:
   ```tsx
   <NotificationProvider>
     <App />
   </NotificationProvider>
   ```

### Errore "useNotifications must be used within NotificationProvider"

**Soluzione**: Assicurati che il componente sia dentro NotificationProvider

In `App.tsx`:
```tsx
<Route path="broker" element={
  <NotificationProvider>
    <BrokerLayout />
  </NotificationProvider>
} />
```

---

## 📊 Metriche di Successo

Dopo l'implementazione, verifica:

- [x] Le notifiche vengono create automaticamente sui trigger
- [x] La campanella mostra il conteggio corretto
- [x] Le notifiche appaiono in real-time (senza refresh)
- [x] I toast appaiono quando arriva una nuova notifica
- [x] Marcare come letta funziona
- [x] Eliminare notifica funziona
- [x] La pagina `/broker/notifications` è accessibile
- [x] I filtri (Tutte/Non lette) funzionano
- [x] Click su notifica naviga alla risorsa corretta

---

## 📝 File Creati/Modificati

### Nuovi File
- ✅ `supabase/migrations/20251016130000_create_notifications_table.sql`
- ✅ `supabase/migrations/20251016140000_add_notification_triggers.sql`
- ✅ `src/services/notificationService.ts`
- ✅ `src/contexts/NotificationContext.tsx`
- ✅ `NOTIFICATIONS_SETUP.md` (questa guida)

### File Modificati
- ✅ `src/components/layout/Header.tsx` - Campanella con NotificationContext
- ✅ `src/pages/broker/Notifications.tsx` - Pagina completa
- ✅ `src/App.tsx` - NotificationProvider + route

---

## 🎉 Completamento

Il sistema di notifiche è **completo e pronto all'uso**!

**Next Steps**:
1. Esegui le migrazioni in produzione
2. Testa con clienti e documenti reali
3. Monitora le notifiche per verificare che funzionino
4. Opzionale: Aggiungi notifiche via email (usando Supabase Email)

**Supporto**: Se hai problemi, controlla la sezione Troubleshooting o contatta il team.

---

**Data**: 16 Ottobre 2025  
**Versione**: 1.0  
**Status**: ✅ Ready for Production

