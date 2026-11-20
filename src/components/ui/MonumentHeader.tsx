import { useState } from 'react';
import { Crosshair, Ghost, Info, Landmark, X } from 'lucide-react';
import type { MonumentData } from '../../types/monument';

interface MonumentHeaderProps {
  monument: MonumentData;
  includeGhosts: boolean;
  onToggleGhosts: () => void;
  onResetView: () => void;
}

const BUTTON =
  'pointer-events-auto inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium backdrop-blur-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300';

export function MonumentHeader({
  monument,
  includeGhosts,
  onToggleGhosts,
  onResetView,
}: MonumentHeaderProps) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-3 md:p-4">
      <div className="relative min-w-0">
        <div className="pointer-events-auto flex min-w-0 items-center gap-3 rounded-xl border border-sky-400/20 bg-slate-950/75 py-2 pl-3 pr-4 shadow-2xl backdrop-blur-md">
          <Landmark className="size-6 shrink-0 text-sky-400" aria-hidden />
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight md:text-lg">
              {monument.name}
            </h1>
            <p className="truncate text-xs text-slate-400">{monument.location}</p>
          </div>
        </div>

        {aboutOpen && (
          <section
            aria-label="À propos de la maquette"
            className="pointer-events-auto absolute left-0 top-full mt-2 w-[min(34rem,calc(100vw-1.5rem))] rounded-xl border border-sky-400/20 bg-slate-950/90 p-4 text-sm leading-relaxed text-slate-300 shadow-2xl backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => setAboutOpen(false)}
              aria-label="Fermer"
              className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              <X className="size-4" aria-hidden />
            </button>
            <p className="pr-6">{monument.globalSummary}</p>
            <p className="mt-3 text-xs text-slate-500">
              Glisser : orbiter · molette : zoom · clic droit : déplacer · ←/→ : changer d’époque ·
              Échap : désélectionner.
            </p>
          </section>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={includeGhosts}
          onClick={onToggleGhosts}
          title="Afficher en transparence les éléments construits plus tard"
          className={`${BUTTON} ${
            includeGhosts
              ? 'border-violet-400/60 bg-violet-500/20 text-violet-100'
              : 'border-slate-600/60 bg-slate-950/75 text-slate-300 hover:border-violet-400/40'
          }`}
        >
          <Ghost className="size-4" aria-hidden />
          <span className="hidden sm:inline">Éléments à venir</span>
        </button>
        <button
          type="button"
          onClick={onResetView}
          title="Recentrer la vue sur la période"
          aria-label="Recentrer la vue"
          className={`${BUTTON} border-slate-600/60 bg-slate-950/75 text-slate-300 hover:border-sky-400/50 hover:text-sky-100`}
        >
          <Crosshair className="size-4" aria-hidden />
          <span className="hidden sm:inline">Recentrer</span>
        </button>
        <button
          type="button"
          onClick={() => setAboutOpen((v) => !v)}
          aria-expanded={aboutOpen}
          aria-label="À propos de la maquette"
          title="À propos de la maquette"
          className={`${BUTTON} ${
            aboutOpen
              ? 'border-sky-400/60 bg-sky-500/20 text-sky-100'
              : 'border-slate-600/60 bg-slate-950/75 text-slate-300 hover:border-sky-400/50 hover:text-sky-100'
          }`}
        >
          <Info className="size-4" aria-hidden />
        </button>
      </div>
    </header>
  );
}
