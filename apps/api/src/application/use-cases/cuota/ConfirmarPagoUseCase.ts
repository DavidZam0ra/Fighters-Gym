import type { CuotaRepository } from "../../ports/out/CuotaRepository.js";
import type { MetodoPago } from "../../../domain/cuota/MetodoPago.js";
import type { Clock } from "../../ports/out/Clock.js";

export class CuotaNoEncontradaError extends Error {
  constructor(id: string) {
    super(`No existe ninguna cuota con id ${id}.`);
    this.name = "CuotaNoEncontradaError";
  }
}

export interface ConfirmarPagoInput {
  cuotaId: string;
  usuarioId: string;
  metodo: MetodoPago;
}

export class ConfirmarPagoUseCase {
  constructor(
    private readonly cuotas: CuotaRepository,
    private readonly clock: Clock
  ) {}

  async ejecutar(input: ConfirmarPagoInput): Promise<void> {
    const cuota = await this.cuotas.buscarPorId(input.cuotaId);
    if (cuota === null) {
      throw new CuotaNoEncontradaError(input.cuotaId);
    }
    cuota.confirmarPago(input.usuarioId, input.metodo, this.clock.now());
    await this.cuotas.guardar(cuota);
  }
}
