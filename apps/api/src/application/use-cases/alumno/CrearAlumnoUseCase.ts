import { randomUUID } from "node:crypto";
import { Alumno } from "../../../domain/alumno/Alumno.js";
import type { Disciplina } from "../../../domain/alumno/Disciplina.js";
import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";
import type { Clock } from "../../ports/out/Clock.js";

export interface CrearAlumnoInput {
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string | null;
  dniNie: string;
  fechaNacimiento: Date;
  cuotaMensual: number;
  disciplinas: Disciplina[];
}

/**
 * Punto de entrada único para dar de alta un alumno — da igual si los datos
 * vienen de una foto revisada por el personal (ver
 * ImportarAlumnoPorFotoUseCase) o de un formulario manual: al llegar aquí
 * ya son datos validados y confirmados por una persona. Esto es lo que
 * convierte "nunca se guarda automáticamente" en un hecho arquitectónico,
 * no solo una casilla en la interfaz.
 */
export class CrearAlumnoUseCase {
  constructor(
    private readonly alumnos: AlumnoRepository,
    private readonly clock: Clock
  ) {}

  async ejecutar(input: CrearAlumnoInput): Promise<Alumno> {
    const alumno = new Alumno({
      id: randomUUID(),
      nombre: input.nombre,
      apellidos: input.apellidos,
      telefono: input.telefono,
      email: input.email,
      dniNie: input.dniNie,
      fechaNacimiento: input.fechaNacimiento,
      fechaAlta: this.clock.now(),
      estado: "activo",
      cuotaMensual: input.cuotaMensual,
      disciplinas: input.disciplinas,
    });
    await this.alumnos.guardar(alumno);
    return alumno;
  }
}
