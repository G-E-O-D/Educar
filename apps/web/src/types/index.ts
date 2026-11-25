export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'available' | 'coming-soon' | 'unavailable';
  href?: string;
}

export interface FictionalClass {
  subject: string;
  grade: string;
  section: string;
  day: string;
  time: string;
  topic: string;
}

export interface FictionalMaterial {
  title: string;
  type: 'PDF' | 'Imagen' | 'Documento' | 'Video';
  subject: string;
  gradeSection: string;
}
