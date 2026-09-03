import type { AlumnoDTO, AsistenciaDTO, CuotaDTO, FichaAlumnoDTO } from "@fighters-gym/shared-types";
import type { Alumno } from "../../../domain/alumno/Alumno.js";
import type { Cuota } from "../../../domain/cuota/Cuota.js";
import type { Asistencia } from "../../../domain/asistencia/Asistencia.js";
import type { FichaAlumno } from "../../../application/use-cases/alumno/ObtenerFichaAlumnoUseCase.js";

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
