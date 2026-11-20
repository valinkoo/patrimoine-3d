import type { MonumentData, ResolvedElement } from '../types/monument';

export function resolveMonumentElements(
  monument: MonumentData,
  activePhaseId: string,
  includeFutureGhosts: boolean
): ResolvedElement[] {
  const activePhase = monument.phases.find((p) => p.id === activePhaseId);
  if (!activePhase) return [];

  const phaseYearMap = new Map(monument.phases.map((p) => [p.id, p.year]));
  const currentYear = activePhase.year;

  return monument.elements
    .filter((el) => {
      const builtYear = phaseYearMap.get(el.builtInPhase) ?? 0;
      const demolishedYear = el.demolishedInPhase
        ? phaseYearMap.get(el.demolishedInPhase) ?? Infinity
        : Infinity;

      if (currentYear >= demolishedYear) return false;
      if (currentYear < builtYear) return includeFutureGhosts;
      return true;
    })
    .map((el) => {
      const builtYear = phaseYearMap.get(el.builtInPhase) ?? 0;
      const isGhostFuture = currentYear < builtYear;

      const applicableOverrides = isGhostFuture
        ? []
        : (el.phaseOverrides ?? []).filter((ov) => {
            const ovYear = phaseYearMap.get(ov.phaseId) ?? Infinity;
            return ovYear <= currentYear;
          });

      let activeRoleLabel: string | undefined;
      let resolvedQuick = el.levels.quick;
      let resolvedHistoryNarrative = el.levels.history.narrative;
      let resolvedParams: Record<string, unknown> = { ...el.geometry.params };

      for (const ov of applicableOverrides) {
        if (ov.roleLabel) activeRoleLabel = ov.roleLabel;
        if (ov.quickOverride) resolvedQuick = ov.quickOverride;
        if (ov.historyAddition) {
          resolvedHistoryNarrative += `\n\n${ov.historyAddition}`;
        }
        if (ov.geometryPatch) {
          resolvedParams = { ...resolvedParams, ...ov.geometryPatch };
        }
      }

      return {
        ...el,
        isNewlyBuilt: !isGhostFuture && el.builtInPhase === activePhaseId,
        isGhostFuture,
        activeRoleLabel,
        resolvedQuick,
        resolvedHistoryNarrative,
        resolvedParams,
      };
    });
}
