import { useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { TimelinePhase } from '../../types/monument';

interface TimelineBarProps {
  phases: TimelinePhase[];
  activePhaseId: string;
  playing: boolean;
  onSelectPhase: (id: string) => void;
  onTogglePlay: () => void;
}

const ICON_BUTTON =
  'inline-flex size-9 items-center justify-center rounded-lg border border-slate-600/60 bg-slate-900/70 text-slate-200 transition-colors hover:border-sky-400/60 hover:text-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-slate-600/60 disabled:hover:text-slate-200';

export function TimelineBar({
  phases,
  activePhaseId,
  playing,
  onSelectPhase,
  onTogglePlay,
}: TimelineBarProps) {
  const [expandedFor, setExpandedFor] = useState<string | null>(null);

  const activeIndex = Math.max(
    0,
    phases.findIndex((p) => p.id === activePhaseId)
  );
  const active = phases[activeIndex];
  if (!active) return null;

  const expanded = expandedFor === active.id;
  const progress = phases.length > 1 ? activeIndex / (phases.length - 1) : 0;

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-3 md:p-4">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-xl border border-sky-400/20 bg-slate-950/80 p-3 shadow-2xl backdrop-blur-md md:p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="text-[11px] font-medium uppercase tracking-wider text-sky-300">
              {active.periodLabel}
            </p>
            <h2 className="text-base font-semibold leading-snug md:text-lg">{active.title}</h2>
            <p
              className={`mt-1 text-xs leading-relaxed text-slate-300 md:text-sm ${
                expanded ? '' : 'line-clamp-2'
              }`}
            >
              {active.summary}
              {expanded && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => setExpandedFor(null)}
                    className="font-medium text-sky-300 underline-offset-2 hover:underline"
                  >
                    Moins
                  </button>
                </>
              )}
            </p>
            {!expanded && (
              <button
                type="button"
                onClick={() => setExpandedFor(active.id)}
                className="text-xs font-medium text-sky-300 underline-offset-2 hover:underline"
              >
                Lire la suite
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              className={ICON_BUTTON}
              aria-label="Époque précédente"
              disabled={activeIndex === 0}
              onClick={() => onSelectPhase(phases[activeIndex - 1].id)}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className={ICON_BUTTON}
              aria-label={playing ? 'Mettre en pause le défilement' : 'Lancer le défilement'}
              onClick={onTogglePlay}
            >
              {playing ? (
                <Pause className="size-4" aria-hidden />
              ) : (
                <Play className="size-4" aria-hidden />
              )}
            </button>
            <button
              type="button"
              className={ICON_BUTTON}
              aria-label="Époque suivante"
              disabled={activeIndex === phases.length - 1}
              onClick={() => onSelectPhase(phases[activeIndex + 1].id)}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <nav aria-label="Chronologie" className="relative mt-3 h-10">
          <div className="absolute inset-x-5 top-[7px] h-0.5 rounded bg-slate-700" aria-hidden />
          <div
            className="absolute left-5 top-[7px] h-0.5 rounded bg-sky-400 transition-[width] duration-500"
            style={{ width: `calc((100% - 2.5rem) * ${progress})` }}
            aria-hidden
          />
          <ol className="relative flex justify-between">
            {phases.map((phase, index) => {
              const isActive = phase.id === activePhaseId;
              const isPast = index < activeIndex;
              return (
                <li key={phase.id}>
                  <button
                    type="button"
                    onClick={() => onSelectPhase(phase.id)}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`${phase.year} — ${phase.title}`}
                    className="group flex w-10 flex-col items-center gap-1 focus-visible:outline-none"
                  >
                    <span
                      className={`block size-4 rounded-full border transition-all group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-sky-300 ${
                        isActive
                          ? 'scale-110 border-amber-300 bg-amber-400 ring-4 ring-amber-400/25'
                          : isPast
                            ? 'border-sky-300 bg-sky-400 group-hover:bg-sky-300'
                            : 'border-slate-500 bg-slate-800 group-hover:border-sky-400'
                      }`}
                    />
                    <span
                      className={`text-[10px] tabular-nums md:text-xs ${
                        isActive ? 'font-semibold text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {phase.year}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </footer>
  );
}
