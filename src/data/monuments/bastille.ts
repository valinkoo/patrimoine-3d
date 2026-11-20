import type {
  ArchitecturalElement,
  CameraPose,
  ElementCategory,
  ElementPhaseOverride,
  MonumentData,
  TimelinePhase,
} from '../../types/monument';

/* -------------------------------------------------------------------------- */
/*  Chronologie                                                               */
/* -------------------------------------------------------------------------- */

const P = {
  fondation: 'p1370',
  achevee: 'p1383',
  bastion: 'p1553',
  prison: 'p1634',
  prise: 'p1789',
  demolition: 'p1791',
  vestiges: 'p1899',
} as const;

const phases: TimelinePhase[] = [
  {
    id: P.fondation,
    year: 1370,
    periodLabel: '1370 · Règne de Charles V',
    title: 'La bastide Saint-Antoine',
    summary:
      'Le 22 avril 1370, le prévôt de Paris Hugues Aubriot pose la première pierre d’une « bastide » destinée à verrouiller la porte Saint-Antoine, à l’est de l’enceinte de Charles V. Deux tours encadrent d’abord la porte.',
    cameraOverview: { position: [8, 26, -52], target: [1, 8, -14] },
  },
  {
    id: P.achevee,
    year: 1383,
    periodLabel: '1383 · Règne de Charles VI',
    title: 'La forteresse aux huit tours',
    summary:
      'Le chantier s’étend jusqu’à former un quadrilatère de huit tours reliées par de hautes courtines, d’environ 66 × 34 m, entouré d’un fossé. La Bastille est alors un pur ouvrage militaire au service de la défense de Paris.',
    cameraOverview: { position: [78, 64, 96], target: [0, 0, 0] },
  },
  {
    id: P.bastion,
    year: 1553,
    periodLabel: '1553 · Règne d’Henri II',
    title: 'Un bastion pour l’artillerie',
    summary:
      'Face aux progrès de l’artillerie, un bastion de terre et de pierre est ajouté au nord, relié à la forteresse par une passerelle. Les couronnements médiévaux des tours cèdent la place à des plates-formes de tir.',
    cameraOverview: { position: [84, 104, 100], target: [0, 0, -30] },
  },
  {
    id: P.prison,
    year: 1634,
    periodLabel: 'Années 1630 · Louis XIII et Richelieu',
    title: 'La prison d’État',
    summary:
      'À partir des années 1630, la forteresse sert de plus en plus à enfermer, sur ordre du roi, des prisonniers d’État. L’entrée passe à l’est, par une avancée et la cour du Gouvernement ; une administration s’installe dans les cours : conseil, chapelle, bibliothèque, archives.',
    cameraOverview: { position: [96, 100, 108], target: [12, 0, -26] },
  },
  {
    id: P.prise,
    year: 1789,
    periodLabel: '14 juillet 1789 · Louis XVI',
    title: 'La prise de la Bastille',
    summary:
      'Le 14 juillet 1789, des Parisiens en quête de poudre et d’armes assiègent la forteresse, qui ne compte alors que sept prisonniers. Après plusieurs heures de combat, le gouverneur de Launay capitule : l’événement devient le symbole de la Révolution.',
    cameraOverview: { position: [-96, 100, 104], target: [12, 0, -26] },
  },
  {
    id: P.demolition,
    year: 1791,
    periodLabel: '1791 · La Révolution',
    title: 'La disparition',
    summary:
      'Dès le 16 juillet 1789, la démolition commence, menée par l’entrepreneur Pierre-François Palloy. En 1791, il ne reste plus rien de la forteresse : ses pierres ont servi de matériaux de construction et de souvenirs.',
    cameraOverview: { position: [90, 80, 100], target: [0, 0, -10] },
  },
  {
    id: P.vestiges,
    year: 1899,
    periodLabel: '1899 · Troisième République',
    title: 'Les vestiges',
    summary:
      'Au tournant du XXe siècle, les travaux du métro exhument les fondations de la tour de la Liberté. Elles sont remontées square Henri-Galli : la forteresse n’existe plus que par ses vestiges et par son emplacement dans la ville.',
    cameraOverview: { position: [34, 30, 58], target: [-10, 1, 13.5] },
  },
];

/* -------------------------------------------------------------------------- */
/*  Plan                                                                      */
/*  Positions relevées sur le « Plan de la Bastille » (BnF Gallica), puis     */
/*  converties en mètres à l’échelle du plan (≈ 66 m pour la longueur totale).*/
/*  Axe X = droite du plan · axe Z = bas du plan (le nord est en -Z, côté     */
/*  bastion) · axe Y = hauteur. Origine = centre de la forteresse.            */
/* -------------------------------------------------------------------------- */

const TOWER_RADIUS = 5;
const TOWER_HEIGHT = 24;
const WALL_HEIGHT = 22;
const WALL_THICKNESS = 3;

const NOTE_PLAN =
  'Position relevée sur le plan de la Bastille (BnF Gallica) ; cotes estimées à l’échelle du plan, hauteurs estimées.';

const REMAINS_GENERIC =
  'Rien ne subsiste en élévation ; l’emplacement se trouve dans l’emprise de l’actuelle place de la Bastille et de ses abords.';

/* -------------------------------------------------------------------------- */
/*  Caméras                                                                   */
/* -------------------------------------------------------------------------- */

function focusAround(x: number, z: number, dist = 46, y = 26): CameraPose {
  return {
    position: [x + (x >= 0 ? 22 : -22), y, z + (z >= 0 ? dist : -dist)],
    target: [x, 10, z],
  };
}

/* -------------------------------------------------------------------------- */
/*  Tours                                                                     */
/* -------------------------------------------------------------------------- */

