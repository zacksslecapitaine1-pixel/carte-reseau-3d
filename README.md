# Carte réseau 3D — Explorateur interactif

Exposé du **Groupe 17** (ESGIS, Licence 1, cours de M. ZOBINOU) · réalisé par **Zackss (Dev.zak)**.

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

## Nouveautés : hub, parcours guidé et boutons « Action »

- **Barre du bas** : Carte 3D · Vidéo · Diaporama · Document · Parcours.
  - *Vidéo* : grille des 7 vidéos (nom sous chaque carré) et lecteur intégré.
  - *Diaporama* : les 61 diapos du groupe, navigation clavier (← →).
  - *Document* : lecteur PDF intégré, boutons de téléchargement du Word et du programme de passage.
  - *Parcours* : 31 étapes « Suivant » qui changent d'écran (vidéo, diaporama, carte 3D) avec, pour chaque étape, Personne n qui parle et ce qu'il faut montrer (touches N / P).
- **Boutons « Action »** (carte 3D) : RJ45, SFP+, Contrôleur, Dissipateur, PCIe, Firmware, Alimentation, Pistes, LED. Chaque action montre le composant en fonctionnement (câble qui se branche, signal, chaleur, DMA…).
- Les numéros sur la carte sont plus petits ; la carte 3D complète reste l'interface de base.
