import { randomUUID } from "node:crypto";
import { Cuota } from "../../../domain/cuota/Cuota.js";
import { Periodo } from "../../../domain/cuota/Periodo.js";
import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";
import type { CuotaRepository } from "../../ports/out/CuotaRepository.js";
import type { Clock } from "../../ports/out/Clock.js";

/**
 * Se ejecuta cada vez que se abre la pantalla de Cuotas (idempotente, no un
 * cron aparte que Rafa tenga que recordar): garantiza que todo alumno activo
 * tiene una fila de Cuota para el mes actual, con el importe de su cuota
 * mensual, antes de listar. Sin esto, un alumno que aún no tiene fila para
 * el mes simplemente no aparecería en ningún sitio.
 */
export class RegistrarCuotasDelMesUseCase {
  constructor(
    private readonly alumnos: AlumnoRepository,
    private readonly cuotas: CuotaRepository,
    private readonly clock: Clock
  ) {}

  async ejecutar(): Promise<void> {
    const periodo = Periodo.desdeFecha(this.clock.now());
    const alumnosActivos = await this.alumnos.listarActivos();

    await Promise.all(
      alumnosActivos.map(async (alumno) => {
        const existente = await this.cuotas.buscarPorAlumnoYPeriodo(alumno.id, periodo);
        if (existente !== null) {
          return;
        }
        const cuota = new Cuota({
          id: randomUUID(),
          alumnoId: alumno.id,
          periodo,
          importe: alumno.cuotaMensual,
          metodo: null,
          fechaPago: null,
          confirmadoPor: null,
        });
        await this.cuotas.guardar(cuota);
      })
    );
  }
}