const TOWER_DIMENSIONS =
  'Diamètre ≈ 10 m · hauteur ≈ 24 m · murs très épais à la base (ordres de grandeur d’après le plan). Chaque tour comporte 4, 5 ou 6 chambres superposées, généralement octogonales, de 6 à 7 m de largeur et d’environ 5 m sous plafond, éclairées par une grande fenêtre barrée d’une triple grille.';
const TOWER_MATERIALS =
  'Maçonnerie de pierre calcaire de la région parisienne ; planchers et charpentes de bois.';

function towerOverrides(name: string, add1789 = ''): ElementPhaseOverride[] {
  return [
    {
      phaseId: P.bastion,
      roleLabel: 'Tour d’artillerie',
      geometryPatch: { crown: 'parapet' },
      historyAddition:
        'Avec l’essor de l’artillerie, le couronnement à créneaux est remplacé par une plate-forme de tir à parapet : la tour ne se contente plus de surveiller, elle porte des canons.',
    },
    {
      phaseId: P.prison,
      roleLabel: 'Tour-prison',
      quickOverride: `${name} : ses étages superposés abritent désormais des chambres de détention — un cachot au pied, des chambres aux niveaux intermédiaires, des « calottes » sous la plate-forme.`,
      historyAddition:
        'Devenue prison d’État, la tour est aménagée en cellules étagées : cachot en bas, chambres aux étages, et sous la plate-forme les « calottes », cellules les plus exposées au chaud et au froid. Les détenus y sont enfermés sur lettre de cachet, c’est-à-dire sur ordre du roi, sans procès.',
    },
    {
      phaseId: P.prise,
      roleLabel: 'Tour assiégée',
      historyAddition: `Le 14 juillet 1789, les assiégeants, venus chercher de la poudre et des armes, affrontent une garnison d’une centaine d’hommes, invalides et grenadiers suisses. La forteresse capitule en fin d’après-midi ; sa démolition commencera dès le 16 juillet.${add1789 ? ` ${add1789}` : ''}`,
    },
  ];
}

interface TowerSpec {
  id: string;
  name: string;
  letter: string;
  x: number;
  z: number;
  builtInPhase: string;
  quick: string;
  structuralRole: string;
  narrative: string;
  notableFigures?: string[];
  add1789?: string;
}

function tower(spec: TowerSpec): ArchitecturalElement {
  return {
    id: spec.id,
    name: spec.name,
    category: 'defense',
    builtInPhase: spec.builtInPhase,
    demolishedInPhase: P.demolition,
    levels: {
      quick: spec.quick,
      architecture: {
        dimensions: TOWER_DIMENSIONS,
        materials: TOWER_MATERIALS,
        structuralRole: `${spec.structuralRole} Repère « ${spec.letter} » sur le plan. ${NOTE_PLAN}`,
      },
      history: {
        narrative: spec.narrative,
        notableFigures: spec.notableFigures,
        currentRemains:
          spec.id === 'tour-liberte'
            ? 'Les fondations de la tour ont été exhumées en 1899 et remontées square Henri-Galli (voir « Vestiges de la tour de la Liberté »).'
            : REMAINS_GENERIC,
      },
    },
    phaseOverrides: towerOverrides(spec.name, spec.add1789),
    geometry: {
      primitive: 'tour_cylindrique',
      position: [spec.x, 0, spec.z],
      params: {
        radius: TOWER_RADIUS,
        height: TOWER_HEIGHT,
        radialSegments: 40,
        crown: 'merlons',
      },
    },
    cameraFocus: focusAround(spec.x, spec.z),
  };
}

