export type ElementCategory =
  | 'defense'
  | 'residentiel'
  | 'circulation'
  | 'institutionnel';

export type PrimitiveType =
  | 'tour_cylindrique'
  | 'courtine'
  | 'bastion'
  | 'corps_logis'
  | 'cour_sol'
  | 'fosse';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

export interface TimelinePhase {
  id: string;
  year: number;
  periodLabel: string;
  title: string;
  summary: string;
  cameraOverview: CameraPose;
}

export interface DetailLevels {
  quick: string;
  architecture: {
    dimensions: string;
    materials: string;
    structuralRole: string;
  };
  history: {
    narrative: string;
    notableFigures?: string[];
    currentRemains?: string;
  };
}

export interface ElementPhaseOverride {
  phaseId: string;
  roleLabel?: string;
  quickOverride?: string;
  historyAddition?: string;
  geometryPatch?: Record<string, unknown>;
}

export interface GeometrySegment {
  pos: [number, number, number];
  rotY?: number;
  w: number;
  h: number;
  d: number;
}

export interface ArchitecturalElement {
  id: string;
  name: string;
  category: ElementCategory;
  builtInPhase: string;
  demolishedInPhase?: string;
  levels: DetailLevels;
  phaseOverrides?: ElementPhaseOverride[];
  geometry: {
    primitive: PrimitiveType;
    position: [number, number, number];
    rotationY?: number;
    params: Record<string, unknown>;
  };
  cameraFocus: CameraPose;
}

export interface MonumentData {
  id: string;
  name: string;
  location: string;
  globalSummary: string;
  phases: TimelinePhase[];
  elements: ArchitecturalElement[];
}

export interface ResolvedElement extends ArchitecturalElement {
  isNewlyBuilt: boolean;
  isGhostFuture: boolean;
  activeRoleLabel?: string;
  resolvedQuick: string;
  resolvedHistoryNarrative: string;
  resolvedParams: Record<string, unknown>;
}
