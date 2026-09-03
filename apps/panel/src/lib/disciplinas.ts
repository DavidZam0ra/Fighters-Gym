import type { Disciplina } from "@fighters-gym/shared-types";

export const CATALOGO_DISCIPLINAS: Array<{ valor: Disciplina; etiqueta: string }> = [
  { valor: "boxeo", etiqueta: "Boxeo" },
  { valor: "kickboxing", etiqueta: "Kickboxing" },
  { valor: "muay_thai", etiqueta: "Muay Thai" },
  { valor: "mma", etiqueta: "MMA / Grappling" },
  { valor: "grappling", etiqueta: "Grappling" },
  { valor: "jiu_jitsu", etiqueta: "Jiu-Jitsu" },
  { valor: "krav_maga", etiqueta: "Krav Maga" },
  { valor: "defensa_personal", etiqueta: "Defensa Personal" },
  { valor: "boxeo_infantil", etiqueta: "Boxeo infantil" },
  { valor: "krav_maga_infantil", etiqueta: "Krav Maga infantil" },
  { valor: "competicion", etiqueta: "Competición" },
];

const ETIQUETAS: Record<Disciplina, string> = Object.fromEntries(
  CATALOGO_DISCIPLINAS.map((d) => [d.valor, d.etiqueta])
) as Record<Disciplina, string>;

export function etiquetaDisciplina(valor: Disciplina): string {
  return ETIQUETAS[valor];
}