const towers: ArchitecturalElement[] = [
  tower({
    id: 'tour-coin',
    name: 'Tour du Coin',
    letter: 'A',
    x: -28,
    z: -10.5,
    builtInPhase: P.achevee,
    quick:
      'Tour d’angle du front nord, du côté de la rue Saint-Antoine. Son nom rappelle sa position d’angle.',
    structuralRole: 'Tour d’angle : articule le front nord et la face qui borde la rue.',
    narrative:
      'Élevée lors de la seconde campagne de travaux, la tour du Coin prolonge vers l’extérieur la ligne des deux premières tours. Elle ferme l’angle du quadrilatère du côté de la rue Saint-Antoine.',
  }),
  tower({
    id: 'tour-chapelle',
    name: 'Tour de la Chapelle',
    letter: 'B',
    x: -8,
    z: -17.5,
    builtInPhase: P.fondation,
    quick:
      'L’une des deux premières tours, à gauche de l’ancienne porte Saint-Antoine. Elle doit son nom à la chapelle de la forteresse.',
    structuralRole:
      'Flanque l’ancienne porte Saint-Antoine et bat le fossé et les abords de la porte.',
    narrative:
      'En 1370, la tour de la Chapelle compte parmi les deux premières tours élevées de part et d’autre de l’ancienne porte de ville dite de Saint-Antoine (« O » sur le plan). Le chantier est conduit par Hugues Aubriot, prévôt de Paris, pour le compte de Charles V, qui veut renforcer la défense de l’est de la capitale en pleine guerre de Cent Ans.\n\nLe mot « bastille » vient de « bastide », un petit ouvrage fortifié : le nom passera plus tard de l’ouvrage au monument tout entier.',
    notableFigures: ['Hugues Aubriot, prévôt de Paris', 'Charles V, roi de France'],
  }),
  tower({
    id: 'tour-tresor',
    name: 'Tour du Trésor',
    letter: 'C',
    x: 9.5,
    z: -17.5,
    builtInPhase: P.fondation,
    quick:
      'Seconde tour de la première campagne, à droite de l’ancienne porte. La tradition y place le dépôt de l’argent et des papiers du roi.',
    structuralRole:
      'Flanque l’ancienne porte Saint-Antoine côté est ; protège la salle de dépôt.',
    narrative:
      'Avec la tour de la Chapelle, la tour du Trésor forme dès 1370 le noyau de la bastide : deux tours rondes, une porte entre elles. Forteresse du roi, la Bastille est aussi un lieu sûr où garder de l’argent, des armes et des archives.',
    notableFigures: ['Sully, surintendant des Finances d’Henri IV (selon la tradition)'],
    add1789:
      'La tradition rapporte qu’au début du XVIIe siècle, Sully y avait mis en dépôt une part des fonds du roi.',
  }),
  tower({
    id: 'tour-comte',
    name: 'Tour de la Comté',
    letter: 'D',
    x: 28,
    z: -10.5,
    builtInPhase: P.achevee,
    quick:
      'Tour d’angle nord-est du quadrilatère, au contact de l’avancée d’entrée.',
    structuralRole:
      'Tour d’angle : protège l’entrée orientale et le corps de garde voisin.',
    narrative:
      'Dernière tour du front nord, la tour de la Comté ferme l’angle côté est. Elle voisine avec l’avancée et le pont-levis qui, plus tard, deviendront l’entrée de la forteresse.',
  }),
  tower({
    id: 'tour-puits',
    name: 'Tour du Puits',
    letter: 'E',
    x: -28,
    z: 12,
    builtInPhase: P.achevee,
    quick:
      'Tour d’angle sud-ouest, ouvrant sur la cour du Puits. Son nom rappelle le puits de la forteresse.',
    structuralRole:
      'Tour d’angle sud-ouest : surveille la rue Saint-Antoine et la cour du Puits.',
    narrative:
      'Une forteresse doit pouvoir tenir un siège : l’eau est une question de survie. Le puits, dans la cour qui porte son nom, donne son nom à cette tour d’angle.',
  }),
  tower({
    id: 'tour-liberte',
    name: 'Tour de la Liberté',
    letter: 'F',
    x: -10,
    z: 13.5,
    builtInPhase: P.achevee,
    quick:
      'Tour du front sud, côté cour du Puits. Le marquis de Sade y a été détenu.',
    structuralRole:
      'Tour du front sud : flanque la courtine et bat le fossé méridional.',
    narrative:
      'Elle fait partie de la seconde campagne de travaux. Comme les autres, elle est d’abord conçue comme une tour de défense : ses étages servent de salles de garde, de magasins et de postes de tir.',
    notableFigures: ['Marquis de Sade, détenu de 1784 à juillet 1789'],
    add1789:
      'Selon la tradition, c’est dans cette tour que le marquis de Sade, détenu depuis 1784, rédige en 1785 Les 120 Journées de Sodome sur un long rouleau de papier. Le 2 juillet 1789, il harangue la foule en criant que l’on égorge les prisonniers ; il est transféré à Charenton le 4 juillet, dix jours avant la prise. Son manuscrit, laissé dans sa cellule, sera perdu puis retrouvé.',
  }),
  tower({
    id: 'tour-bertaudiere',
    name: 'Tour de la Bertaudière',
    letter: 'G',
    x: 8,
    z: 13.5,
    builtInPhase: P.achevee,
    quick: 'Tour du front sud, côté Grande Cour.',
    structuralRole:
      'Tour du front sud : flanque la courtine et domine la Grande Cour.',
    narrative:
      'Au centre-est du front sud, la tour de la Bertaudière complète la ligne défensive : quatre tours de chaque côté du quadrilatère, avec des murs qui s’élèvent d’un seul jet depuis le fossé.',
  }),
  tower({
    id: 'tour-baziniere',
    name: 'Tour de la Bazinière',
    letter: 'H',
    x: 28,
    z: 12,
    builtInPhase: P.achevee,
    quick:
      'Tour d’angle sud-est, du côté de l’avancée d’entrée.',
    structuralRole: 'Tour d’angle sud-est : protège l’entrée orientale par le sud.',
    narrative:
      'Dernière tour de la campagne de construction, elle clôt le quadrilatère au sud-est. Avec elle, la Bastille atteint sa forme définitive : huit tours rondes de même hauteur.',
    notableFigures: ['Macé Bertrand de La Bazinière, trésorier de l’Épargne (1661)'],
    add1789:
      'Selon la tradition, elle doit son nom à Macé Bertrand de La Bazinière, trésorier de l’Épargne emprisonné en 1661 dans la chute du surintendant Fouquet.',
  }),
];

/* -------------------------------------------------------------------------- */
/*  Courtines                                                                 */
/* -------------------------------------------------------------------------- */

function courtineOverrides(): ElementPhaseOverride[] {
  return [
    {
      phaseId: P.bastion,
      geometryPatch: { crenellated: false },
      historyAddition:
        'Au XVIe siècle, le couronnement crénelé est arasé pour offrir un chemin de ronde dégagé, plus adapté au service des armes à feu.',
    },
    {
      phaseId: P.prise,
      roleLabel: 'Mur assiégé',
      historyAddition:
        'En juillet 1789, derrière ces murs de plus de 20 m, une garnison d’invalides et de grenadiers suisses tient la forteresse. La hauteur des murs rend toute escalade impossible : c’est par les ponts-levis que les assaillants tentent l’approche.',
    },
  ];
}

type Pt = readonly [number, number];

interface CourtineSpec {
  id: string;
  name: string;
  /** Centres des deux tours reliées : le mur suit la droite qui les joint (diagonale possible). */
  a: Pt;
  b: Pt;
  between: string;
}

