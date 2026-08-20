#!/usr/bin/env bash
# Handmatige deploy als de Git Deploy plugin (nog) niet werkt.
# Vul je gegevens in en draai: ./deploy.sh
set -euo pipefail

HOST="ssh.jouwserver.nl"
GEBRUIKER="jouwgebruiker"
DOEL="~/domains/wesleyvaders.nl/public_html/"

echo "Bouwen..."
npm run build

echo "Uploaden naar $HOST ..."
rsync -avz --delete \
  --exclude '.well-known' \
  dist/ "$GEBRUIKER@$HOST:$DOEL"

echo "Klaar. Alles komt goed."
