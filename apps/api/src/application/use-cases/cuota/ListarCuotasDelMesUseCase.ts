import type { Cuota } from "../../../domain/cuota/Cuota.js";
import type { EstadoCuota } from "../../../domain/cuota/EstadoCuota.js";
import type { CuotaRepository } from "../../ports/out/CuotaRepository.js";
import type { Clock } from "../../ports/out/Clock.js";
import { Periodo } from "../../../domain/cuota/Periodo.js";

export interface CuotaConEstado {
  cuota: Cuota;
  estado: EstadoCuota;
}

export class ListarCuotasDelMesUseCase {
  constructor(
    private readonly cuotas: CuotaRepository,
    private readonly clock: Clock
  ) {}

  async ejecutar(): Promise<CuotaConEstado[]> {
    const hoy = this.clock.now();
    const periodo = Periodo.desdeFecha(hoy);
    const cuotas = await this.cuotas.listarPorPeriodo(periodo);
    return cuotas.map((cuota) => ({ cuota, estado: cuota.estadoActual(hoy) }));
  }
}