function courtine(spec: CourtineSpec): ArchitecturalElement {
  const dx = spec.b[0] - spec.a[0];
  const dz = spec.b[1] - spec.a[1];
  const length = Math.round((Math.hypot(dx, dz) - 2 * (TOWER_RADIUS - 0.5)) * 10) / 10;
  const x = Math.round(((spec.a[0] + spec.b[0]) / 2) * 100) / 100;
  const z = Math.round(((spec.a[1] + spec.b[1]) / 2) * 100) / 100;
  return {
    id: spec.id,
    name: spec.name,
    category: 'defense',
    builtInPhase: P.achevee,
    demolishedInPhase: P.demolition,
    levels: {
      quick: `Mur-rideau d’environ 22 m de haut reliant ${spec.between}.`,
      architecture: {
        dimensions: `Longueur ≈ ${length} m entre deux tours · hauteur ≈ 22 m · épaisseur ≈ 3 m (ordres de grandeur d’après le plan).`,
        materials: TOWER_MATERIALS,
        structuralRole: `Courtine : elle relie les tours, porte le chemin de ronde et ferme l’enceinte entre deux flanquements. ${NOTE_PLAN}`,
      },
      history: {
        narrative:
          'La courtine est le mur qui relie deux tours. Montée en même temps que les tours de la seconde campagne, elle donne à la Bastille son allure de bloc : des murs de pierre lisses, que l’on ne franchit qu’en passant par la porte.',
        currentRemains: REMAINS_GENERIC,
      },
    },
    phaseOverrides: courtineOverrides(),
    geometry: {
      primitive: 'courtine',
      position: [x, 0, z],
      rotationY: -Math.atan2(dz, dx),
      params: {
        length,
        height: WALL_HEIGHT,
        thickness: WALL_THICKNESS,
        crenellated: true,
      },
    },
    cameraFocus: focusAround(x, z, 44, 24),
  };
}

/** Centres des tours relevés sur le plan (A…H). B et C sont avancées vers le bastion. */
const TA: Pt = [-28, -10.5];
const TB: Pt = [-8, -17.5];
const TC: Pt = [9.5, -17.5];
const TD: Pt = [28, -10.5];
const TE: Pt = [-28, 12];
const TF: Pt = [-10, 13.5];
const TG: Pt = [8, 13.5];
const TH: Pt = [28, 12];

const courtines: ArchitecturalElement[] = [
  courtine({ id: 'courtine-coin-chapelle', name: 'Courtine Coin–Chapelle', a: TA, b: TB, between: 'la tour du Coin à la tour de la Chapelle' }),
  courtine({ id: 'courtine-tresor-comte', name: 'Courtine Trésor–Comté', a: TC, b: TD, between: 'la tour du Trésor à la tour de la Comté' }),
  courtine({ id: 'courtine-puits-liberte', name: 'Courtine Puits–Liberté', a: TE, b: TF, between: 'la tour du Puits à la tour de la Liberté' }),
  courtine({ id: 'courtine-liberte-bertaudiere', name: 'Courtine Liberté–Bertaudière', a: TF, b: TG, between: 'la tour de la Liberté à la tour de la Bertaudière' }),
  courtine({ id: 'courtine-bertaudiere-baziniere', name: 'Courtine Bertaudière–Bazinière', a: TG, b: TH, between: 'la tour de la Bertaudière à la tour de la Bazinière' }),
  courtine({ id: 'courtine-ouest', name: 'Courtine ouest', a: TA, b: TE, between: 'la tour du Coin à la tour du Puits, côté rue Saint-Antoine' }),
  courtine({ id: 'courtine-est', name: 'Courtine est', a: TD, b: TH, between: 'la tour de la Comté à la tour de la Bazinière, côté avancée' }),
];


/* -------------------------------------------------------------------------- */
/*  Ancienne porte Saint-Antoine (« O »)                                      */
/* -------------------------------------------------------------------------- */

const anciennePorte: ArchitecturalElement = {
  id: 'porte-saint-antoine',
  name: 'Ancienne porte Saint-Antoine',
  category: 'circulation',
  builtInPhase: P.fondation,
  demolishedInPhase: P.demolition,
  levels: {
    quick:
      'Passage fortifié entre les deux premières tours : c’est lui qui a justifié toute la construction.',
    architecture: {
      dimensions:
        'Mur de ≈ 8 m entre les tours · baie d’environ 4,5 m de large pour 7 m de haut (modèle schématique).',
      materials: TOWER_MATERIALS,
      structuralRole: `Contrôle l’entrée orientale de Paris ; un pont-levis franchit le fossé devant le passage. Repère « O » sur le plan : « ancienne porte de ville dite de Saint-Antoine ». ${NOTE_PLAN}`,
    },
    history: {
      narrative:
        'La Bastille naît d’une porte : la porte Saint-Antoine, qui ouvre l’enceinte de Charles V sur l’est de Paris. En 1370, on y adosse un ouvrage défensif où deux tours encadrent le passage. Tout ce qui entre ou sort de la capitale par cet axe passe sous la surveillance de la garnison.',
      notableFigures: ['Hugues Aubriot, prévôt de Paris', 'Charles V, roi de France'],
      currentRemains: REMAINS_GENERIC,
    },
  },
  phaseOverrides: [
    {
      phaseId: P.bastion,
      roleLabel: 'Accès au bastion',
      geometryPatch: { crenellated: false },
      historyAddition:
        'Avec l’ajout du bastion, la porte s’ouvre sur la passerelle qui conduit à l’ouvrage avancé : le plan de 1789 la désigne comme « ancienne porte pour aller au bastion ».',
    },
    {
      phaseId: P.prison,
      roleLabel: 'Ancienne porte',
      historyAddition:
        'L’entrée principale passe désormais à l’est, par l’avancée et le pont-levis : l’ancienne porte de ville ne sert plus qu’à rejoindre le bastion.',
    },
  ],
  geometry: {
    primitive: 'courtine',
    position: [0.75, 0, -17.5],
    params: {
      length: 8.5,
      height: WALL_HEIGHT,
      thickness: WALL_THICKNESS,
      gateWidth: 4.5,
      gateHeight: 7,
      crenellated: true,
    },
  },
  cameraFocus: { position: [4, 22, -56], target: [0.75, 9, -12] },
};

