/**
 * Datos ficticios compartidos entre DashboardPage y TrackingPage.
 * Todos los valores son simulaciones — sin conexión a datos reales.
 * Período de referencia: Año lectivo 2026 · 1.° enero al 25-nov-2026 · 3.° grado B.
 */

export const FIXTURE_GRADE = '3.° B';
export const FIXTURE_PERIOD = 'Año lectivo 2026 · al 25-nov';

export interface StudentRecord {
  id: string;
  name: string;
  initials: string;
  /** Porcentaje de respuestas correctas sobre actividades autocorregibles enviadas */
  correctAnswersPct: number;
  /** Cantidad de actividades completadas en el período */
  activitiesCompleted: number;
  /** Actividades asignadas pendientes de completar */
  activitiesPending: number;
  needsSupport: boolean;
}

export const STUDENTS: StudentRecord[] = [
  { id: 's1', name: 'Agustina R.', initials: 'AR', correctAnswersPct: 92, activitiesCompleted: 8, activitiesPending: 1, needsSupport: false },
  { id: 's2', name: 'Bruno M.',    initials: 'BM', correctAnswersPct: 71, activitiesCompleted: 6, activitiesPending: 3, needsSupport: true  },
  { id: 's3', name: 'Camila F.',   initials: 'CF', correctAnswersPct: 88, activitiesCompleted: 8, activitiesPending: 1, needsSupport: false },
  { id: 's4', name: 'Diego V.',    initials: 'DV', correctAnswersPct: 65, activitiesCompleted: 5, activitiesPending: 4, needsSupport: true  },
  { id: 's5', name: 'Emilia P.',   initials: 'EP', correctAnswersPct: 95, activitiesCompleted: 9, activitiesPending: 0, needsSupport: false },
  { id: 's6', name: 'Franco L.',   initials: 'FL', correctAnswersPct: 78, activitiesCompleted: 7, activitiesPending: 2, needsSupport: false },
  { id: 's7', name: 'Gabriela S.', initials: 'GS', correctAnswersPct: 83, activitiesCompleted: 8, activitiesPending: 1, needsSupport: false },
  { id: 's8', name: 'Hernán T.',   initials: 'HT', correctAnswersPct: 59, activitiesCompleted: 4, activitiesPending: 5, needsSupport: true  },
];

export interface CurriculumItem {
  area: string;
  topic: string;
  status: 'completo' | 'en-curso' | 'pendiente';
  /** Porcentaje de clases del contenido efectivamente dictadas */
  coveragePct: number;
}

export const CURRICULUM: CurriculumItem[] = [
  { area: 'Matemática',              topic: 'Números hasta el 1000',         status: 'completo',  coveragePct: 100 },
  { area: 'Matemática',              topic: 'Multiplicación',                 status: 'completo',  coveragePct: 100 },
  { area: 'Matemática',              topic: 'Fracciones equivalentes',        status: 'en-curso',  coveragePct: 68  },
  { area: 'Matemática',              topic: 'Medidas de longitud',            status: 'pendiente', coveragePct: 0   },
  { area: 'Prácticas del Lenguaje',  topic: 'Comprensión lectora',            status: 'completo',  coveragePct: 100 },
  { area: 'Prácticas del Lenguaje',  topic: 'Uso de la H y la Y',            status: 'en-curso',  coveragePct: 50  },
  { area: 'Prácticas del Lenguaje',  topic: 'El sustantivo y el adjetivo',   status: 'pendiente', coveragePct: 0   },
  { area: 'Cs. Naturales',           topic: 'El ciclo del agua',              status: 'completo',  coveragePct: 100 },
  { area: 'Cs. Naturales',           topic: 'Las plantas y la fotosíntesis', status: 'en-curso',  coveragePct: 30  },
  { area: 'Cs. Sociales',            topic: 'Los Virreinatos',                status: 'completo',  coveragePct: 100 },
  { area: 'Cs. Sociales',            topic: 'La Revolución de Mayo',          status: 'pendiente', coveragePct: 0   },
];

/** Métricas derivadas para evitar cálculos duplicados */
export function deriveStats() {
  const totalStudents = STUDENTS.length;
  const supportCount  = STUDENTS.filter(s => s.needsSupport).length;
  const avgCorrect    = Math.round(STUDENTS.reduce((s, r) => s + r.correctAnswersPct, 0) / totalStudents);
  const totalTopics   = CURRICULUM.length;
  const doneTopics    = CURRICULUM.filter(c => c.status === 'completo').length;
  const coveragePct   = Math.round(doneTopics / totalTopics * 100);
  return { totalStudents, supportCount, avgCorrect, totalTopics, doneTopics, coveragePct };
}
