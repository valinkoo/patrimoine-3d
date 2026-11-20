\# DOSSIER MAÎTRE — Viewer Architectural 3D : Forteresse de la Bastille



\## 0. Consigne d'exécution pour Claude Code



Implémente intégralement cette application web en \*\*React + TypeScript + Vite + React Three Fiber + Tailwind CSS\*\*.

\- Respecte exactement l'arborescence et les contrats TypeScript ci-dessous.

\- N'utilise \*\*aucun fichier `.glb` externe\*\* : toute la géométrie est générée procéduralement via `BlueprintMesh` (shader de quadrillage métrique 1 m / 5 m semi-transparent + arêtes franches `<Edges>`).

\- Assure-toi que `npm run build` compile sans aucune erreur ni variable inutilisée (`noUnusedLocals`).



\### Commandes d'initialisation

```bash

npm create vite@latest patrimoine-3d -- --template react-ts

cd patrimoine-3d

npm install three @types/three @react-three/fiber @react-three/drei lucide-react

npm install -D tailwindcss @tailwindcss/vite

```



\### Configuration Vite (`vite.config.ts`) \& CSS (`src/index.css`)

Dans `vite.config.ts`, active le plugin `@tailwindcss/vite` aux côtés de `@vitejs/plugin-react`.

Dans `src/index.css`, écris uniquement :

```css

@import "tailwindcss";



html,

body,

\#root {

&#x20; width: 100%;

&#x20; height: 100%;

&#x20; margin: 0;

&#x20; padding: 0;

&#x20; overflow: hidden;

&#x20; background-color: #060b14;

&#x20; color: #f8fafc;

}

```



\### Arborescence complète du projet

```text

src/

├── types/

│   └── monument.ts

├── data/

│   └── monuments/

│       └── bastille.ts

├── utils/

│   └── monumentResolver.ts

├── components/

│   ├── canvas/

│   │   ├── BlueprintMesh.tsx

│   │   ├── ArchitecturalPrimitives.tsx

│   │   └── MonumentScene.tsx

│   └── ui/

│       ├── MonumentHeader.tsx

│       ├── TimelineBar.tsx

│       ├── ElementsSidebar.tsx

│       └── InspectorDrawer.tsx

├── App.tsx

└── index.css

```



\---



\## 1. Contrats TypeScript (`src/types/monument.ts`)



```ts

export type ElementCategory =

&#x20; | 'defense'

&#x20; | 'residentiel'

&#x20; | 'circulation'

&#x20; | 'institutionnel';



export type PrimitiveType =

&#x20; | 'tour\_cylindrique'

&#x20; | 'courtine'

&#x20; | 'bastion'

&#x20; | 'corps\_logis'

&#x20; | 'cour\_sol'

&#x20; | 'fosse';



export interface CameraPose {

&#x20; position: \[number, number, number];

&#x20; target: \[number, number, number];

}



export interface TimelinePhase {

&#x20; id: string;

&#x20; year: number;

&#x20; periodLabel: string;

&#x20; title: string;

&#x20; summary: string;

&#x20; cameraOverview: CameraPose;

}



export interface DetailLevels {

&#x20; quick: string;

&#x20; architecture: {

&#x20;   dimensions: string;

&#x20;   materials: string;

&#x20;   structuralRole: string;

&#x20; };

&#x20; history: {

&#x20;   narrative: string;

&#x20;   notableFigures?: string\[];

&#x20;   currentRemains?: string;

&#x20; };

}



export interface ElementPhaseOverride {

&#x20; phaseId: string;

&#x20; roleLabel?: string;

&#x20; quickOverride?: string;

&#x20; historyAddition?: string;

&#x20; geometryPatch?: Record<string, unknown>;

}



export interface GeometrySegment {

&#x20; pos: \[number, number, number];

&#x20; rotY?: number;

&#x20; w: number;

&#x20; h: number;

&#x20; d: number;

}



export interface ArchitecturalElement {

&#x20; id: string;

&#x20; name: string;

&#x20; category: ElementCategory;

&#x20; builtInPhase: string;

&#x20; demolishedInPhase?: string;

&#x20; levels: DetailLevels;

&#x20; phaseOverrides?: ElementPhaseOverride\[];

&#x20; geometry: {

&#x20;   primitive: PrimitiveType;

&#x20;   position: \[number, number, number];

&#x20;   rotationY?: number;

&#x20;   params: Record<string, unknown>;

&#x20; };

&#x20; cameraFocus: CameraPose;

}



export interface MonumentData {

&#x20; id: string;

&#x20; name: string;

&#x20; location: string;

&#x20; globalSummary: string;

&#x20; phases: TimelinePhase\[];

&#x20; elements: ArchitecturalElement\[];

}



export interface ResolvedElement extends ArchitecturalElement {

&#x20; isNewlyBuilt: boolean;

&#x20; isGhostFuture: boolean;

&#x20; activeRoleLabel?: string;

&#x20; resolvedQuick: string;

&#x20; resolvedHistoryNarrative: string;

&#x20; resolvedParams: Record<string, unknown>;

}

```



\---



\## 2. Résolveur Chronologique (`src/utils/monumentResolver.ts`)



