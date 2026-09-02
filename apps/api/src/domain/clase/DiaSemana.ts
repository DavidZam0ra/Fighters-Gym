export const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes"] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];
