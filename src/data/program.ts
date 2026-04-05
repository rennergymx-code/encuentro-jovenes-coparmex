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
    time: '',
    type: 'registro',
    badge: 'REGISTRO',
    title: 'Registro y Bienvenida',
    tagline: 'El primer apretón de manos puede cambiarlo todo. Llega temprano.',
    value: 'Networking de apertura. El evento empieza antes de que empiece.',
    speakers: [],
    accentColor: '#94a3b8',
  },
  {
    id: 'inauguracion',
    time: '',
    type: 'especial',
    badge: 'INAUGURACIÓN OFICIAL',
    title: 'La Visión que Mueve Sonora',
    tagline: 'El telón se levanta. Y lo que sigue lo cambia todo.',
    value: 'La apertura que establece el tono de un día que no olvidarás.',
    speakers: [],
    accentColor: '#FF5100',
  },
  {
    id: 'conf1',
    time: '',
    type: 'conferencia',
    badge: 'CONFERENCIA',
    title: 'Impacto Sonorense Internacional',
    subtitle: 'Lo Hecho en Sonora se Hace Bien',
    tagline: '¿Cómo se ve Sonora desde afuera? Dos voces que lo han vivido te confrontan con la respuesta.',
    value: 'Perspectiva global de sonorenses que pusieron a Sonora en el mapa. Sal con una visión nueva de lo que puedes lograr desde aquí.',
    speakers: [
      { id: 'tony', name: 'Dr. Tony Rodríguez', role: 'Empresario Internacional', revealed: false },
      { id: 'alex', name: 'Alex Reynoso', role: 'Empresario Internacional', revealed: false },
    ],
    accentColor: '#FF5100',
  },
  {
    id: 'conv1',
    time: '',
    type: 'conversatorio',
    badge: 'CONVERSATORIO',
    title: 'El Relevo Empresarial',
    subtitle: 'Visión de la Segunda Generación',
    tagline: 'No es un panel. Es un espejo. ¿Estás listo para lo que sigue?',
    value: 'Cara a cara con los jóvenes que ya tomaron las riendas de las empresas más influyentes de Sonora. Sin filtros. Sin recetas. Solo experiencia real.',
    speakers: [
      { id: 'aurora', name: 'Aurora García de León', role: 'Moderadora · DEREX', revealed: true, isModerator: true },
      { id: 'conv1-s1', name: '???', role: 'Segunda Generación Empresarial', revealed: false },
      { id: 'conv1-s2', name: '???', role: 'Segunda Generación Empresarial', revealed: false },
      { id: 'conv1-s3', name: '???', role: 'Segunda Generación Empresarial', revealed: false },
      { id: 'conv1-s4', name: '???', role: 'Segunda Generación Empresarial', revealed: false },
    ],
    accentColor: '#0ea5e9',
  },
  {
    id: 'conf2',
    time: '',
    type: 'conferencia',
    badge: 'CONFERENCIA',
    title: 'De la Carreta al Mundo',
    subtitle: 'Dos Generaciones Expandiendo el Sabor y la Cultura Sonorense',
    tagline: 'Comenzó con una carreta. Hoy, el sabor de Sonora llega a todo el mundo.',
    value: 'Cómo una tradición familiar sonorense se convirtió en un fenómeno cultural global. El modelo que cualquier empresa familiar puede replicar.',
    speakers: [
      { id: 'donDiego', name: 'Juan Diego Cota', role: '"Don Diego" · Los Arbolitos de Cajeme', revealed: true },
      { id: 'diegoCota', name: 'Diego Cota Cuevas', role: 'Los Arbolitos de Cajeme', revealed: true },
    ],
    isHighlight: true,
    accentColor: '#f59e0b',
  },
  {
    id: 'conv2',
    time: '',
    type: 'conversatorio',
    badge: 'CONVERSATORIO',
    title: 'El Sonido de Sonora en el Mundo',
    subtitle: 'La Música como el Nuevo Gran Motor de Desarrollo Regional',
    tagline: '¿Y si la música fuera el activo económico más poderoso de Sonora? Este conversatorio podría ser histórico.',
    value: 'Un formato nunca visto: los arquitectos del fenómeno musical sonorense en una sola sala, hablando de industria, orgullo y lo que viene.',
    isMystery: true,
    isHighlight: true,
    speakers: [
      { id: 'fernando', name: 'Fernando García de León', role: 'Moderador', revealed: true, isModerator: true },
      { id: 'mu1', name: '???', role: 'Artista Confirmado', revealed: false },
      { id: 'mu2', name: '???', role: 'Artista Confirmado', revealed: false },
      { id: 'mu3', name: '???', role: 'Artista Confirmado', revealed: false },
      { id: 'mu4', name: '???', role: 'Artista Confirmado', revealed: false },
      { id: 'mu5', name: '???', role: 'Artista Confirmado', revealed: false },
      { id: 'mu6', name: '???', role: 'Artista Confirmado', revealed: false },
    ],
    accentColor: '#a855f7',
  },
  {
    id: 'sorpresa',
    time: '',
    type: 'sorpresa',
    badge: '🔒 PROYECTO SORPRESA',
    title: 'Presentación de Proyecto Sorpresa',
    tagline: 'Algo que nunca ha pasado en Sonora. Solo los que estén presentes lo sabrán.',
    value: 'El cierre que nadie anticipa. Un compromiso por el futuro.',
    isMystery: true,
    speakers: [],
    accentColor: '#FF5100',
  },
  {
    id: 'after',
    time: '',
    type: 'especial',
    badge: 'EL AFTER: TACOS, CHEVES Y DEALS',
    title: 'El After: Tacos, Cheves y Deals',
    tagline: 'El ciclo de conferencias terminó, pero los negocios apenas comienzan.',
    value: 'Para cerrar con broche de oro, disfruta del mejor ambiente sonorense. Echa el taco, destapa una cheve y haz esos contactos que llevarán tu negocio al siguiente nivel.',
    isMystery: true,
    speakers: [
      { id: 'tacos', name: '???', role: 'Taquería Sonorense Confirmada', revealed: false },
      { id: 'cheve', name: '???', role: 'Cervecería Confirmada', revealed: false },
    ],
    isHighlight: true,
    accentColor: '#10b981',
  },
];
