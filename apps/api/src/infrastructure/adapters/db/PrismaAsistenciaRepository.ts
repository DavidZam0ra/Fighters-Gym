import { Prisma, PrismaClient } from "@prisma/client";
import { Asistencia } from "../../../domain/asistencia/Asistencia.js";
import type { EstadoAsistencia } from "../../../domain/asistencia/EstadoAsistencia.js";
import type { AsistenciaRepository } from "../../../application/ports/out/AsistenciaRepository.js";

type AsistenciaRow = Prisma.AsistenciaGetPayload<Record<string, never>>;

export class PrismaAsistenciaRepository implements AsistenciaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async guardar(asistencia: Asistencia): Promise<void> {
    await this.prisma.asistencia.upsert({
      where: { id: asistencia.id },
      create: {
        id: asistencia.id,
        alumnoId: asistencia.alumnoId,
        fecha: asistencia.fecha,
        estado: asistencia.estado,
      },
      update: {
        fecha: asistencia.fecha,
        estado: asistencia.estado,
      },
    });
  }

  async listarPorAlumnoYMes(alumnoId: string, anio: number, mes: number): Promise<Asistencia[]> {
    const desde = new Date(Date.UTC(anio, mes - 1, 1));
    const hasta = new Date(Date.UTC(anio, mes, 1));
    const filas = await this.prisma.asistencia.findMany({
      where: { alumnoId, fecha: { gte: desde, lt: hasta } },
    });
    return filas.map((fila) => this.aDominio(fila));
  }

  private aDominio(fila: AsistenciaRow): Asistencia {
    return new Asistencia({
      id: fila.id,
      alumnoId: fila.alumnoId,
      fecha: fila.fecha,
      estado: fila.estado as EstadoAsistencia,
    });
  }
}
