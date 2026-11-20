import { useState } from 'react';
import type { ReactNode } from 'react';
import { Crosshair, X } from 'lucide-react';
import type { ResolvedElement, TimelinePhase } from '../../types/monument';
import { CATEGORY_META } from './categoryMeta';

interface InspectorDrawerProps {
  element: ResolvedElement | null;
  phases: TimelinePhase[];
  onClose: () => void;
  onFocus: (element: ResolvedElement) => void;
}

type TabId = 'apercu' | 'architecture' | 'histoire';

const TABS: { id: TabId; label: string }[] = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'histoire', label: 'Histoire' },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">{label}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed text-slate-200">{children}</dd>
    </div>
  );
}

function InspectorContent({
  element,
  phases,
  onClose,
  onFocus,
}: {
  element: ResolvedElement;
  phases: TimelinePhase[];
  onClose: () => void;
  onFocus: (element: ResolvedElement) => void;
}) {
  const [tab, setTab] = useState<TabId>('apercu');

  const meta = CATEGORY_META[element.category];
  const built = phases.find((p) => p.id === element.builtInPhase);
  const demolished = element.demolishedInPhase
    ? phases.find((p) => p.id === element.demolishedInPhase)
    : undefined;
  const { architecture, history } = element.levels;

  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 p-4">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.badge}`}
          >
            <meta.Icon className="size-3" aria-hidden />
            {meta.label}
          </span>
          <h2 className="mt-2 text-lg font-semibold leading-tight">{element.name}</h2>
          {element.activeRoleLabel && (
            <p className="mt-0.5 text-sm text-amber-300">{element.activeRoleLabel}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l’inspecteur"
          className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {element.isGhostFuture && built && (
        <p className="border-b border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs text-violet-200">
          Pas encore construit à cette date : il sera élevé en {built.year}.
        </p>
      )}
      {element.isNewlyBuilt && (
        <p className="border-b border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-200">
          Construit durant cette période.
        </p>
      )}

      <div role="tablist" aria-label="Niveau de détail" className="flex border-b border-slate-700/60 px-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? 'border-amber-400 text-amber-200'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto p-4"
      >
        {tab === 'apercu' && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-100">{element.resolvedQuick}</p>
            <dl className="space-y-3">
              <Field label="Construit">{built ? built.periodLabel : '—'}</Field>
              {demolished && <Field label="Disparu">{demolished.periodLabel}</Field>}
            </dl>
            <button
              type="button"
              onClick={() => onFocus(element)}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-sm font-medium text-sky-100 transition-colors hover:bg-sky-400/20"
            >
              <Crosshair className="size-4" aria-hidden />
              Recentrer la caméra
            </button>
          </div>
        )}

        {tab === 'architecture' && (
          <dl className="space-y-4">
            <Field label="Dimensions">{architecture.dimensions}</Field>
            <Field label="Matériaux">{architecture.materials}</Field>
            <Field label="Rôle structurel">{architecture.structuralRole}</Field>
          </dl>
        )}

        {tab === 'histoire' && (
          <div className="space-y-4">
            <div className="space-y-3 text-sm leading-relaxed text-slate-200">
              {element.resolvedHistoryNarrative.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            {history.notableFigures && history.notableFigures.length > 0 && (
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                  Figures liées (toutes époques)
                </h3>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-slate-200">
                  {history.notableFigures.map((figure) => (
                    <li key={figure}>{figure}</li>
                  ))}
                </ul>
              </section>
            )}
            {history.currentRemains && (
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                  Ce qu’il en reste aujourd’hui
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-200">
                  {history.currentRemains}
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function InspectorDrawer({ element, phases, onClose, onFocus }: InspectorDrawerProps) {
  // On garde le dernier élément affiché pour que le tiroir se referme en douceur.
  const [shown, setShown] = useState<ResolvedElement | null>(element);
  if (element !== null && element !== shown) setShown(element);
  const content = element ?? shown;

  return (
    <aside
      aria-label="Inspecteur d’élément"
      aria-hidden={element === null}
      inert={element === null}
      className={`absolute z-20 flex flex-col overflow-hidden rounded-xl border border-amber-300/20 bg-slate-950/85 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out max-md:inset-x-3 max-md:bottom-[12.5rem] max-md:max-h-[42vh] md:bottom-[12.5rem] md:right-4 md:top-[5.5rem] md:w-96 ${
        element
          ? 'opacity-100 max-md:translate-y-0 md:translate-x-0'
          : 'pointer-events-none opacity-0 max-md:translate-y-6 md:translate-x-8'
      }`}
    >
      {content && (
        <InspectorContent
          key={content.id}
          element={content}
          phases={phases}
          onClose={onClose}
          onFocus={onFocus}
        />
      )}
    </aside>
  );
}
