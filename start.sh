#!/usr/bin/env bash
# ==========================================================================
#  Plages agronomiques — démarrage sur Mac / Linux
#  Double-cliquez (ou ./start.sh dans un terminal)
# ==========================================================================
set -u
cd "$(dirname "$0")"
PORT_DEFAUT=4000

echo
echo "=========================================================="
echo "  PLAGES AGRONOMIQUES — démarrage (frontend/ + backend/)"
echo "=========================================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo "  [PROBLÈME] Node.js n'est pas installé."
  echo "  1. Ouvrez https://nodejs.org et installez la version « LTS »"
  echo "  2. Relancez ce fichier"
  exit 1
fi
echo "  Node.js détecté : $(node -v)"

if [ ! -d node_modules ]; then
  echo
  echo "  Première utilisation : installation des composants (1 à 2 minutes)…"
  npm install --no-audit --no-fund || { echo "  [PROBLÈME] Installation impossible."; exit 1; }
fi

if [ ! -f frontend/dist/index.html ]; then
  echo
  echo "  Préparation du site (frontend)…"
  npm run build || { echo "  [PROBLÈME] La préparation a échoué."; exit 1; }
fi

echo
echo "  Démarrage du serveur…"
echo "  ----------------------------------------------------------"
echo "   Ouvrez votre navigateur à l'adresse : http://localhost:${PORT_DEFAUT}"
echo "   (n'écrivez jamais 0.0.0.0 dans le navigateur)"
echo "  ----------------------------------------------------------"
echo "   Pour ARRÊTER : Ctrl + C"
echo

( sleep 2; command -v xdg-open >/dev/null && xdg-open "http://localhost:${PORT_DEFAUT}"; \
  command -v open >/dev/null && open "http://localhost:${PORT_DEFAUT}" ) >/dev/null 2>&1 &

node backend/server/index.js
