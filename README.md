# Patrimoine 3D

Visualiseur architectural 3D des patrimoines français disparus, en commençant par la **forteresse de la Bastille** (Paris, 1370 → 1791).

Toute la géométrie est générée procéduralement (aucun fichier `.glb`) et rendue en style « blueprint » : fond sombre, quadrillage métrique de 1 m / 5 m semi-transparent et arêtes franches.

## Lancer

```bash
npm install
npm run dev      # serveur de développement
npm run build    # vérification TypeScript + build de production
npm run lint
```

## Utilisation

- **Frise chronologique** (bas) : 7 époques, de la fondation en 1370 aux vestiges de 1899. Raccourcis `←` / `→`, bouton lecture pour un défilement automatique.
- **Liste d’éléments** (gauche) : regroupés par catégorie, avec filtres. Survol et clic sont reliés à la scène.
- **Inspecteur** (droite) : trois niveaux de détail — aperçu, architecture, histoire. Le texte et la géométrie évoluent avec l’époque (ex. tours à créneaux en 1383, à plate-forme de tir dès 1553).
- **Éléments à venir** : affiche en transparence violette ce qui sera construit plus tard.
- Souris : glisser pour orbiter, molette pour zoomer, clic droit pour déplacer, `Échap` pour désélectionner.

## Architecture

```text
src/
├── types/monument.ts               contrats TypeScript
├── data/monuments/bastille.ts      données : phases, éléments, textes
├── utils/monumentResolver.ts       état d’un monument à une époque donnée
├── components/canvas/
│   ├── BlueprintMesh.tsx           shader de quadrillage + arêtes
│   ├── ArchitecturalPrimitives.tsx tour, courtine, bastion, logis, cour, fossé
│   └── MonumentScene.tsx           canvas, sol, caméra animée, étiquettes
├── components/ui/                  en-tête, frise, liste, inspecteur
└── App.tsx                         état global
```

Ajouter un monument revient à écrire un nouveau fichier de données dans `src/data/monuments/` qui respecte `MonumentData`.

## Avertissement

Plan, cotes et chronologie des travaux sont des **reconstitutions schématiques** : lire les dimensions comme des ordres de grandeur et la disposition des tours comme simplifiée.
