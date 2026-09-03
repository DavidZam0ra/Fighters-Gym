import type { ClaseDTO } from "@fighters-gym/shared-types";
import type { Clase } from "../../../domain/clase/Clase.js";

export function aClaseDTO(clase: Clase): ClaseDTO {
  return {
    id: clase.id,
    nombre: clase.nombre,
    disciplina: clase.disciplina,
    diaSemana: clase.diaSemana,
    horaInicio: clase.horaInicio,
    horaFin: clase.horaFin,
    esInfantil: clase.esInfantil,
    esSparring: clase.esSparring,
  };
}
