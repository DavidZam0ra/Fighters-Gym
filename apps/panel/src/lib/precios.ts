import type { Disciplina } from "@fighters-gym/shared-types";

// Tarifas reales de Fighters Gym (sección Tarifas de la landing, design/Main.dc.html).
// "2 modalidades a elegir" y "Todas las modalidades" son planos, NO la suma de
// las individuales — y Boxeo Competición es una tarifa especial fija.
const PRECIO_INDIVIDUAL: Record<Disciplina, number> = {
  boxeo: 50,
  kickboxing: 45,
  muay_thai: 45,
  mma: 45,
  grappling: 45,
  jiu_jitsu: 45,
  krav_maga: 45,
  defensa_personal: 45,
  boxeo_infantil: 45,
  krav_maga_infantil: 45,
  competicion: 70,
};

const TARIFA_DOS_MODALIDADES = 60;
const TARIFA_TODAS_LAS_MODALIDADES = 75;

/** Sugerencia editable, no un valor bloqueado — Rafa puede tener excepciones reales. */
export function sugerirCuotaMensual(disciplinas: Disciplina[]): number {
  if (disciplinas.length === 0) {
    return 0;
  }
  if (disciplinas.includes("competicion")) {
    return PRECIO_INDIVIDUAL.competicion;
  }
  if (disciplinas.length === 1) {
    return PRECIO_INDIVIDUAL[disciplinas[0] as Disciplina];
  }
  if (disciplinas.length === 2) {
    return TARIFA_DOS_MODALIDADES;
  }
  return TARIFA_TODAS_LAS_MODALIDADES;
}
