#!/usr/bin/env bash
# Usage : bash publier-sur-github.sh   (nécessite git et gh connectés : gh auth login)
set -e
REPO=carte-reseau-3d
git init -b main
git add .
git commit -m "Explorateur 3D de la carte réseau (groupe 21)"
gh repo create "$REPO" --public --source=. --push
gh api -X POST "repos/{owner}/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" || true
echo "Site : https://zacksslecapitaine1-pixel.github.io/$REPO/ (actif dans 1 à 2 minutes)"
