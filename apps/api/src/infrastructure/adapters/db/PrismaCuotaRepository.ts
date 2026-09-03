import { Prisma, PrismaClient } from "@prisma/client";
import { Cuota } from "../../../domain/cuota/Cuota.js";
import { Periodo } from "../../../domain/cuota/Periodo.js";
import type { MetodoPago } from "../../../domain/cuota/MetodoPago.js";
import type { CuotaRepository } from "../../../application/ports/out/CuotaRepository.js";

type CuotaRow = Prisma.CuotaGetPayload<Record<string, never>>;

export class PrismaCuotaRepository implements CuotaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async guardar(cuota: Cuota): Promise<void> {
    const datos = {
      alumnoId: cuota.alumnoId,
      periodo: cuota.periodo.toDate(),
      importe: cuota.importe,
      metodo: cuota.metodo,
      fechaPago: cuota.fechaPago,
      confirmadoPor: cuota.confirmadoPor,
    };
    await this.prisma.cuota.upsert({
      where: { id: cuota.id },
      create: { id: cuota.id, ...datos },
      update: datos,
    });
  }

  async buscarPorId(id: string): Promise<Cuota | null> {
    const fila = await this.prisma.cuota.findUnique({ where: { id } });
    return fila === null ? null : this.aDominio(fila);
  }

  async listarPorPeriodo(periodo: Periodo): Promise<Cuota[]> {
    const filas = await this.prisma.cuota.findMany({ where: { periodo: periodo.toDate() } });
    return filas.map((fila) => this.aDominio(fila));
  }

  async buscarPorAlumnoYPeriodo(alumnoId: string, periodo: Periodo): Promise<Cuota | null> {
    const fila = await this.prisma.cuota.findUnique({
      where: { alumnoId_periodo: { alumnoId, periodo: periodo.toDate() } },
    });
    return fila === null ? null : this.aDominio(fila);
  }

  async listarPorAlumno(alumnoId: string, limite: number): Promise<Cuota[]> {
    const filas = await this.prisma.cuota.findMany({
      where: { alumnoId },
      orderBy: { periodo: "desc" },
      take: limite,
    });
    return filas.map((fila) => this.aDominio(fila));
  }

  private aDominio(fila: CuotaRow): Cuota {
    return new Cuota({
      id: fila.id,
      alumnoId: fila.alumnoId,
      periodo: Periodo.desdeFecha(fila.periodo),
      importe: Number(fila.importe),
      metodo: fila.metodo as MetodoPago | null,
      fechaPago: fila.fechaPago,
      confirmadoPor: fila.confirmadoPor,
    });
  }
}
