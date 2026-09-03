export const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes"] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

const DIA_SEMANA_POR_INDICE: Record<number, DiaSemana | null> = {
  0: null, // domingo — el gimnasio no da clases de lunes a... bueno, no da clases en fin de semana
  1: "lunes",
  2: "martes",
  3: "miercoles",
  4: "jueves",
  5: "viernes",
  6: null, // sábado
};

/** `null` si la fecha cae en fin de semana (no hay catálogo de clases para esos días). */
export function diaSemanaDesdeFecha(fecha: Date): DiaSemana | null {
  return DIA_SEMANA_POR_INDICE[fecha.getUTCDay()] ?? null;
}
