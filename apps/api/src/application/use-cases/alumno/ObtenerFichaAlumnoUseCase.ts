import type { Alumno } from "../../../domain/alumno/Alumno.js";
import type { Asistencia } from "../../../domain/asistencia/Asistencia.js";
import type { Cuota } from "../../../domain/cuota/Cuota.js";
import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";
import type { AsistenciaRepository } from "../../ports/out/AsistenciaRepository.js";
import type { CuotaRepository } from "../../ports/out/CuotaRepository.js";
import { AlumnoNoEncontradoError } from "./DarDeBajaAlumnoUseCase.js";

const CUOTAS_RECIENTES_LIMITE = 3;

export interface FichaAlumno {
  alumno: Alumno;
  cuotasRecientes: Cuota[];
  asistenciaDelMes: Asistencia[];
}

export class ObtenerFichaAlumnoUseCase {
  constructor(
    private readonly alumnos: AlumnoRepository,
    private readonly cuotas: CuotaRepository,
    private readonly asistencias: AsistenciaRepository
  ) {}

  async ejecutar(alumnoId: string, fechaHoy: Date): Promise<FichaAlumno> {
    const alumno = await this.alumnos.buscarPorId(alumnoId);
    if (alumno === null) {
      throw new AlumnoNoEncontradoError(alumnoId);
    }
    const [cuotasRecientes, asistenciaDelMes] = await Promise.all([
      this.cuotas.listarPorAlumno(alumnoId, CUOTAS_RECIENTES_LIMITE),
      this.asistencias.listarPorAlumnoYMes(alumnoId, fechaHoy.getUTCFullYear(), fechaHoy.getUTCMonth() + 1),
    ]);
    return { alumno, cuotasRecientes, asistenciaDelMes };
  }
}
