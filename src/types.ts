export type HSEStatus = "EN CURSO" | "PENDIENTE" | "CRÍTICO";

export interface Task {
  id: string;
  campo: string;
  area: string;
  proyecto: string;
  paquete: string;
  estado: "Sin iniciar" | "Completado";
  mes: string;
  peso: number; // e.g. 0.51
  avance: number; // e.g. 0 or 0.51
}

export type DisciplineStatus = "Completado" | "Pendiente";

export interface ContextoInforme {
  gerencia: "GOR" | "GPA";
  mes: string;
  ano: string;
}

export interface Discipline {
  id: string;
  name: string;
  status: DisciplineStatus;
  comment: string;
  optimizedComment?: string;
}

export interface TeamMember {
  id: string;
  role: string;
  name: string;
}

export interface SmartInsights {
  hitos: string[];
  alertas: string[];
}
