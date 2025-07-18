#!/bin/bash

# Colori per output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Carica le variabili d'ambiente dal file .env se esiste
if [ -f .env ]; then
  # Controlla se il file .env è nella directory principale o in supabase/
  if [ -f ../.env ]; then # Se lo script è in supabase/
    export $(grep -v '^#' ../.env | xargs)
  else # Se lo script è nella root o .env è nella stessa directory
    export $(grep -v '^#' .env | xargs)
  fi
else
  # Prova a cercare .env nella directory padre se non trovato nella corrente
  if [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
  else
    echo -e "${RED}Errore: File .env non trovato! Crealo con le credenziali del database.${NC}"
    exit 1
  fi
fi

# Verifica che DB_URL sia impostata
if [ -z "$DB_URL" ]; then
  echo -e "${RED}Errore: La variabile DB_URL non è impostata nel file .env.${NC}"
  echo -e "Assicurati che .env contenga una riga simile a: DB_URL='postgresql://user:pass@host:port/db'"
  exit 1
fi

# Funzione per eseguire una migrazione
run_migration() {
    local migration_file=$1
    echo -e "${GREEN}Eseguo la migrazione: ${migration_file}${NC}"
    
    if psql "$DB_URL" -f "$migration_file"; then
        echo -e "${GREEN}✓ Migrazione completata con successo${NC}"
    else
        echo -e "${RED}✗ Errore durante la migrazione${NC}"
        exit 1
    fi
}

# Se viene specificato un file di migrazione
if [ $# -eq 1 ]; then
    run_migration "$1"
else
    # Altrimenti esegui tutte le migrazioni nella cartella migrations
    echo "DEBUG: Cerco migrazioni in migrations/*.sql"
    SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
    for migration in "$SCRIPT_DIR"/migrations/*.sql; do
        echo "DEBUG: Trovato potenziale file: $migration"
        if [ -f "$migration" ]; then
            run_migration "$migration"
        fi
    done
fi 