#!/bin/bash

# Script robusto per avviare il server di sviluppo
# Gestisce automaticamente i conflitti di porta e processi zombie

set -e  # Esci se qualsiasi comando fallisce

echo "🚀 Avvio robusto del server di sviluppo..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Funzione per pulire la porta 3000
cleanup_port_3000() {
    print_status "Pulizia porta 3000..."
    
    # Trova tutti i processi che usano la porta 3000
    local pids=$(lsof -ti :3000 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        print_warning "Trovati processi sulla porta 3000: $pids"
        
        # Ferma tutti i processi Vite in background
        print_status "Fermando processi Vite..."
        pkill -f "vite" 2>/dev/null || true
        
        # Aspetta un momento
        sleep 2
        
        # Se ci sono ancora processi, forzali
        pids=$(lsof -ti :3000 2>/dev/null || true)
        if [ -n "$pids" ]; then
            print_warning "Processi ancora attivi, forzando chiusura..."
            echo "$pids" | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
        
        # Verifica finale
        if lsof -i :3000 >/dev/null 2>&1; then
            print_error "Impossibile liberare la porta 3000"
            return 1
        else
            print_success "Porta 3000 liberata"
        fi
    else
        print_success "Porta 3000 già libera"
    fi
}

# Funzione per verificare le dipendenze
check_dependencies() {
    print_status "Verifica dipendenze..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js non trovato"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm non trovato"
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "package.json non trovato. Assicurati di essere nella directory del progetto."
        exit 1
    fi
    
    print_success "Dipendenze verificate"
}

# Funzione per installare le dipendenze se necessario
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules non trovato, installando dipendenze..."
        npm install
        print_success "Dipendenze installate"
    fi
}

# Funzione per avviare il server
start_server() {
    print_status "Avviando server su http://localhost:3000..."
    
    # Avvia il server con npm run dev
    npm run dev
}

# Funzione per gestire l'interruzione
cleanup_on_exit() {
    print_status "Pulizia in corso..."
    pkill -f "vite" 2>/dev/null || true
    print_success "Pulizia completata"
}

# Imposta trap per gestire l'interruzione
trap cleanup_on_exit EXIT INT TERM

# Esegui le verifiche e l'avvio
main() {
    print_status "=== Avvio Robusto Server di Sviluppo ==="
    
    # Verifica dipendenze
    check_dependencies
    
    # Installa dipendenze se necessario
    install_dependencies
    
    # Pulisci la porta 3000
    if ! cleanup_port_3000; then
        print_error "Fallimento nella pulizia della porta 3000"
        exit 1
    fi
    
    # Avvia il server
    start_server
}

# Esegui il main
main "$@"












