import { Cuota } from "../../../domain/cuota/Cuota.js";
import { Periodo } from "../../../domain/cuota/Periodo.js";

export interface CuotaRepository {
  guardar(cuota: Cuota): Promise<void>;
  buscarPorId(id: string): Promise<Cuota | null>;
  listarPorPeriodo(periodo: Periodo): Promise<Cuota[]>;
  buscarPorAlumnoYPeriodo(alumnoId: string, periodo: Periodo): Promise<Cuota | null>;
  listarPorAlumno(alumnoId: string, limite: number): Promise<Cuota[]>;
}