/* -------------------------------------------------------------------------- */
/*  Fossé, cours                                                              */
/* -------------------------------------------------------------------------- */

const fosse: ArchitecturalElement = {
  id: 'fosse',
  name: 'Fossé',
  category: 'defense',
  builtInPhase: P.achevee,
  demolishedInPhase: P.demolition,
  levels: {
    quick:
      'Fossé d’une douzaine de mètres de large qui ceinture toute la forteresse : le premier obstacle de l’assaillant.',
    architecture: {
      dimensions:
        'Largeur ≈ 12 m (mesurée à l’échelle du plan) · profondeur ≈ 8 m (estimation) · contour ≈ 90 × 65 m.',
      materials:
        'Tranchée creusée dans le sol, murs de soutènement en maçonnerie (escarpe et contrescarpe).',
      structuralRole:
        'Éloigne les assaillants du pied des murs, interdit la sape et l’échelle, et n’est franchi que par les ponts-levis. Le chemin des rondes (« Y » sur le plan) en suit le bord extérieur.',
    },
    history: {
      narrative:
        'Quand les travaux s’achèvent en 1383, la forteresse est ceinturée d’un fossé. Une escarpe tombe droit des murs de la forteresse, une contrescarpe lui fait face ; un chemin de rondes court au-delà.',
      currentRemains:
        'Un pan de la contrescarpe est visible dans la station de métro Bastille (ligne 5), découvert lors des travaux du métro.',
    },
  },
  phaseOverrides: [
    {
      phaseId: P.prise,
      roleLabel: 'Fossé défensif',
      historyAddition:
        'En juillet 1789, le fossé garde son rôle : sans les ponts-levis, la foule ne peut approcher des murs. C’est à ces ponts que se concentrent les assauts.',
    },
  ],
  geometry: {
    primitive: 'fosse',
    position: [0, 0, -2],
    params: { innerWidth: 66, innerDepth: 43, moatWidth: 12, depth: 8 },
  },
  cameraFocus: { position: [0, 96, 108], target: [0, 0, -1] },
};

function cour(
  id: string,
  name: string,
  x: number,
  z: number,
  width: number,
  depth: number,
  builtInPhase: string,
  quick: string,
  narrative: string,
  overrides: ElementPhaseOverride[] = []
): ArchitecturalElement {
  return {
    id,
    name,
    category: 'circulation',
    builtInPhase,
    demolishedInPhase: P.demolition,
    levels: {
      quick,
      architecture: {
        dimensions: `Environ ${width} × ${depth} m (relevé d’après le plan).`,
        materials: 'Sol dallé ou pavé.',
        structuralRole: `Espace de circulation et de rassemblement. ${NOTE_PLAN}`,
      },
      history: { narrative, currentRemains: REMAINS_GENERIC },
    },
    phaseOverrides: overrides,
    geometry: {
      primitive: 'cour_sol',
      position: [x, 0, z],
      params: { width, depth, thickness: 0.25 },
    },
    cameraFocus: focusAround(x, z, 52, 40),
  };
}

const cours: ArchitecturalElement[] = [
  cour(
    'grande-cour',
    'Grande Cour',
    6.25,
    -2.2,
    27.5,
    17,
    P.achevee,
    'La plus vaste des cours de la forteresse, au centre-est du quadrilatère (« S » sur le plan).',
    'Au cœur du quadrilatère, la Grande Cour permet à la garnison de circuler à l’abri des murs. Elle reste, tout au long de l’histoire de la Bastille, le lieu où l’on se rassemble et où l’on reçoit les ordres.',
    [
      {
        phaseId: P.prison,
        roleLabel: 'Cour de promenade',
        historyAddition:
          'Dans la forteresse-prison, la cour devient aussi le lieu où certains détenus sont autorisés à prendre l’air, à heure fixe et sous surveillance.',
      },
      {
        phaseId: P.prise,
        roleLabel: 'Cour envahie',
        historyAddition:
          'Après la capitulation, les assaillants envahissent la cour, libèrent les sept prisonniers et fouillent la forteresse. La poudre et les armes qu’ils y trouvent sont saisies.',
      },
    ]
  ),
  cour(
    'cour-du-puits',
    'Cour du Puits',
    -20,
    0.2,
    11,
    15,
    P.achevee,
    'Cour occidentale, entre les tours du Coin et du Puits, où se trouve le puits (« R » sur le plan).',
    'Séparée de la Grande Cour par le corps de bâtiments central, la cour du Puits donne accès aux tours de l’ouest et abrite le puits qui alimente la forteresse.'
  ),
  cour(
    'cour-du-gouvernement',
    'Cour du Gouvernement',
    59,
    -1,
    20,
    24,
    P.prison,
    'Cour extérieure, à l’est de l’avancée : c’est là qu’on arrive avant d’entrer dans la forteresse (« U » sur le plan).',
    'À l’est du fossé, une cour est dévolue à l’administration de la forteresse : on y trouve le logement du gouverneur et les cuisines. D’après le plan de 1789, elle précède l’avancée qui conduit au pont-levis d’entrée ; la date exacte de son aménagement n’est pas établie ici.'
  ),
];

/* -------------------------------------------------------------------------- */
/*  Bastion                                                                   */
/* -------------------------------------------------------------------------- */

