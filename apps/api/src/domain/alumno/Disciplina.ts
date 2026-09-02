export const DISCIPLINAS = [
  "boxeo",
  "kickboxing",
  "muay_thai",
  "mma",
  "jiu_jitsu",
  "grappling",
  "krav_maga",
  "defensa_personal",
  "boxeo_infantil",
  "krav_maga_infantil",
  "competicion",
] as const;

export type Disciplina = (typeof DISCIPLINAS)[number];

export function esDisciplinaValida(valor: string): valor is Disciplina {
  return (DISCIPLINAS as readonly string[]).includes(valor);
}
