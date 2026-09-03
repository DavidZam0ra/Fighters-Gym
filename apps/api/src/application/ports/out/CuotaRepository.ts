import { Cuota } from "../../../domain/cuota/Cuota.js";
import { Periodo } from "../../../domain/cuota/Periodo.js";

export interface CuotaRepository {
  guardar(cuota: Cuota): Promise<void>;
  buscarPorId(id: string): Promise<Cuota | null>;
  listarPorPeriodo(periodo: Periodo): Promise<Cuota[]>;
  buscarPorAlumnoYPeriodo(alumnoId: string, periodo: Periodo): Promise<Cuota | null>;
  listarPorAlumno(alumnoId: string, limite: number): Promise<Cuota[]>;
  /** Por fecha de pago real (no de periodo) — para métricas tipo "cobrado este mes". */
  listarPagadasEntre(desde: Date, hasta: Date): Promise<Cuota[]>;
  /** Todas las cuotas sin pagar, de cualquier periodo — una "atrasada" es casi
   * siempre de un mes anterior al actual, así que nunca debe filtrarse por periodo. */
  listarNoPagadas(): Promise<Cuota[]>;
}