const bastionNord: ArchitecturalElement = {
  id: 'bastion-nord',
  name: 'Bastion',
  category: 'defense',
  builtInPhase: P.bastion,
  demolishedInPhase: P.demolition,
  levels: {
    quick:
      'Ouvrage avancé en fer de lance, au nord, relié à la forteresse par une passerelle (« X » sur le plan).',
    architecture: {
      dimensions:
        'Base ≈ 52 m · profondeur ≈ 43 m · hauteur ≈ 8 m (relevé à l’échelle du plan, hauteur estimée).',
      materials: 'Remblai de terre contenu par une maçonnerie de pierre.',
      structuralRole:
        'Porte des canons à la hauteur des remparts adverses et bat les approches nord ; il est entouré de son propre fossé.',
    },
    history: {
      narrative:
        'Au XVIe siècle, les tours rondes médiévales ne suffisent plus face aux canons : on ajoute à la forteresse un bastion, ouvrage de plan angulaire dont les faces et les flancs se couvrent mutuellement. Il est bâti sous Henri II, au nord de la forteresse, dans l’axe de l’ancienne porte Saint-Antoine.',
      notableFigures: ['Henri II, roi de France'],
      currentRemains:
        'Rien ne subsiste ; son emplacement se trouve dans le quartier de la Bastille, sous les voies et les immeubles actuels.',
    },
  },
  phaseOverrides: [
    {
      phaseId: P.prise,
      roleLabel: 'Bastion',
      historyAddition:
        'Retour sur le XVIIe siècle : lors de la Fronde, en juillet 1652, les canons de la Bastille sont tirés sur les troupes royales au combat du faubourg Saint-Antoine, sur ordre de la Grande Mademoiselle.',
    },
  ],
  geometry: {
    primitive: 'bastion',
    position: [-1, 0, -41],
    rotationY: Math.PI / 2,
    params: { width: 52, flank: 17, salient: 26, height: 8 },
  },
  cameraFocus: { position: [50, 56, -6], target: [-1, 5, -58] },
};

const terrePleinBastion: ArchitecturalElement = {
  id: 'terre-plein-bastion',
  name: 'Terre-plein du bastion',
  category: 'circulation',
  builtInPhase: P.bastion,
  demolishedInPhase: P.demolition,
  levels: {
    quick:
      'Plate-forme plane au sommet du bastion, où prennent place les pièces d’artillerie.',
    architecture: {
      dimensions: 'Environ 44 × 14 m, à ≈ 8 m au-dessus du sol (modèle schématique).',
      materials: 'Terre damée, parapet de maçonnerie.',
      structuralRole: 'Plate-forme de tir et de manœuvre des canons.',
    },
    history: {
      narrative:
        'Au sommet du bastion, un terre-plein reçoit les canons. C’est le niveau d’où l’on commande les approches du nord.',
    },
  },
  phaseOverrides: [
    {
      phaseId: P.prison,
      roleLabel: 'Jardin et promenade',
      quickOverride:
        'Le terre-plein du bastion devient un jardin planté ; les récits de détenus évoquent des promenades sur ce bastion.',
      historyAddition:
        'Avec la fonction carcérale, le terre-plein perd peu à peu son rôle militaire : le plan de 1789 le montre planté de jardins, et des récits de détenus évoquent des promenades.',
    },
  ],
  geometry: {
    primitive: 'cour_sol',
    position: [-1, 8, -49.5],
    params: { width: 44, depth: 14, thickness: 0.3 },
  },
  cameraFocus: { position: [50, 56, -10], target: [-1, 8, -50] },
};

const passerelleBastion: ArchitecturalElement = {
  id: 'passerelle-bastion',
  name: 'Passerelle du bastion',
  category: 'circulation',
  builtInPhase: P.bastion,
  demolishedInPhase: P.demolition,
  levels: {
    quick:
      'Passage étroit qui franchit le fossé nord et relie l’ancienne porte au bastion.',
    architecture: {
      dimensions: 'Environ 20 m de long pour 5 m de large (relevé à l’échelle du plan).',
      materials: 'Chaussée de terre et de maçonnerie sur le fossé.',
      structuralRole: 'Unique liaison entre la forteresse et le bastion.',
    },
    history: {
      narrative:
        'Le bastion est relié à la forteresse par une étroite passerelle, alignée sur l’ancienne porte Saint-Antoine : on traverse le fossé en ligne droite pour passer de l’une à l’autre.',
      currentRemains: REMAINS_GENERIC,
    },
  },
  geometry: {
    primitive: 'courtine',
    position: [0.75, 0, -31.8],
    rotationY: Math.PI / 2,
    params: { length: 18, height: 5, thickness: 5, crenellated: false },
  },
  cameraFocus: { position: [40, 30, -2], target: [0.75, 3, -30] },
};

/* -------------------------------------------------------------------------- */
/*  Entrée orientale                                                          */
/* -------------------------------------------------------------------------- */

const avanceeEntree: ArchitecturalElement = {
  id: 'avancee-entree',
  name: 'Avancée et pont-levis d’entrée',
  category: 'circulation',
  builtInPhase: P.prison,
  demolishedInPhase: P.demolition,
  levels: {
    quick:
      'Long passage qui franchit le fossé à l’est et conduit au pont-levis d’entrée (« Q » sur le plan).',
    architecture: {
      dimensions: 'Environ 21 m de long pour 5 m de large (relevé à l’échelle du plan).',
      materials: 'Maçonnerie de pierre ; pont-levis de bois et de fer.',
      structuralRole:
        'Étire le chemin d’accès pour obliger l’arrivant à longer les murs sous le tir de la garnison.',
    },
    history: {
      narrative:
        'D’après le plan de 1789, l’entrée « actuelle » de la forteresse n’est plus l’ancienne porte de ville mais un long passage à l’est : on y arrive depuis la cour du Gouvernement, on franchit le pont-levis de l’Avancée, puis un second pont-levis ouvre sur la Grande Cour.',
      currentRemains: REMAINS_GENERIC,
    },
  },
  phaseOverrides: [
    {
      phaseId: P.prise,
      roleLabel: 'Entrée assiégée',
      historyAddition:
        'Le 14 juillet 1789, les assaillants s’emparent de la cour d’accès puis du pont-levis ; des canons amenés par des gardes-françaises sont pointés vers la porte, ce qui pousse le gouverneur de Launay à capituler.',
    },
  ],
  geometry: {
    primitive: 'courtine',
    position: [40, 0, 0.5],
    params: { length: 21, height: 7, thickness: 5, crenellated: false },
  },
  cameraFocus: { position: [66, 28, 44], target: [40, 4, 0.5] },
};

/* -------------------------------------------------------------------------- */
/*  Bâtiments                                                                 */
/* -------------------------------------------------------------------------- */

interface BuildingSpec {
  id: string;
  name: string;
  category: ElementCategory;
  letter?: string;
  x: number;
  z: number;
  sizeX: number;
  sizeZ: number;
  height: number;
  roofHeight: number;
  builtInPhase: string;
  quick: string;
  narrative: string;
  structuralRole: string;
  materials?: string;
  figures?: string[];
  overrides?: ElementPhaseOverride[];
}

function building(spec: BuildingSpec): ArchitecturalElement {
  const longZ = spec.sizeZ > spec.sizeX;
  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    builtInPhase: spec.builtInPhase,
    demolishedInPhase: P.demolition,
    levels: {
      quick: spec.quick,
      architecture: {
        dimensions: `Environ ${spec.sizeX} × ${spec.sizeZ} m, hauteur ≈ ${spec.height} m (emprise relevée sur le plan, hauteur estimée).`,
        materials:
          spec.materials ??
          'Maçonnerie de pierre et de moellons, charpente et planchers de bois, couverture d’ardoise.',
        structuralRole: `${spec.structuralRole}${spec.letter ? ` Repère « ${spec.letter} » sur le plan.` : ''} ${NOTE_PLAN}`,
      },
      history: {
        narrative: spec.narrative,
        notableFigures: spec.figures,
        currentRemains: REMAINS_GENERIC,
      },
    },
    phaseOverrides: spec.overrides,
    geometry: {
      primitive: 'corps_logis',
      position: [spec.x, 0, spec.z],
      rotationY: longZ ? Math.PI / 2 : 0,
      params: {
        width: longZ ? spec.sizeZ : spec.sizeX,
        depth: longZ ? spec.sizeX : spec.sizeZ,
        height: spec.height,
        roofHeight: spec.roofHeight,
      },
    },
    cameraFocus: focusAround(spec.x, spec.z, 52, 40),
  };
}

const buildings: ArchitecturalElement[] = [
  building({
    id: 'salle-du-conseil',
    name: 'Salle du Conseil',
    category: 'institutionnel',
    letter: 'I',
    x: -11,
    z: -6,
    sizeX: 6,
    sizeZ: 7,
    height: 14,
    roofHeight: 4,
    builtInPhase: P.prison,
    quick:
      'Bâtiment administratif du corps central, au nord : siège du conseil de l’état-major.',
    narrative:
      'Gérer une prison d’État, c’est aussi gérer des papiers : ordres du roi, registres d’écrou, interrogatoires. La Salle du Conseil, dans le bloc de bâtiments qui sépare la cour du Puits de la Grande Cour, est le lieu où se réunit l’état-major.',
    structuralRole: 'Salle de réunion et de bureaux ; elle fait partie du corps de bâtiments central.',
    overrides: [
      {
        phaseId: P.prise,
        roleLabel: 'Conseil de défense',
        historyAddition:
          'Le 14 juillet 1789, c’est là que le gouverneur de Launay et son état-major délibèrent sous la pression de la foule avant de décider de capituler.',
      },
    ],
  }),
  building({
    id: 'bibliotheque',
    name: 'Bibliothèque',
    category: 'institutionnel',
    letter: 'K',
    x: -11,
    z: 5.5,
    sizeX: 6,
    sizeZ: 7,
    height: 14,
    roofHeight: 4,
    builtInPhase: P.prison,
    quick:
      'Bibliothèque de la forteresse, dans le corps central, au sud de la Salle du Conseil.',
    narrative:
      'Le plan de 1789 la distingue dans le corps de bâtiments central, entre la cour du Puits et la Grande Cour. Elle prolonge, au sud, la Salle du Conseil.',
    structuralRole: 'Salle de lecture et de conservation des livres de la prison.',
  }),
  building({
    id: 'chapelle',
    name: 'Chapelle',
    category: 'institutionnel',
    letter: 'L',
    x: -0.5,
    z: 9,
    sizeX: 5,
    sizeZ: 5,
    height: 10,
    roofHeight: 3,
    builtInPhase: P.prison,
    quick:
      'Petite chapelle adossée au front sud, entre la Grande Cour et la courtine.',
    narrative:
      'La forteresse-prison a sa chapelle, un petit édifice que le plan de 1789 situe contre le front sud, près de la tour de la Bertaudière. Les détenus y sont conduits à des heures fixes.',
    structuralRole: 'Lieu de culte de la garnison et des détenus.',
  }),
  building({
    id: 'dessous-des-archives',
    name: 'Dessous des Archives',
    category: 'institutionnel',
    letter: 'M',
    x: 14,
    z: 7,
    sizeX: 12,
    sizeZ: 4.5,
    height: 8,
    roofHeight: 2,
    builtInPhase: P.prison,
    quick:
      'Long bâtiment bas au sud de la Grande Cour, sous lequel se trouvent les archives.',
    narrative:
      'Le plan de 1789 le nomme « dessous des archives » : les papiers de la prison y sont rangés. Les archives de la Bastille seront dispersées lors de la prise, puis en partie récupérées.',
    structuralRole: 'Stockage des registres, ordres du roi et dossiers des détenus.',
    overrides: [
      {
        phaseId: P.prise,
        roleLabel: 'Archives dispersées',
        historyAddition:
          'Les archives de la Bastille sont dispersées lors de la prise, puis en partie récupérées : elles sont aujourd’hui conservées à la bibliothèque de l’Arsenal et permettent aux historiens de reconstituer la liste des détenus.',
      },
    ],
  }),
  building({
    id: 'corps-de-garde',
    name: 'Corps de garde',
    category: 'defense',
    letter: 'N',
    x: 22,
    z: -4.6,
    sizeX: 6,
    sizeZ: 6,
    height: 9,
    roofHeight: 3,
    builtInPhase: P.prison,
    quick:
      'Poste de garde juste derrière l’entrée orientale, à l’est de la Grande Cour.',
    narrative:
      'À l’entrée de la Grande Cour, après le second pont-levis, un corps de garde héberge les hommes chargés de contrôler les arrivées.',
    structuralRole: 'Poste de garde et de contrôle à l’entrée.',
    overrides: [
      {
        phaseId: P.prise,
        roleLabel: 'Poste de défense',
        historyAddition:
          'En 1789, la garnison, composée d’invalides et de grenadiers suisses, y tient l’un de ses postes de défense.',
      },
    ],
  }),
  building({
    id: 'cuisines',
    name: 'Cuisines',
    category: 'residentiel',
    letter: 'T',
    x: 38,
    z: -6,
    sizeX: 12,
    sizeZ: 7,
    height: 8,
    roofHeight: 3,
    builtInPhase: P.prison,
    quick:
      'Bâtiment des cuisines, au nord de l’avancée, dans la cour du Gouvernement.',
    narrative:
      'Il faut nourrir la garnison, le personnel et les détenus : les cuisines occupent un bâtiment à part, entre l’avancée et la cour du Gouvernement.',
    structuralRole: 'Préparation des repas de la garnison et des détenus.',
  }),
  building({
    id: 'logement-gouverneur',
    name: 'Logement du gouverneur',
    category: 'residentiel',
    letter: 'V',
    x: 66,
    z: 4,
    sizeX: 7,
    sizeZ: 13,
    height: 12,
    roofHeight: 4,
    builtInPhase: P.prison,
    quick:
      'Hôtel du gouverneur, au fond de la cour du Gouvernement, hors de l’enceinte fortifiée.',
    narrative:
      'La fonction de prison d’État a besoin d’une administration permanente : un gouverneur, un lieutenant du roi, un major… Le gouverneur loge dans un bâtiment propre, à l’est du fossé.',
    structuralRole: 'Résidence du gouverneur de la Bastille.',
    figures: ['Bernard-René Jordan de Launay, gouverneur en 1789'],
    overrides: [
      {
        phaseId: P.prise,
        roleLabel: 'Logement du gouverneur',
        historyAddition:
          'En 1789, le gouverneur de Launay commande la place. Capturé après la capitulation, il est tué par la foule en chemin vers l’Hôtel de Ville.',
      },
    ],
  }),
];

/* -------------------------------------------------------------------------- */
/*  Vestiges                                                                  */
/* -------------------------------------------------------------------------- */

const vestigesTourLiberte: ArchitecturalElement = {
  id: 'vestiges-tour-liberte',
  name: 'Vestiges de la tour de la Liberté',
  category: 'defense',
  builtInPhase: P.vestiges,
  levels: {
    quick:
      'Les fondations de la tour de la Liberté, exhumées en 1899 et remontées square Henri-Galli.',
    architecture: {
      dimensions:
        'Base circulaire d’environ 10 m de diamètre, conservée sur quelques assises (≈ 2,4 m dans le modèle).',
      materials: 'Pierre calcaire des fondations, remontée sur un nouveau socle.',
      structuralRole:
        'Aucun rôle structurel : témoin archéologique et mémoriel. Dans le modèle, la base est représentée à l’emplacement d’origine de la tour.',
    },
    history: {
      narrative:
        'En 1899, lors des travaux du métro parisien, les ouvriers retrouvent les fondations de la tour de la Liberté. Elles sont démontées et remontées square Henri-Galli, à quelques dizaines de mètres de leur emplacement d’origine.\n\nD’autres pierres de la forteresse ont été réemployées dès 1789 : une partie a servi à construire le pont Louis-XVI, aujourd’hui pont de la Concorde.',
      currentRemains:
        'Visible au square Henri-Galli (Paris 4e). Un pan de la contrescarpe du fossé est visible dans la station de métro Bastille (ligne 5).',
    },
  },
  geometry: {
    primitive: 'tour_cylindrique',
    position: [-10, 0, 13.5],
    params: { radius: TOWER_RADIUS, height: 2.4, radialSegments: 40, crown: 'none' },
  },
  cameraFocus: { position: [20, 14, 40], target: [-10, 1, 13.5] },
};

/* -------------------------------------------------------------------------- */
/*  Monument                                                                  */
/* -------------------------------------------------------------------------- */

export const bastille: MonumentData = {
  id: 'bastille',
  name: 'Forteresse de la Bastille',
  location: 'Paris, à l’est de l’enceinte de Charles V · aujourd’hui place de la Bastille',
  globalSummary:
    'Élevée à partir de 1370 pour garder la porte Saint-Antoine, la Bastille devient prison d’État aux XVIIe et XVIIIe siècles, avant d’être prise par les Parisiens le 14 juillet 1789 puis démolie dès les jours suivants. Cette maquette « blueprint » est générée de façon procédurale (quadrillage métrique de 1 m et 5 m). Les emplacements sont relevés sur le plan de la Bastille conservé à la BnF (Gallica) ; les hauteurs et la chronologie des travaux restent des reconstitutions à lire comme des ordres de grandeur.',
  phases,
  elements: [
    ...towers,
    anciennePorte,
    ...courtines,
    fosse,
    ...cours,
    bastionNord,
    terrePleinBastion,
    passerelleBastion,
    avanceeEntree,
    ...buildings,
    vestigesTourLiberte,
  ],
};
