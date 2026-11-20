import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { ElementCategory, ResolvedElement, TimelinePhase } from '../../types/monument';
import { CATEGORY_META, CATEGORY_ORDER } from './categoryMeta';

interface ElementsSidebarProps {
  elements: ResolvedElement[];
  phases: TimelinePhase[];
  selectedId: string | null;
  hoveredId: string | null;
  visibleCategories: ReadonlySet<ElementCategory>;
  onToggleCategory: (category: ElementCategory) => void;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const PANEL =
  'pointer-events-auto flex min-h-0 flex-col overflow-hidden rounded-xl border border-sky-400/20 bg-slate-950/75 shadow-2xl backdrop-blur-md';

export function ElementsSidebar({
  elements,
  phases,
  selectedId,
  hoveredId,
  visibleCategories,
  onToggleCategory,
  onSelect,
  onHover,
}: ElementsSidebarProps) {
  const [open, setOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  const yearOf = (phaseId: string) => phases.find((p) => p.id === phaseId)?.year;

  const counts = new Map<ElementCategory, number>();
  for (const el of elements) counts.set(el.category, (counts.get(el.category) ?? 0) + 1);

  return (
    <aside
      aria-label="Éléments architecturaux"
      className="pointer-events-none absolute bottom-[12.5rem] left-3 top-[5.5rem] z-20 flex md:left-4"
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Afficher la liste des éléments"
          title="Afficher la liste des éléments"
          className="pointer-events-auto flex h-10 items-center gap-2 self-start rounded-lg border border-sky-400/30 bg-slate-950/75 px-3 text-sm text-slate-200 backdrop-blur-md hover:border-sky-400/60"
        >
          <PanelLeftOpen className="size-4" aria-hidden />
          <span className="tabular-nums">{elements.length}</span>
        </button>
      ) : (
        <div className={`${PANEL} w-72 max-w-[calc(100vw-1.5rem)]`}>
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 px-3 py-2">
            <h2 className="text-sm font-semibold">
              Éléments <span className="tabular-nums text-slate-400">· {elements.length}</span>
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Masquer la liste"
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              <PanelLeftClose className="size-4" aria-hidden />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-slate-700/60 px-3 py-2">
            {CATEGORY_ORDER.map((category) => {
              const meta = CATEGORY_META[category];
              const on = visibleCategories.has(category);
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggleCategory(category)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    on
                      ? meta.chipOn
                      : 'border-slate-700 bg-transparent text-slate-500 hover:border-slate-500'
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${on ? meta.dot : 'bg-slate-600'}`} />
                  {meta.label}
                  <span className="tabular-nums opacity-70">{counts.get(category) ?? 0}</span>
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {elements.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-slate-400">
                Rien n’est debout à cette date.
              </p>
            )}

            {CATEGORY_ORDER.map((category) => {
              const group = elements.filter((el) => el.category === category);
              if (group.length === 0) return null;
              const meta = CATEGORY_META[category];
              return (
                <section key={category} className="mb-3 last:mb-0">
                  <h3
                    className={`flex items-center gap-1.5 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider ${meta.text}`}
                  >
                    <meta.Icon className="size-3.5" aria-hidden />
                    {meta.label}
                  </h3>
                  <ul className="space-y-0.5">
                    {group.map((el) => {
                      const selected = el.id === selectedId;
                      const hovered = el.id === hoveredId;
                      const builtYear = yearOf(el.builtInPhase);
                      return (
                        <li key={el.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(el.id);
                              // Sur petit écran, la liste libère la place à l’inspecteur et à la scène.
                              if (window.matchMedia('(max-width: 767px)').matches) setOpen(false);
                            }}
                            onMouseEnter={() => onHover(el.id)}
                            onMouseLeave={() => onHover(null)}
                            onFocus={() => onHover(el.id)}
                            onBlur={() => onHover(null)}
                            aria-pressed={selected}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-sky-300 ${
                              selected
                                ? 'border-amber-300/50 bg-amber-400/15 text-amber-50'
                                : hovered
                                  ? 'border-sky-400/40 bg-sky-400/10'
                                  : 'border-transparent hover:bg-slate-800/60'
                            } ${el.isGhostFuture ? 'text-violet-200/80' : ''}`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate">{el.name}</span>
                              {el.activeRoleLabel && (
                                <span className="block truncate text-[11px] text-slate-400">
                                  {el.activeRoleLabel}
                                </span>
                              )}
                            </span>
                            {el.isGhostFuture ? (
                              <span className="shrink-0 rounded border border-violet-400/40 bg-violet-400/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-200">
                                {builtYear ? `en ${builtYear}` : 'à venir'}
                              </span>
                            ) : el.isNewlyBuilt ? (
                              <span className="shrink-0 rounded border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-200">
                                nouveau
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
