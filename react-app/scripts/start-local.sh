#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

# Le test réseau précède npm ci pour conserver l'installation existante si
# le registre est inaccessible. Ce script ne lance aucune commande Git distante.
if ! npm ping --fetch-retries=0 --fetch-timeout=10000; then
  echo 'Registre npm inaccessible. Installation existante conservée.' >&2
  echo 'Pour utiliser cette installation : cd react-app puis npm run dev.' >&2
  exit 1
fi
npm ci --no-fund
exec npm run dev