```ts

import type { MonumentData, ResolvedElement } from '../types/monument';



export function resolveMonumentElements(

&#x20; monument: MonumentData,

&#x20; activePhaseId: string,

&#x20; includeFutureGhosts: boolean

): ResolvedElement\[] {

&#x20; const activePhase = monument.phases.find((p) => p.id === activePhaseId);

&#x20; if (!activePhase) return \[];



&#x20; const phaseYearMap = new Map(monument.phases.map((p) => \[p.id, p.year]));

&#x20; const currentYear = activePhase.year;



&#x20; return monument.elements

&#x20;   .filter((el) => {

&#x20;     const builtYear = phaseYearMap.get(el.builtInPhase) ?? 0;

&#x20;     const demolishedYear = el.demolishedInPhase

&#x20;       ? phaseYearMap.get(el.demolishedInPhase) ?? Infinity

&#x20;       : Infinity;



&#x20;     if (currentYear >= demolishedYear) return false;

&#x20;     if (currentYear < builtYear) return includeFutureGhosts;

&#x20;     return true;

&#x20;   })

&#x20;   .map((el) => {

&#x20;     const builtYear = phaseYearMap.get(el.builtInPhase) ?? 0;

&#x20;     const isGhostFuture = currentYear < builtYear;



&#x20;     const applicableOverrides = isGhostFuture

&#x20;       ? \[]

&#x20;       : (el.phaseOverrides ?? \[]).filter((ov) => {

&#x20;           const ovYear = phaseYearMap.get(ov.phaseId) ?? Infinity;

&#x20;           return ovYear <= currentYear;

&#x20;         });



&#x20;     let activeRoleLabel: string | undefined;

&#x20;     let resolvedQuick = el.levels.quick;

&#x20;     let resolvedHistoryNarrative = el.levels.history.narrative;

&#x20;     let resolvedParams: Record<string, unknown> = { ...el.geometry.params };



&#x20;     for (const ov of applicableOverrides) {

&#x20;       if (ov.roleLabel) activeRoleLabel = ov.roleLabel;

&#x20;       if (ov.quickOverride) resolvedQuick = ov.quickOverride;

&#x20;       if (ov.historyAddition) {

&#x20;         resolvedHistoryNarrative += `\\n\\n${ov.historyAddition}`;

&#x20;       }

&#x20;       if (ov.geometryPatch) {

&#x20;         resolvedParams = { ...resolvedParams, ...ov.geometryPatch };

&#x20;       }

&#x20;     }



&#x20;     return {

&#x20;       ...el,

&#x20;       isNewlyBuilt: !isGhostFuture \&\& el.builtInPhase === activePhaseId,

&#x20;       isGhostFuture,

&#x20;       activeRoleLabel,

&#x20;       resolvedQuick,

&#x20;       resolvedHistoryNarrative,

&#x20;       resolvedParams,

&#x20;     };

&#x20;   });

}

```



\---



\## 3. Composants 3D React Three Fiber (`src/components/canvas/`)



\### 3.1. `src/components/canvas/BlueprintMesh.tsx`



```tsx

import React, { useEffect, useMemo } from 'react';

import \* as THREE from 'three';

import { Edges } from '@react-three/drei';

import type { ThreeEvent } from '@react-three/fiber';



export type BlueprintVisualState =

&#x20; | 'normal'

&#x20; | 'newlyBuilt'

&#x20; | 'hovered'

&#x20; | 'selected'

&#x20; | 'dimmed'

&#x20; | 'ghost';



interface BlueprintMeshProps {

&#x20; geometry: THREE.BufferGeometry;

&#x20; position?: \[number, number, number];

&#x20; rotation?: \[number, number, number];

&#x20; state: BlueprintVisualState;

&#x20; interactive?: boolean;

&#x20; onClick?: (e: ThreeEvent<MouseEvent>) => void;

&#x20; onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;

&#x20; onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;

}



const STATE\_PALETTE: Record<

&#x20; BlueprintVisualState,

&#x20; { fill: string; grid: string; edge: string; fillOpacity: number; gridOpacity: number }

> = {

&#x20; normal: {

&#x20;   fill: '#0ea5e9',

&#x20;   grid: '#38bdf8',

&#x20;   edge: '#7dd3fc',

&#x20;   fillOpacity: 0.11,

&#x20;   gridOpacity: 0.30,

&#x20; },

&#x20; newlyBuilt: {

&#x20;   fill: '#10b981',

&#x20;   grid: '#34d399',

&#x20;   edge: '#a7f3d0',

&#x20;   fillOpacity: 0.18,

&#x20;   gridOpacity: 0.42,

&#x20; },

&#x20; hovered: {

&#x20;   fill: '#38bdf8',

&#x20;   grid: '#bae6fd',

&#x20;   edge: '#ffffff',

&#x20;   fillOpacity: 0.28,

&#x20;   gridOpacity: 0.55,

&#x20; },

&#x20; selected: {

&#x20;   fill: '#f59e0b',

&#x20;   grid: '#fbbf24',

&#x20;   edge: '#fef08a',

&#x20;   fillOpacity: 0.32,

&#x20;   gridOpacity: 0.65,

&#x20; },

&#x20; dimmed: {

&#x20;   fill: '#0f172a',

&#x20;   grid: '#1e293b',

&#x20;   edge: '#1e293b',

&#x20;   fillOpacity: 0.025,

&#x20;   gridOpacity: 0.06,

&#x20; },

&#x20; ghost: {

&#x20;   fill: '#0f172a',

&#x20;   grid:

