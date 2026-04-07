// ============================================================
// PROGRAMA - ENCUENTRO JÓVENES: DE SONORA PARA EL MUNDO
// ============================================================
// Para revelar un speaker:
//   1. Agrega su foto a /public/assets/speakers/ (400x400px, jpg/png)
//   2. Cambia revealed: false → revealed: true
//   3. Agrega photo: 'nombre-archivo.jpg'
// ============================================================

export interface Speaker {
  id: string;
  name: string;
  role: string;
  revealed: boolean;
  photo?: string; // filename in /public/assets/speakers/
  isModerator?: boolean;
}

export interface Session {
  id: string;
  time: string;
  type: 'conferencia' | 'conversatorio' | 'especial' | 'registro' | 'sorpresa';
  badge: string;
  title: string;
  subtitle?: string;
  tagline: string;
  value: string;
  speakers: Speaker[];
  isHighlight?: boolean;
  isMystery?: boolean;
  accentColor?: string;
}

export const PROGRAM: Session[] = [
  {
    id: 'registro',
    time: '07:30 – 08:00',
    type: 'registro',
    badge: 'REGISTRO',
    title: 'Registro y Bienvenida',
    tagline: 'El primer apretón de manos puede cambiarlo todo. Llega temprano.',
    value: 'El evento empieza antes de que empiece. El networking de apertura es donde nacen las grandes alianzas.',
    speakers: [],
    accentColor: '#94a3b8',
  },
  {
    id: 'anuncios',
    time: '08:00 – 08:15',
    type: 'registro',
    badge: 'ANUNCIOS',
    title: '3ra, 2da y 1ra llamada',
    tagline: 'Estamos a punto de comenzar. Toma tu lugar.',
    value: 'Preparación para el inicio oficial del evento.',
    speakers: [],
    accentColor: '#64748b',
  },
  {
    id: 'inauguracion',
    time: '08:15 – 08:30',
    type: 'especial',
    badge: 'INAUGURACIÓN OFICIAL',
    title: 'La Visión que mueve Sonora',
    tagline: 'El telón se levanta. Sonora se proyecta al mundo.',
    value: 'Palabras del Ing. Jaime Félix (Presidente de Coparmex Sonora Norte) y Chito Díaz (Presidente de la Comisión de Empresarios Jóvenes de Coparmex Sonora Norte).',
    speakers: [],
    accentColor: '#FF5100',
  },
  {
    id: 'conf1',
    time: '08:30 – 09:25',
    type: 'conferencia',
    badge: 'CONFERENCIA 1',
    title: 'Impacto Sonorense Internacional',
    subtitle: 'Lo Hecho en Sonora se hace bien',
    tagline: '¿Cómo se ve Sonora desde afuera? Dos voces que lo han vivido te confrontan con la respuesta.',
    value: 'Descubre por qué lo hecho en Sonora tiene sello de calidad global. Una dosis de orgullo y estrategia internacional.',
    speakers: [
      { id: 'tony', name: 'Dr. Tony Rodríguez', role: 'Empresario internacional sonorense', revealed: true },
      { id: 'alex', name: 'Alex Reynoso', role: 'Empresario internacional sonorense', revealed: true },
    ],
    accentColor: '#FF5100',
  },
  {
    id: 'break1',
    time: '09:25 – 09:35',
    type: 'registro',
    badge: 'BREAK',
    title: 'Interacción y Descanso',
    tagline: 'Un respiro para conectar.',
    value: 'Interacción con patrocinadores y visitas a stands.',
    speakers: [],
    accentColor: '#94a3b8',
  },
  {
    id: 'conv1',
    time: '09:35 – 10:45',
    type: 'conversatorio',
    badge: 'CONVERSATORIO 1',
    title: 'El relevo empresarial',
    subtitle: 'Visión de la segunda generación',
    tagline: 'No es un panel. Es un espejo. ¿Estás listo para lo que sigue?',
    value: 'La estafeta pasa a las nuevas manos. Entiende cómo la visión de la segunda generación está transformando el legado familiar.',
    speakers: [
      { id: 'aurora', name: 'Aurora García de León', role: 'Moderadora · Empresaria sonorense', revealed: true, isModerator: true },
      { id: 'gerardo', name: 'Gerardo Reina', role: 'Empresario sonorense', revealed: false },
      { id: 'jorgeA', name: 'Jorge Aguilar', role: 'Empresario sonorense', revealed: true },
      { id: 'joaquin', name: 'Joaquín Arrieta', role: 'Empresario sonorense', revealed: true },
      { id: 'jorgeAgu', name: 'Jorge Aguirre', role: 'Empresario sonorense', revealed: true },
    ],
    accentColor: '#0ea5e9',
  },
  {
    id: 'break2',
    time: '10:45 – 10:55',
    type: 'registro',
    badge: 'BREAK',
    title: 'Interacción y Descanso',
    tagline: 'Recarga energía para la siguiente mitad.',
    value: 'Interacción con patrocinadores y networking.',
    speakers: [],
    accentColor: '#94a3b8',
  },
  {
    id: 'conf2',
    time: '10:55 – 11:50',
    type: 'conferencia',
    badge: 'CONFERENCIA 2',
    title: 'De la carreta al mundo',
    subtitle: 'Dos generaciones expandiendo el sabor y la cultura Sonorense',
    tagline: 'Comenzó con una carreta. Hoy, el sabor de Sonora llega a todo el mundo.',
    value: 'De una carreta a una cadena nacional. La resiliencia sonorense en su máxima expresión corporativa.',
    speakers: [
      { id: 'donDiego', name: 'Juan Diego Cota Cota', role: 'Restaurantero internacional sonorense', revealed: true },
      { id: 'diegoCota', name: 'Diego Cota Cuevas', role: 'Restaurantero internacional sonorense', revealed: true },
    ],
    isHighlight: true,
    accentColor: '#f59e0b',
  },
  {
    id: 'break3',
    time: '11:50 – 12:00',
    type: 'registro',
    badge: 'BREAK',
    title: 'Interacción y Descanso',
    tagline: 'Último break antes del gran cierre.',
    value: 'Visita a patrocinadores y networking final.',
    speakers: [],
    accentColor: '#94a3b8',
  },
  {
    id: 'conv2',
    time: '12:00 – 13:10',
    type: 'conversatorio',
    badge: 'CONVERSATORIO 2',
    title: 'El sonido de Sonora en el mundo',
    subtitle: 'La industria musical como detonador económico regional',
    tagline: '¿Y si la música fuera el activo económico más poderoso de Sonora?',
    value: 'Sonora suena fuerte. Analizamos el poder económico detrás de nuestras notas musicales y culturales.',
    speakers: [
      { id: 'fernando', name: 'Fernando García de León', role: 'Empresario industria musical y compositor A', revealed: true, isModerator: true },
      { id: 'carin', name: 'Carin León', role: 'Artista sorpresa', revealed: false },
      { id: 'yahir', name: 'Yahir', role: 'Artista sorpresa', revealed: false },
      { id: 'kakalo', name: 'Kakalo', role: 'Artista sorpresa', revealed: false },
      { id: 'neto', name: 'Neto Bojórquez', role: 'Artista sorpresa', revealed: true },
      { id: 'gaston', name: 'Gastón Pavlovich', role: 'Productor', revealed: true },
      { id: 'capo', name: 'Capo el Inmortal', role: 'Artista sorpresa', revealed: true },
    ],
    isHighlight: true,
    accentColor: '#a855f7',
  },
  {
    id: 'sorpresa',
    time: '13:10 – 13:30',
    type: 'especial',
    badge: 'PROYECTO SORPRESA',
    title: 'Presentación de Proyecto Sorpresa',
    tagline: 'Algo que nunca ha pasado en Sonora. Un compromiso por el futuro.',
    value: 'El anuncio que marcará un antes y un después.',
    speakers: [],
    accentColor: '#FF5100',
  },
  {
    id: 'cierre',
    time: '13:30 – 13:40',
    type: 'especial',
    badge: 'CIERRE',
    title: 'Cierre y firma de compromiso',
    tagline: 'No es el final, es el compromiso que apenas nace.',
    value: 'Clausura oficial y firma de acuerdos.',
    speakers: [],
    accentColor: '#FF5100',
  },
  {
    id: 'extra',
    time: '13:40 – 14:00',
    type: 'registro',
    badge: 'EXTRA',
    title: 'Tiempo Margen / Desalojo',
    tagline: 'Espacio para imprevistos o simplemente networking.',
    value: 'Margen de maniobra y transición al After.',
    speakers: [],
    accentColor: '#64748b',
  },
  {
    id: 'after',
    time: '14:00 – 17:00',
    type: 'especial',
    badge: 'EL AFTER',
    title: 'Comida y Convivencia',
    tagline: 'Los negocios apenas comienzan.',
    value: 'Los negocios se sellan con un taco y una cheve. 3 horas de networking de alto nivel en el ambiente que nos define.',
    speakers: [
      { id: 'tacos', name: 'Taquería Sorpresa', role: 'Comida', revealed: true },
      { id: 'cheve', name: 'Cervecería Sorpresa', role: 'Bebida', revealed: true },
    ],
    isHighlight: true,
    accentColor: '#10b981',
  },
];
