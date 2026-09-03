import type {
  AlumnoDTO,
  AsistenciaDTO,
  CuotaDTO,
  FichaAlumnoDTO,
  DatosAlumnoExtraidosDTO,
} from "@fighters-gym/shared-types";
import type { Alumno } from "../../../domain/alumno/Alumno.js";
import type { Cuota } from "../../../domain/cuota/Cuota.js";
import type { Asistencia } from "../../../domain/asistencia/Asistencia.js";
import { esDisciplinaValida } from "../../../domain/alumno/Disciplina.js";
import type { FichaAlumno } from "../../../application/use-cases/alumno/ObtenerFichaAlumnoUseCase.js";
import type { DatosAlumnoExtraidos } from "../../../application/ports/out/VisionExtractionService.js";

export function aAlumnoDTO(alumno: Alumno): AlumnoDTO {
  return {
    id: alumno.id,
    nombre: alumno.nombre,
    apellidos: alumno.apellidos,
    telefono: alumno.telefono,
    email: alumno.email,
    dniNie: alumno.dniNie,
    fechaNacimiento: alumno.fechaNacimiento.toISOString(),
    fechaAlta: alumno.fechaAlta.toISOString(),
    estado: alumno.estado,
    cuotaMensual: alumno.cuotaMensual,
    disciplinas: [...alumno.disciplinas],
    notas: alumno.notas,
    avatarSeed: alumno.avatarSeed.toString(),
  };
}

function aCuotaDTO(cuota: Cuota, fechaHoy: Date): CuotaDTO {
  return {
    id: cuota.id,
    periodo: cuota.periodo.toString(),
    importe: cuota.importe,
    metodo: cuota.metodo,
    fechaPago: cuota.fechaPago?.toISOString() ?? null,
    estado: cuota.estadoActual(fechaHoy),
  };
}

function aAsistenciaDTO(asistencia: Asistencia): AsistenciaDTO {
  return {
    id: asistencia.id,
    fecha: asistencia.fecha.toISOString(),
    estado: asistencia.estado,
  };
}

export function aFichaAlumnoDTO(ficha: FichaAlumno, fechaHoy: Date): FichaAlumnoDTO {
  return {
    alumno: aAlumnoDTO(ficha.alumno),
    cuotasRecientes: ficha.cuotasRecientes.map((cuota) => aCuotaDTO(cuota, fechaHoy)),
    asistenciaDelMes: ficha.asistenciaDelMes.map(aAsistenciaDTO),
  };
}

export function aDatosAlumnoExtraidosDTO(datos: DatosAlumnoExtraidos): DatosAlumnoExtraidosDTO {
  return {
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    telefono: datos.telefono,
    email: datos.email,
    dniNie: datos.dniNie,
    fechaNacimiento: datos.fechaNacimiento,
    disciplinas: {
      // Defensa extra: aunque el schema JSON que le pasamos a Gemini ya
      // restringe "disciplinas" a un enum con los valores válidos, no nos
      // fiamos a ciegas de que el modelo lo respete siempre al 100%.
      valor: datos.disciplinas.valor.filter(esDisciplinaValida),
      confianza: datos.disciplinas.confianza,
    },
  };
}
