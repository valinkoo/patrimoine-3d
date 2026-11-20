import { useCallback, useEffect, useMemo, useState } from 'react';
import { bastille } from './data/monuments/bastille';
import { resolveMonumentElements } from './utils/monumentResolver';
import type { CameraPose, ElementCategory, ResolvedElement } from './types/monument';
import { MonumentScene } from './components/canvas/MonumentScene';
import type { CameraRequest } from './components/canvas/MonumentScene';
import { MonumentHeader } from './components/ui/MonumentHeader';
import { TimelineBar } from './components/ui/TimelineBar';
import { ElementsSidebar } from './components/ui/ElementsSidebar';
import { InspectorDrawer } from './components/ui/InspectorDrawer';
import { CATEGORY_ORDER } from './components/ui/categoryMeta';

const monument = bastille;
const phases = monument.phases;

/** On démarre sur la forteresse complète (1383) plutôt que sur le chantier initial. */
const INITIAL_PHASE_ID = phases.find((p) => p.id === 'p1383')?.id ?? phases[0].id;

const AUTOPLAY_DELAY_MS = 4500;

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

export default function App() {
  const [phaseId, setPhaseId] = useState(INITIAL_PHASE_ID);
  const [includeGhosts, setIncludeGhosts] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<ReadonlySet<ElementCategory>>(
    () => new Set(CATEGORY_ORDER)
  );
  const [playing, setPlaying] = useState(false);
  const [cameraRequest, setCameraRequest] = useState<CameraRequest>(() => ({
    pose: (phases.find((p) => p.id === INITIAL_PHASE_ID) ?? phases[0]).cameraOverview,
    nonce: 0,
  }));

  const phaseIndex = Math.max(
    0,
    phases.findIndex((p) => p.id === phaseId)
  );
  const activePhase = phases[phaseIndex];

  const elements = useMemo(
    () => resolveMonumentElements(monument, phaseId, includeGhosts),
    [phaseId, includeGhosts]
  );

  // Une sélection ou un survol qui n’existent plus à cette date sont ignorés.
  const selectedElement = elements.find((el) => el.id === selectedId) ?? null;
  const effectiveSelectedId = selectedElement?.id ?? null;
  const effectiveHoveredId = elements.some((el) => el.id === hoveredId) ? hoveredId : null;

  const flyTo = useCallback((pose: CameraPose) => {
    setCameraRequest((prev) => ({ pose, nonce: prev.nonce + 1 }));
  }, []);

  const goToPhase = useCallback(
    (id: string) => {
      const next = phases.find((p) => p.id === id);
      if (!next || next.id === phaseId) return;

      setPhaseId(id);
      const stillThere =
        selectedId !== null &&
        resolveMonumentElements(monument, id, includeGhosts).some((el) => el.id === selectedId);

      // Un élément sélectionné qui traverse les époques garde la caméra sur lui,
      // sinon on revient à la vue d’ensemble de la nouvelle période.
      if (!stillThere) {
        setSelectedId(null);
        flyTo(next.cameraOverview);
      }
    },
    [phaseId, selectedId, includeGhosts, flyTo]
  );

  const selectElement = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (id === null) return;
      const element = elements.find((el) => el.id === id);
      if (element) flyTo(element.cameraFocus);
    },
    [elements, flyTo]
  );

  const resetView = useCallback(() => {
    setSelectedId(null);
    flyTo(activePhase.cameraOverview);
  }, [activePhase, flyTo]);

  const toggleCategory = useCallback((category: ElementCategory) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const selectPhaseManually = useCallback(
    (id: string) => {
      setPlaying(false);
      goToPhase(id);
    },
    [goToPhase]
  );

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (phaseIndex >= phases.length - 1) goToPhase(phases[0].id);
    setPlaying(true);
  }, [playing, phaseIndex, goToPhase]);

  // Lecture automatique : une époque toutes les quelques secondes, puis arrêt.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (phaseIndex >= phases.length - 1) {
        setPlaying(false);
      } else {
        goToPhase(phases[phaseIndex + 1].id);
      }
    }, AUTOPLAY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [playing, phaseIndex, goToPhase]);

  // Clavier : ←/→ changent d’époque, Échap désélectionne.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowLeft' && phaseIndex > 0) {
        selectPhaseManually(phases[phaseIndex - 1].id);
      } else if (event.key === 'ArrowRight' && phaseIndex < phases.length - 1) {
        selectPhaseManually(phases[phaseIndex + 1].id);
      } else if (event.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phaseIndex, selectPhaseManually]);

  const focusElement = useCallback(
    (element: ResolvedElement) => flyTo(element.cameraFocus),
    [flyTo]
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#060b14] text-slate-100">
      <div className="absolute inset-0 z-0">
        <MonumentScene
          elements={elements}
          selectedId={effectiveSelectedId}
          hoveredId={effectiveHoveredId}
          visibleCategories={visibleCategories}
          cameraRequest={cameraRequest}
          onSelect={selectElement}
          onHover={setHoveredId}
        />
      </div>

      {elements.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
          <div className="max-w-sm rounded-xl border border-slate-600/50 bg-slate-950/70 px-5 py-4 text-center backdrop-blur-md">
            <p className="text-base font-semibold">Plus rien n’est debout</p>
            <p className="mt-1 text-sm text-slate-400">
              À cette date, la forteresse a disparu du paysage. Activez « Éléments à venir » pour
              voir en transparence ce qui sera exhumé plus tard.
            </p>
          </div>
        </div>
      )}

      <MonumentHeader
        monument={monument}
        includeGhosts={includeGhosts}
        onToggleGhosts={() => setIncludeGhosts((v) => !v)}
        onResetView={resetView}
      />

      <ElementsSidebar
        elements={elements}
        phases={phases}
        selectedId={effectiveSelectedId}
        hoveredId={effectiveHoveredId}
        visibleCategories={visibleCategories}
        onToggleCategory={toggleCategory}
        onSelect={selectElement}
        onHover={setHoveredId}
      />

      <InspectorDrawer
        element={selectedElement}
        phases={phases}
        onClose={() => setSelectedId(null)}
        onFocus={focusElement}
      />

      <TimelineBar
        phases={phases}
        activePhaseId={phaseId}
        playing={playing}
        onSelectPhase={selectPhaseManually}
        onTogglePlay={togglePlay}
      />
    </div>
  );
}
