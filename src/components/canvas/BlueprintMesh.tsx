import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';

export type BlueprintVisualState =
  | 'normal'
  | 'newlyBuilt'
  | 'hovered'
  | 'selected'
  | 'dimmed'
  | 'ghost';

interface BlueprintMeshProps {
  geometry: THREE.BufferGeometry;
  position?: [number, number, number];
  rotation?: [number, number, number];
  state: BlueprintVisualState;
  interactive?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
}

interface Palette {
  fill: string;
  grid: string;
  edge: string;
  fillOpacity: number;
  gridOpacity: number;
}

const STATE_PALETTE: Record<BlueprintVisualState, Palette> = {
  normal: {
    fill: '#0ea5e9',
    grid: '#38bdf8',
    edge: '#7dd3fc',
    fillOpacity: 0.11,
    gridOpacity: 0.3,
  },
  newlyBuilt: {
    fill: '#10b981',
    grid: '#34d399',
    edge: '#a7f3d0',
    fillOpacity: 0.18,
    gridOpacity: 0.42,
  },
  hovered: {
    fill: '#38bdf8',
    grid: '#bae6fd',
    edge: '#ffffff',
    fillOpacity: 0.28,
    gridOpacity: 0.55,
  },
  selected: {
    fill: '#f59e0b',
    grid: '#fbbf24',
    edge: '#fef08a',
    fillOpacity: 0.32,
    gridOpacity: 0.65,
  },
  dimmed: {
    fill: '#0f172a',
    grid: '#1e293b',
    edge: '#1e293b',
    fillOpacity: 0.025,
    gridOpacity: 0.06,
  },
  ghost: {
    fill: '#a78bfa',
    grid: '#c4b5fd',
    edge: '#a78bfa',
    fillOpacity: 0.035,
    gridOpacity: 0.12,
  },
};

/** Opacité des arêtes franches selon l’état (les arêtes « dimmed » et « ghost » s’effacent). */
const EDGE_OPACITY: Record<BlueprintVisualState, number> = {
  normal: 0.9,
  newlyBuilt: 1,
  hovered: 1,
  selected: 1,
  dimmed: 0.45,
  ghost: 0.5,
};

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

/**
 * Quadrillage métrique en coordonnées monde (donc continu d’une pièce à l’autre) :
 * lignes fines tous les 1 m, lignes épaisses tous les 5 m, projetées en triplanaire.
 */
const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uFill;
  uniform vec3 uGrid;
  uniform float uFillOpacity;
  uniform float uGridOpacity;
  uniform float uPulse;

  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  float gridLine(vec2 p, float spacing, float widthPx) {
    vec2 q = p / spacing;
    vec2 fw = max(fwidth(q), vec2(1e-5));
    vec2 d = abs(fract(q - 0.5) - 0.5) / fw;
    float line = 1.0 - clamp(min(d.x, d.y) / widthPx, 0.0, 1.0);
    // Évite le moiré quand les lignes deviennent plus serrées qu’un pixel.
    float fade = 1.0 - smoothstep(0.3, 0.5, max(fw.x, fw.y));
    return line * fade;
  }

  void main() {
    vec3 n = abs(normalize(vWorldNormal));
    vec3 w = pow(n, vec3(6.0));
    w /= (w.x + w.y + w.z);

    float minor =
      w.x * gridLine(vWorldPos.zy, 1.0, 1.0) +
      w.y * gridLine(vWorldPos.xz, 1.0, 1.0) +
      w.z * gridLine(vWorldPos.xy, 1.0, 1.0);

    float major =
      w.x * gridLine(vWorldPos.zy, 5.0, 1.6) +
      w.y * gridLine(vWorldPos.xz, 5.0, 1.6) +
      w.z * gridLine(vWorldPos.xy, 5.0, 1.6);

    float line = clamp(max(minor * 0.5, major), 0.0, 1.0);

    vec3 color = mix(uFill, uGrid, clamp(line * 2.0, 0.0, 1.0));
    float alpha = clamp(uFillOpacity + line * uGridOpacity + uPulse, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

function createUniforms(initial: Palette) {
  return {
    uFill: { value: new THREE.Color(initial.fill) },
    uGrid: { value: new THREE.Color(initial.grid) },
    uFillOpacity: { value: initial.fillOpacity },
    uGridOpacity: { value: initial.gridOpacity },
    uPulse: { value: 0 },
  };
}

const NO_RAYCAST: THREE.Object3D['raycast'] = () => {};

export function BlueprintMesh({
  geometry,
  position,
  rotation,
  state,
  interactive = true,
  onClick,
  onPointerOver,
  onPointerOut,
}: BlueprintMeshProps) {
  const palette = STATE_PALETTE[state];

  // Les uniforms naissent avec la palette de l’état initial, puis glissent vers les suivantes.
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [uniforms] = useState(() => createUniforms(palette));
  const targetFill = useMemo(() => new THREE.Color(palette.fill), [palette]);
  const targetGrid = useMemo(() => new THREE.Color(palette.grid), [palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const u = material.uniforms;
    const k = 1 - Math.exp(-delta * 9);
    (u.uFill.value as THREE.Color).lerp(targetFill, k);
    (u.uGrid.value as THREE.Color).lerp(targetGrid, k);
    u.uFillOpacity.value += (palette.fillOpacity - u.uFillOpacity.value) * k;
    u.uGridOpacity.value += (palette.gridOpacity - u.uGridOpacity.value) * k;
    u.uPulse.value =
      state === 'newlyBuilt' ? 0.07 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.6)) : 0;
  });

  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      raycast={interactive ? THREE.Mesh.prototype.raycast : NO_RAYCAST}
    >
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
      <Edges
        threshold={20}
        color={palette.edge}
        lineWidth={state === 'selected' || state === 'hovered' ? 2 : 1.3}
        transparent
        opacity={EDGE_OPACITY[state]}
      />
    </mesh>
  );
}
