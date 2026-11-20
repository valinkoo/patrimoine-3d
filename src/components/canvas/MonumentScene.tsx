import { useEffect, useRef } from 'react';
import type { ComponentRef, RefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, OrbitControls } from '@react-three/drei';
import type { CameraPose, ElementCategory, ResolvedElement } from '../../types/monument';
import { ArchitecturalPrimitive } from './ArchitecturalPrimitives';
import type { BlueprintVisualState } from './BlueprintMesh';

/** Demande de déplacement de caméra ; `nonce` change à chaque nouvelle demande. */
export interface CameraRequest {
  pose: CameraPose;
  nonce: number;
}

interface MonumentSceneProps {
  elements: ResolvedElement[];
  selectedId: string | null;
  hoveredId: string | null;
  visibleCategories: ReadonlySet<ElementCategory>;
  cameraRequest: CameraRequest;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

type ControlsRef = RefObject<ComponentRef<typeof OrbitControls> | null>;

function visualStateFor(
  element: ResolvedElement,
  selectedId: string | null,
  hoveredId: string | null,
  visibleCategories: ReadonlySet<ElementCategory>
): BlueprintVisualState {
  if (element.id === selectedId) return 'selected';
  if (!visibleCategories.has(element.category)) return 'dimmed';
  if (element.id === hoveredId) return 'hovered';
  if (selectedId !== null) return 'dimmed';
  if (element.isGhostFuture) return 'ghost';
  if (element.isNewlyBuilt) return 'newlyBuilt';
  return 'normal';
}

/** Vol de caméra amorti vers la pose demandée ; la main de l’utilisateur l’interrompt. */
function CameraRig({
  request,
  controlsRef,
  flyingRef,
}: {
  request: CameraRequest;
  controlsRef: ControlsRef;
  flyingRef: RefObject<boolean>;
}) {
  const camera = useThree((s) => s.camera);
  const handledNonce = useRef<number | null>(null);
  const goalPosition = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (handledNonce.current !== request.nonce) {
      const isFirst = handledNonce.current === null;
      handledNonce.current = request.nonce;
      goalPosition.current.set(...request.pose.position);
      goalTarget.current.set(...request.pose.target);
      if (isFirst) {
        camera.position.copy(goalPosition.current);
        controls.target.copy(goalTarget.current);
        controls.update();
        flyingRef.current = false;
      } else {
        flyingRef.current = true;
      }
    }

    if (!flyingRef.current) return;

    const k = 1 - Math.exp(-delta * 3.2);
    camera.position.lerp(goalPosition.current, k);
    controls.target.lerp(goalTarget.current, k);
    controls.update();

    if (
      camera.position.distanceTo(goalPosition.current) < 0.05 &&
      controls.target.distanceTo(goalTarget.current) < 0.05
    ) {
      flyingRef.current = false;
    }
  });

  return null;
}

function ElementLabel({ element, selected }: { element: ResolvedElement; selected: boolean }) {
  const [x, y, z] = element.geometry.position;
  const h = element.resolvedParams.height;
  const top = y + (typeof h === 'number' ? h : 8) + 3;

  return (
    <Html position={[x, top, z]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div
        className={`whitespace-nowrap rounded border px-2 py-1 text-xs font-medium shadow-lg backdrop-blur ${
          selected
            ? 'border-amber-300/60 bg-amber-950/70 text-amber-100'
            : 'border-sky-300/40 bg-slate-950/70 text-sky-100'
        }`}
      >
        {element.name}
      </div>
    </Html>
  );
}

export function MonumentScene({
  elements,
  selectedId,
  hoveredId,
  visibleCategories,
  cameraRequest,
  onSelect,
  onHover,
}: MonumentSceneProps) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const flyingRef = useRef(false);

  useEffect(() => {
    document.body.style.cursor = hoveredId ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hoveredId]);

  const selected = elements.find((el) => el.id === selectedId);
  const hovered = elements.find((el) => el.id === hoveredId && el.id !== selectedId);

  return (
    <Canvas
      flat
      dpr={[1, 2]}
      camera={{ fov: 42, near: 0.5, far: 2500, position: [78, 52, 98] }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={['#060b14']} />

      {/* Sol : quadrillage métrique, cellule 1 m / section 5 m */}
      <Grid
        position={[0, -0.05, 0]}
        args={[10, 10]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#16324f"
        sectionSize={5}
        sectionThickness={1.1}
        sectionColor="#1f5a8a"
        fadeDistance={190}
        fadeStrength={1.6}
        infiniteGrid
      />

      {elements.map((element) => {
        const interactive = visibleCategories.has(element.category);
        return (
          <ArchitecturalPrimitive
            key={element.id}
            element={element}
            state={visualStateFor(element, selectedId, hoveredId, visibleCategories)}
            interactive={interactive}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(element.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(element.id);
            }}
            onPointerOut={() => onHover(null)}
          />
        );
      })}

      {hovered && <ElementLabel element={hovered} selected={false} />}
      {selected && <ElementLabel element={selected} selected />}

      <CameraRig request={cameraRequest} controlsRef={controlsRef} flyingRef={flyingRef} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.09}
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={6}
        maxDistance={420}
        onStart={() => {
          flyingRef.current = false;
        }}
      />
    </Canvas>
  );
}
