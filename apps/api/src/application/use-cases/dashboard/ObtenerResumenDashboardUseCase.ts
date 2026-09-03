import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";
import type { CuotaRepository } from "../../ports/out/CuotaRepository.js";
import type { ClaseRepository } from "../../ports/out/ClaseRepository.js";
import type { Clock } from "../../ports/out/Clock.js";
import { Periodo } from "../../../domain/cuota/Periodo.js";
import { diaSemanaDesdeFecha } from "../../../domain/clase/DiaSemana.js";
import type { RegistrarCuotasDelMesUseCase } from "../cuota/RegistrarCuotasDelMesUseCase.js";

const LIMITE_CUOTAS_ATRASADAS = 5;

export interface CuotaPendienteResumen {
  alumnoId: string;
  nombreAlumno: string;
  estado: "pendiente" | "atrasado";
}

export interface ClaseDeHoy {
  id: string;
  nombre: string;
  horaInicio: string;
}

export interface ResumenDashboard {
  alumnosActivos: number;
  cuotasPendientes: number;
  clasesHoy: number;
  cobradoEsteMes: number;
  cuotasAtrasadas: CuotaPendienteResumen[];
  horarioHoy: ClaseDeHoy[];
}

/**
 * Deliberadamente mira solo el periodo actual, igual que la pantalla de
 * Cuotas (misma consulta, mismo RegistrarCuotasDelMesUseCase por delante) —
 * antes el Dashboard sumaba TODOS los periodos sin pagar mientras Cuotas
 * solo mostraba el mes en curso, y los dos números no coincidían nunca.
 */
export class ObtenerResumenDashboardUseCase {
  constructor(
    private readonly alumnos: AlumnoRepository,
    private readonly cuotas: CuotaRepository,
    private readonly clases: ClaseRepository,
    private readonly registrarCuotasDelMes: RegistrarCuotasDelMesUseCase,
    private readonly clock: Clock
  ) {}

  async ejecutar(): Promise<ResumenDashboard> {
    await this.registrarCuotasDelMes.ejecutar();

    const hoy = this.clock.now();
    const periodoActual = Periodo.desdeFecha(hoy);

    const [alumnosActivos, cuotasDelMes, todasLasClases] = await Promise.all([
      this.alumnos.listarActivos(),
      this.cuotas.listarPorPeriodo(periodoActual),
      this.clases.listarTodas(),
    ]);

    const cuotasConEstado = cuotasDelMes.map((cuota) => ({ cuota, estado: cuota.estadoActual(hoy) }));

    const cuotasImpagadas = cuotasConEstado
      .filter(
        (item): item is { cuota: (typeof cuotasConEstado)[number]["cuota"]; estado: "pendiente" | "atrasado" } =>
          item.estado !== "pagado"
      )
      .sort((a, b) => Number(b.estado === "atrasado") - Number(a.estado === "atrasado"));

    const cuotasAtrasadas = await Promise.all(
      cuotasImpagadas.slice(0, LIMITE_CUOTAS_ATRASADAS).map(async ({ cuota, estado }) => {
        const alumno = await this.alumnos.buscarPorId(cuota.alumnoId);
        return {
          alumnoId: cuota.alumnoId,
          nombreAlumno: alumno?.nombreCompleto ?? "Alumno desconocido",
          estado,
        };
      })
    );

    const cobradoEsteMes = cuotasConEstado
      .filter((item) => item.estado === "pagado")
      .reduce((suma, item) => suma + item.cuota.importe, 0);

    const diaHoy = diaSemanaDesdeFecha(hoy);
    const horarioHoy =
      diaHoy === null
        ? []
        : todasLasClases
            .filter((clase) => clase.diaSemana === diaHoy)
            .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
            .map((clase) => ({ id: clase.id, nombre: clase.nombre, horaInicio: clase.horaInicio }));

    return {
      alumnosActivos: alumnosActivos.length,
      cuotasPendientes: cuotasImpagadas.length,
      clasesHoy: horarioHoy.length,
      cobradoEsteMes,
      cuotasAtrasadas,
      horarioHoy,
    };
  }
}
