# Carte réseau 3D — Explorateur interactif

Exposé du **Groupe 21** (ESGIS, Licence 1, cours de M. ZOBINOU) · réalisé par **Zackss (Dev.zak)**.

Explorez en 3D une carte réseau (NIC) : cliquez sur chaque pièce (port RJ45, cage SFP+, contrôleur MAC/PHY, dissipateur, connecteur PCIe, firmware, alimentation, pistes, LED) pour afficher sa définition, son rôle et l'essentiel à retenir.

## Fonctions
- Rotation, zoom, clic sur les pièces, numéros cliquables
- Visite guidée, vue éclatée, flux de données animé, mode quiz, analogie et exemple pour chaque pièce
- Raccourcis : ← → (pièce), T (visite), E (éclatée), F (flux), Échap (réinitialiser)

## Technologies
HTML, CSS, JavaScript (modules ES) et [Three.js](https://threejs.org) (embarqué dans `vendor/`, aucun CDN : fonctionne hors ligne).

## Lancer en local
```bash
python3 -m http.server 8000   # puis ouvrir http://localhost:8000
```
(ouvrir `index.html` directement ne marche pas : les modules ES exigent un serveur.)

## Déploiement GitHub Pages
Dépôt → Settings → Pages → Branch `main` / dossier `/ (root)`.
