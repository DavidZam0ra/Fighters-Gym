import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";
import type { CuotaRepository } from "../../ports/out/CuotaRepository.js";
import type { ClaseRepository } from "../../ports/out/ClaseRepository.js";
import type { Clock } from "../../ports/out/Clock.js";
import { diaSemanaDesdeFecha } from "../../../domain/clase/DiaSemana.js";

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

export class ObtenerResumenDashboardUseCase {
  constructor(
    private readonly alumnos: AlumnoRepository,
    private readonly cuotas: CuotaRepository,
    private readonly clases: ClaseRepository,
    private readonly clock: Clock
  ) {}

  async ejecutar(): Promise<ResumenDashboard> {
    const hoy = this.clock.now();
    const inicioMes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1));
    const inicioMesSiguiente = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 1));

    const [alumnosActivos, cuotasSinPagar, cuotasPagadasEsteMes, todasLasClases] = await Promise.all([
      this.alumnos.listarActivos(),
      // Cualquier periodo, no solo el actual: una cuota "atrasada" suele ser
      // justo la de un mes anterior que sigue sin pagarse.
      this.cuotas.listarNoPagadas(),
      this.cuotas.listarPagadasEntre(inicioMes, inicioMesSiguiente),
      this.clases.listarTodas(),
    ]);

    // estadoActual() de una cuota sin fechaPago nunca es "pagado" — solo puede
    // ser "pendiente" o "atrasado".
    const cuotasImpagadas = cuotasSinPagar
      .map((cuota) => ({ cuota, estado: cuota.estadoActual(hoy) as "pendiente" | "atrasado" }))
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
      cobradoEsteMes: cuotasPagadasEsteMes.reduce((suma, cuota) => suma + cuota.importe, 0),
      cuotasAtrasadas,
      horarioHoy,
    };
  }
}
