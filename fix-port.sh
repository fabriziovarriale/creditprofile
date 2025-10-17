#!/bin/bash

echo "🔧 Risoluzione problemi porta 3000..."

# Ferma tutti i processi Vite
echo "🛑 Fermando processi Vite..."
pkill -f vite

# Aspetta un momento
sleep 2

# Verifica che la porta sia libera
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Porta ancora occupata, forzando chiusura..."
    lsof -ti :3000 | xargs kill -9
    sleep 1
fi

echo "✅ Porta 3000 liberata"
echo "🚀 Ora puoi avviare il server con: npm run dev"












