import { Castle, House, Landmark, Route } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ElementCategory } from '../../types/monument';

/**
 * Libellés, icônes et classes Tailwind (écrites en entier pour être détectées
 * par Tailwind) partagés par la liste d’éléments et l’inspecteur.
 */
export interface CategoryMeta {
  label: string;
  Icon: LucideIcon;
  /** Couleur du texte / de l’icône. */
  text: string;
  /** Pastille pleine. */
  dot: string;
  /** Pastille de badge (bordure + fond + texte). */
  badge: string;
  /** Puce de filtre active. */
  chipOn: string;
}

export const CATEGORY_ORDER: readonly ElementCategory[] = [
  'defense',
  'residentiel',
  'circulation',
  'institutionnel',
];

export const CATEGORY_META: Record<ElementCategory, CategoryMeta> = {
  defense: {
    label: 'Défense',
    Icon: Castle,
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    badge: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
    chipOn: 'border-sky-400/60 bg-sky-400/15 text-sky-100',
  },
  residentiel: {
    label: 'Résidentiel',
    Icon: House,
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    badge: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
    chipOn: 'border-amber-400/60 bg-amber-400/15 text-amber-100',
  },
  circulation: {
    label: 'Circulation',
    Icon: Route,
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    badge: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    chipOn: 'border-emerald-400/60 bg-emerald-400/15 text-emerald-100',
  },
  institutionnel: {
    label: 'Institutionnel',
    Icon: Landmark,
    text: 'text-violet-300',
    dot: 'bg-violet-400',
    badge: 'border-violet-400/40 bg-violet-400/10 text-violet-200',
    chipOn: 'border-violet-400/60 bg-violet-400/15 text-violet-100',
  },
};
