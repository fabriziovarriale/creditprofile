# Assistente AI per Broker - Documentazione

## Panoramica

L'assistente AI è stato integrato nella web-app per supportare i broker nell'analisi dei profili di credito. L'agente utilizza OpenAI GPT-4 per fornire analisi intelligenti, suggerimenti e assistenza operativa.

## Funzionalità Principali

### 1. Chat Intelligente
- **Streaming delle risposte**: Le risposte dell'AI vengono mostrate in tempo reale
- **Contesto dinamico**: L'AI conosce automaticamente il cliente, documento o profilo che stai visualizzando
- **Citazioni**: L'AI cita sempre le fonti quando fornisce informazioni
- **Azioni suggerite**: Pulsanti per eseguire azioni specifiche suggerite dall'AI

### 2. Analisi Automatica
- **Documenti**: Analisi automatica dei documenti caricati
- **Profili credito**: Generazione di report completi
- **Suggerimenti**: Raccomandazioni per migliorare i profili

### 3. Contesto Intelligente
- **Rilevamento automatico**: L'AI riconosce il contesto dalla pagina corrente
- **Selezione manuale**: Possibilità di selezionare manualmente cliente/documento/profilo
- **Persistenza**: Il contesto viene mantenuto durante la navigazione

## Come Utilizzare

### Apertura dell'Assistente
1. Clicca sul pulsante flottante con l'icona del robot (in basso a destra)
2. Il drawer si aprirà dal lato destro dello schermo
3. L'AI ti saluterà e ti mostrerà le azioni disponibili

### Cambio Contesto
1. Clicca sull'icona delle impostazioni nell'header del chat
2. Seleziona il cliente, documento o profilo di interesse
3. L'AI si adatterà automaticamente al nuovo contesto

### Tipi di Domande

#### Analisi Documenti
```
"Analizza questo documento"
"Ci sono problemi in questa busta paga?"
"Verifica la completezza del CUD"
```

#### Profili Credito
```
"Genera un report completo per questo cliente"
"Quali sono i punti critici del profilo?"
"Suggerisci come migliorare il punteggio"
```

#### Assistenza Generale
```
"Come posso accelerare l'approvazione?"
"Quali documenti mancano?"
"Spiega questo risultato del credit score"
```

## Configurazione

### Variabili d'Ambiente
Aggiungi al file `.env`:
```
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Database
L'assistente si integra con Supabase per:
- Recuperare dati clienti
- Accedere ai documenti
- Leggere profili credito

## Architettura Tecnica

### Frontend
- **React + TypeScript**: Interfaccia utente
- **Streaming**: Server-Sent Events per risposte in tempo reale
- **Contesto**: Hook personalizzato per gestire il contesto AI

### Backend
- **OpenAI GPT-4**: Modello di linguaggio
- **Supabase**: Database e autenticazione
- **pgvector**: Per future funzionalità di ricerca semantica

### Componenti
- `AIChatDrawer`: Interfaccia principale del chat
- `AIChatButton`: Pulsante flottante per aprire il chat
- `AIContextSelector`: Selettore per il contesto
- `useAIContext`: Hook per gestire il contesto

## Sicurezza

- Le API key sono gestite lato client (da spostare su backend in produzione)
- Controllo accessi tramite Supabase Auth
- Validazione input per prevenire injection

## Roadmap

### Fase 2
- [ ] Backend dedicato per le chiamate AI
- [ ] Vector database per RAG (Retrieval Augmented Generation)
- [ ] Analisi automatica del contenuto dei PDF
- [ ] Notifiche push per azioni suggerite

### Fase 3
- [ ] Integrazione con sistemi esterni di credit scoring
- [ ] Machine learning per predizioni di approvazione
- [ ] Dashboard analytics per performance AI
- [ ] Multi-lingua support

## Troubleshooting

### L'AI non risponde
1. Verifica che la API key OpenAI sia configurata
2. Controlla la connessione internet
3. Verifica i log della console per errori

### Contesto non corretto
1. Usa il selettore di contesto per impostare manualmente
2. Verifica che i dati nel database siano corretti
3. Ricarica la pagina se necessario

### Performance lente
1. Le risposte possono richiedere alcuni secondi
2. Verifica la velocità di connessione
3. Controlla l'utilizzo della API OpenAI

## Supporto

Per problemi tecnici o suggerimenti:
- Controlla i log della console
- Verifica la documentazione OpenAI
- Contatta il team di sviluppo
