#!/bin/bash

# Script per avviare il server di sviluppo
# Gestisce automaticamente i conflitti di porta

echo "🚀 Avvio server di sviluppo..."

# Verifica se la porta 3000 è in uso
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Porta 3000 in uso. Fermando processi esistenti..."
    
    # Trova e ferma i processi sulla porta 3000
    PIDS=$(lsof -ti :3000)
    if [ ! -z "$PIDS" ]; then
        echo "🛑 Fermando processi: $PIDS"
        kill $PIDS
        sleep 2
    fi
    
    # Verifica che la porta sia libera
    if lsof -i :3000 > /dev/null 2>&1; then
        echo "❌ Impossibile liberare la porta 3000"
        echo "💡 Prova manualmente: pkill -f vite"
        exit 1
    else
        echo "✅ Porta 3000 liberata"
    fi
fi

# Avvia il server
echo "🎯 Avviando server su http://localhost:3000..."
npm run dev











