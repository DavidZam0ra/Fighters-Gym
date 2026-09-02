import { Asistencia } from "../../../domain/asistencia/Asistencia.js";

export interface AsistenciaRepository {
  guardar(asistencia: Asistencia): Promise<void>;
  listarPorAlumnoYMes(alumnoId: string, anio: number, mes: number): Promise<Asistencia[]>;
}
