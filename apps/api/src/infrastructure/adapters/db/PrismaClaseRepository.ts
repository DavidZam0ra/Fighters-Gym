import { Prisma, PrismaClient } from "@prisma/client";
import { Clase } from "../../../domain/clase/Clase.js";
import type { Disciplina } from "../../../domain/alumno/Disciplina.js";
import type { DiaSemana } from "../../../domain/clase/DiaSemana.js";
import type { ClaseRepository } from "../../../application/ports/out/ClaseRepository.js";

type ClaseRow = Prisma.ClaseGetPayload<Record<string, never>>;

export class PrismaClaseRepository implements ClaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarTodas(): Promise<Clase[]> {
    const filas = await this.prisma.clase.findMany();
    return filas.map((fila) => this.aDominio(fila));
  }

  private aDominio(fila: ClaseRow): Clase {
    return new Clase({
      id: fila.id,
      nombre: fila.nombre,
      disciplina: fila.disciplina as Disciplina,
      diaSemana: fila.diaSemana as DiaSemana,
      horaInicio: fila.horaInicio,
      horaFin: fila.horaFin,
      esInfantil: fila.esInfantil,
      esSparring: fila.esSparring,
    });
  }
}
