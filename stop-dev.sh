#!/bin/bash

# Script per fermare tutti i processi di sviluppo

echo "🛑 Fermando tutti i processi di sviluppo..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Ferma tutti i processi Vite
print_status "Fermando processi Vite..."
pkill -f "vite" 2>/dev/null || true

# Ferma tutti i processi Node.js sulla porta 3000
print_status "Fermando processi sulla porta 3000..."
pids=$(lsof -ti :3000 2>/dev/null || true)
if [ -n "$pids" ]; then
    echo "$pids" | xargs kill -9 2>/dev/null || true
    print_warning "Processi forzati sulla porta 3000"
fi

# Ferma tutti i processi npm
print_status "Fermando processi npm..."
pkill -f "npm" 2>/dev/null || true

# Aspetta un momento per assicurarsi che tutto sia fermato
sleep 2

# Verifica finale
if lsof -i :3000 >/dev/null 2>&1; then
    print_warning "Alcuni processi potrebbero essere ancora attivi sulla porta 3000"
    lsof -i :3000
else
    print_success "Tutti i processi di sviluppo fermati"
fi

echo "✅ Pulizia completata!"












