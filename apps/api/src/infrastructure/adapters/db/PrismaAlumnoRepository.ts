import { Prisma, PrismaClient } from "@prisma/client";
import { Alumno } from "../../../domain/alumno/Alumno.js";
import { AvatarSeed } from "../../../domain/alumno/AvatarSeed.js";
import type { Disciplina } from "../../../domain/alumno/Disciplina.js";
import type { EstadoAlumno } from "../../../domain/alumno/EstadoAlumno.js";
import type { AlumnoRepository } from "../../../application/ports/out/AlumnoRepository.js";

type AlumnoConDisciplinas = Prisma.AlumnoGetPayload<{ include: { disciplinas: true } }>;

export class PrismaAlumnoRepository implements AlumnoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async guardar(alumno: Alumno): Promise<void> {
    const datos = {
      nombre: alumno.nombre,
      apellidos: alumno.apellidos,
      telefono: alumno.telefono,
      email: alumno.email,
      dniNie: alumno.dniNie,
      fechaNacimiento: alumno.fechaNacimiento,
      fechaAlta: alumno.fechaAlta,
      estado: alumno.estado,
      cuotaMensual: alumno.cuotaMensual,
      avatarSeed: alumno.avatarSeed.toString(),
      notas: alumno.notas,
    };

    await this.prisma.$transaction([
      this.prisma.alumno.upsert({
        where: { id: alumno.id },
        create: { id: alumno.id, ...datos },
        update: datos,
      }),
      this.prisma.alumnoDisciplina.deleteMany({ where: { alumnoId: alumno.id } }),
      this.prisma.alumnoDisciplina.createMany({
        data: alumno.disciplinas.map((disciplina) => ({ alumnoId: alumno.id, disciplina })),
      }),
    ]);
  }

  async buscarPorId(id: string): Promise<Alumno | null> {
    const fila = await this.prisma.alumno.findUnique({
      where: { id },
      include: { disciplinas: true },
    });
    return fila === null ? null : this.aDominio(fila);
  }

  async buscarPorIds(ids: string[]): Promise<Alumno[]> {
    if (ids.length === 0) {
      return [];
    }
    const filas = await this.prisma.alumno.findMany({
      where: { id: { in: ids } },
      include: { disciplinas: true },
    });
    return filas.map((fila) => this.aDominio(fila));
  }

  async listarActivos(): Promise<Alumno[]> {
    const filas = await this.prisma.alumno.findMany({
      where: { estado: "activo" },
      include: { disciplinas: true },
    });
    return filas.map((fila) => this.aDominio(fila));
  }

  private aDominio(fila: AlumnoConDisciplinas): Alumno {
    return new Alumno({
      id: fila.id,
      nombre: fila.nombre,
      apellidos: fila.apellidos,
      telefono: fila.telefono,
      email: fila.email,
      dniNie: fila.dniNie,
      fechaNacimiento: fila.fechaNacimiento,
      fechaAlta: fila.fechaAlta,
      estado: fila.estado as EstadoAlumno,
      cuotaMensual: Number(fila.cuotaMensual),
      disciplinas: fila.disciplinas.map((d) => d.disciplina as Disciplina),
      notas: fila.notas,
      avatarSeed: AvatarSeed.desdeValorAlmacenado(fila.avatarSeed),
    });
  }
}
