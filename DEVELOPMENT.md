# 🚀 Guida allo Sviluppo - CreditProfile

## 📋 Configurazione del Server

### Porta Fissa
L'applicazione è configurata per usare sempre la porta **3000** per evitare confusione.

### Avvio del Server

```bash
# Avvio normale
npm run dev

# Avvio pulito (ferma server esistenti prima)
npm run dev:clean

# Avvio automatico (gestisce conflitti di porta)
npm run dev:auto
```

### URL dell'Applicazione
- **Locale**: http://localhost:3000
- **Rete**: http://192.168.1.139:3000

## 🔧 Configurazione Vite

Il file `vite.config.ts` è configurato con:
- **Porta**: 3000
- **Host**: true (accessibile dalla rete)
- **strictPort**: true (usa sempre la porta specificata)

## 🧹 Pulizia Dati Mock

Per pulire i dati mock e forzare l'uso dei dati reali:

1. **Apri la pagina di pulizia**: http://localhost:3000/cleanup-browser-data.html
2. **Clicca "🗑️ Pulisci Dati Mock"**
3. **Clicca "✅ Forza Dati Reali"**
4. **Ricarica l'applicazione principale**

## 🧪 Test del Sistema

### Test Creazione Clienti
```bash
node test-client-creation.js
```

### Test Sistema Completo
```bash
node test-complete-system.js
```

### Test AI con Dati Reali
```bash
node test-ai-simple.js
```

## 📊 Database Supabase

### Connessione
- **URL**: Configurato in `.env`
- **Chiave**: Configurata in `.env`
- **RLS**: Disabilitato per sviluppo

### Tabelle Principali
- **users**: Utenti (broker e clienti)
- **credit_profiles**: Profili credito
- **documents**: Documenti

## 🔐 Autenticazione

### Account di Test
- **Broker**: fabrizio+20veeee@bitboss.it
- **Password**: Configurata in Supabase

### Filtraggio Dati
- L'AI filtra i dati per broker
- I clienti sono associati ai broker tramite `credit_profiles`

## 🐛 Risoluzione Problemi

### Porta Occupata
```bash
# Soluzione robusta (raccomandato)
npm run dev:robust

# Soluzione rapida
npm run fix-port

# Ferma tutti i processi di sviluppo
npm run stop-dev

# Oppure manualmente
pkill -f vite

# Riavvia con porta pulita
npm run dev:clean
```

### Dati Mock Persistenti
1. Apri http://localhost:3000/cleanup-browser-data.html
2. Pulisci tutti i dati mock
3. Ricarica l'applicazione

### Problemi di Connessione Database
1. Verifica le variabili d'ambiente in `.env`
2. Controlla la connessione Supabase
3. Verifica che RLS sia disabilitato

## 📝 Note di Sviluppo

- **Dati Reali**: L'applicazione usa sempre dati reali di Supabase
- **Filtraggio**: Tutti i dati sono filtrati per broker
- **Persistenza**: I dati sono salvati nel database, non in localStorage
- **AI**: Configurata per vedere solo i dati del broker loggato
