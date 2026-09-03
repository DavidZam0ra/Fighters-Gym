import type { EstadoCuota } from "../../../domain/cuota/EstadoCuota.js";
import type { MetodoPago } from "../../../domain/cuota/MetodoPago.js";
import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";
import type { CuotaRepository } from "../../ports/out/CuotaRepository.js";
import type { Clock } from "../../ports/out/Clock.js";
import { Periodo } from "../../../domain/cuota/Periodo.js";
import type { RegistrarCuotasDelMesUseCase } from "./RegistrarCuotasDelMesUseCase.js";

export interface CuotaDelMes {
  cuotaId: string;
  alumnoId: string;
  nombreAlumno: string;
  importe: number;
  metodo: MetodoPago | null;
  fechaPago: Date | null;
  estado: EstadoCuota;
}

export class ListarCuotasDelMesUseCase {
  constructor(
    private readonly cuotas: CuotaRepository,
    private readonly alumnos: AlumnoRepository,
    private readonly registrarCuotasDelMes: RegistrarCuotasDelMesUseCase,
    private readonly clock: Clock
  ) {}

  async ejecutar(): Promise<CuotaDelMes[]> {
    await this.registrarCuotasDelMes.ejecutar();

    const hoy = this.clock.now();
    const periodo = Periodo.desdeFecha(hoy);
    const cuotas = await this.cuotas.listarPorPeriodo(periodo);

    const filas = await Promise.all(
      cuotas.map(async (cuota) => {
        const alumno = await this.alumnos.buscarPorId(cuota.alumnoId);
        return {
          cuotaId: cuota.id,
          alumnoId: cuota.alumnoId,
          nombreAlumno: alumno?.nombreCompleto ?? "Alumno desconocido",
          importe: cuota.importe,
          metodo: cuota.metodo,
          fechaPago: cuota.fechaPago,
          estado: cuota.estadoActual(hoy),
        };
      })
    );

    return filas.sort((a, b) => a.nombreAlumno.localeCompare(b.nombreAlumno, "es"));
  }
}
