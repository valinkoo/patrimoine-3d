import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { ThreeEvent } from '@react-three/fiber';
import type { PrimitiveType, ResolvedElement } from '../../types/monument';
import { BlueprintMesh } from './BlueprintMesh';
import type { BlueprintVisualState } from './BlueprintMesh';

/*
 * Convention commune : chaque primitive est construite avec son centre de base
 * à l’origine locale (le « pied » de l’élément repose sur y = 0). La position et
 * la rotation Y de l’élément sont appliquées ensuite par le <mesh>.
 */

type Params = Record<string, unknown>;

function num(params: Params, key: string, fallback: number): number {
  const v = params[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function str(params: Params, key: string, fallback: string): string {
  const v = params[key];
  return typeof v === 'string' ? v : fallback;
}

function bool(params: Params, key: string, fallback: boolean): boolean {
  const v = params[key];
  return typeof v === 'boolean' ? v : fallback;
}

/** Fusionne plusieurs géométries en une seule (tout en non-indexé pour être compatible). */
function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const prepared = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  const merged = mergeGeometries(prepared, false);
  parts.forEach((g) => g.dispose());
  return merged ?? new THREE.BufferGeometry();
}

function box(w: number, h: number, d: number, x: number, y: number, z: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

/* ------------------------------ Tour cylindrique -------------------------- */

function buildTower(p: Params): THREE.BufferGeometry {
  const r = num(p, 'radius', 5.5);
  const h = num(p, 'height', 24);
  const seg = Math.max(12, Math.round(num(p, 'radialSegments', 40)));
  const crown = str(p, 'crown', 'merlons'); // 'merlons' | 'parapet' | 'none'

  const corbelH = crown === 'none' ? 0 : num(p, 'corbelHeight', 2.2);
  const overhang = crown === 'none' ? 0 : num(p, 'corbelOverhang', 0.6);
  const shaftH = Math.max(0.1, h - corbelH);
  const rc = r + overhang;

  const parts: THREE.BufferGeometry[] = [];

  const shaft = new THREE.CylinderGeometry(r, r, shaftH, seg);
  shaft.translate(0, shaftH / 2, 0);
  parts.push(shaft);

  if (corbelH > 0) {
    const corbel = new THREE.CylinderGeometry(rc, r, corbelH, seg);
    corbel.translate(0, shaftH + corbelH / 2, 0);
    parts.push(corbel);
  }

  if (crown === 'merlons') {
    const count = Math.max(8, Math.floor((2 * Math.PI * rc) / 2.4));
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2;
      const m = new THREE.BoxGeometry(0.8, 1.4, 1.2); // x = radial, z = tangentiel
      m.rotateY(-a);
      m.translate((rc - 0.4) * Math.cos(a), h + 0.7, (rc - 0.4) * Math.sin(a));
      parts.push(m);
    }
  } else if (crown === 'parapet') {
    const parapet = new THREE.CylinderGeometry(rc, rc, 1.2, seg, 1, true);
    parapet.translate(0, h + 0.6, 0);
    parts.push(parapet);
  }

  return merge(parts);
}

/* ---------------------------------- Courtine ------------------------------ */

function buildCourtine(p: Params): THREE.BufferGeometry {
  const length = num(p, 'length', 8);
  const height = num(p, 'height', 22);
  const thickness = num(p, 'thickness', 3);
  const gateW = num(p, 'gateWidth', 0);
  const gateH = Math.min(num(p, 'gateHeight', 0), height - 1);
  const crenellated = bool(p, 'crenellated', true);

  const parts: THREE.BufferGeometry[] = [];

  if (gateW > 0 && gateH > 0 && gateW < length) {
    const side = (length - gateW) / 2;
    const offset = gateW / 2 + side / 2;
    parts.push(box(side, height, thickness, -offset, height / 2, 0));
    parts.push(box(side, height, thickness, offset, height / 2, 0));
    parts.push(box(gateW, height - gateH, thickness, 0, gateH + (height - gateH) / 2, 0));
  } else {
    parts.push(box(length, height, thickness, 0, height / 2, 0));
  }

  if (crenellated) {
    const n = Math.max(1, Math.floor(length / 2.4));
    const spacing = length / n;
    const zRow = Math.max(0.4, thickness / 2 - 0.4);
    for (let i = 0; i < n; i += 1) {
      const x = -length / 2 + spacing * (i + 0.5);
      parts.push(box(1.2, 1.4, 0.8, x, height + 0.7, zRow));
      parts.push(box(1.2, 1.4, 0.8, x, height + 0.7, -zRow));
    }
  }

  return merge(parts);
}

/* --------------------------------- Corps de logis ------------------------- */

function buildLogis(p: Params): THREE.BufferGeometry {
  const w = num(p, 'width', 14);
  const d = num(p, 'depth', 8);
  const h = num(p, 'height', 10);
  const roofH = num(p, 'roofHeight', 0);

  const parts: THREE.BufferGeometry[] = [box(w, h, d, 0, h / 2, 0)];

  if (roofH > 0) {
    // Toit à deux pans : faîtage parallèle à l’axe X local.
    const gable = new THREE.Shape();
    gable.moveTo(-d / 2, 0);
    gable.lineTo(d / 2, 0);
    gable.lineTo(0, roofH);
    gable.closePath();
    const roof = new THREE.ExtrudeGeometry(gable, { depth: w, bevelEnabled: false });
    roof.rotateY(Math.PI / 2);
    roof.translate(-w / 2, h, 0);
    parts.push(roof);
  }

  return merge(parts);
}

/* ----------------------------------- Bastion ------------------------------ */

function buildBastion(p: Params): THREE.BufferGeometry {
  const w = num(p, 'width', 40);
  const flank = num(p, 'flank', 16);
  const salient = num(p, 'salient', 20);
  const h = num(p, 'height', 10);

  // Plan en fer de lance, base sur x = 0, pointe vers +x.
  const plan = new THREE.Shape();
  plan.moveTo(0, -w / 2);
  plan.lineTo(flank, -w / 2);
  plan.lineTo(flank + salient, 0);
  plan.lineTo(flank, w / 2);
  plan.lineTo(0, w / 2);
  plan.closePath();

  const g = new THREE.ExtrudeGeometry(plan, { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2); // extrusion vers +y
  return g;
}

/* ----------------------------------- Cour / sol --------------------------- */

function buildCour(p: Params): THREE.BufferGeometry {
  const w = num(p, 'width', 20);
  const d = num(p, 'depth', 20);
  const t = num(p, 'thickness', 0.3);
  return merge([box(w, t, d, 0, t / 2, 0)]);
}

/* ------------------------------------ Fossé ------------------------------- */

function buildFosse(p: Params): THREE.BufferGeometry {
  const iw = num(p, 'innerWidth', 69);
  const id = num(p, 'innerDepth', 37);
  const mw = num(p, 'moatWidth', 25);
  const depth = num(p, 'depth', 8);

  const ow = iw / 2 + mw;
  const od = id / 2 + mw;

  const ring = new THREE.Shape();
  ring.moveTo(-ow, -od);
  ring.lineTo(ow, -od);
  ring.lineTo(ow, od);
  ring.lineTo(-ow, od);
  ring.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-iw / 2, -id / 2);
  hole.lineTo(-iw / 2, id / 2);
  hole.lineTo(iw / 2, id / 2);
  hole.lineTo(iw / 2, -id / 2);
  hole.closePath();
  ring.holes.push(hole);

  const g = new THREE.ExtrudeGeometry(ring, { depth, bevelEnabled: false });
  g.rotateX(Math.PI / 2); // extrusion vers -y : le fossé est creusé sous le sol
  return g;
}

/* ---------------------------------- Dispatcher ---------------------------- */

function buildGeometry(primitive: PrimitiveType, params: Params): THREE.BufferGeometry {
  switch (primitive) {
    case 'tour_cylindrique':
      return buildTower(params);
    case 'courtine':
      return buildCourtine(params);
    case 'bastion':
      return buildBastion(params);
    case 'corps_logis':
      return buildLogis(params);
    case 'cour_sol':
      return buildCour(params);
    case 'fosse':
      return buildFosse(params);
  }
}

interface ArchitecturalPrimitiveProps {
  element: ResolvedElement;
  state: BlueprintVisualState;
  interactive?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
}

export function ArchitecturalPrimitive({
  element,
  state,
  interactive,
  onClick,
  onPointerOver,
  onPointerOut,
}: ArchitecturalPrimitiveProps) {
  const { primitive, position, rotationY } = element.geometry;

  // La clé sérialisée évite de reconstruire la géométrie quand le résolveur
  // recrée un objet de paramètres identique.
  const paramsKey = JSON.stringify(element.resolvedParams);
  const geometry = useMemo(
    () => buildGeometry(primitive, JSON.parse(paramsKey) as Params),
    [primitive, paramsKey]
  );

  return (
    <BlueprintMesh
      geometry={geometry}
      position={position}
      rotation={[0, rotationY ?? 0, 0]}
      state={state}
      interactive={interactive}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    />
  );
}
