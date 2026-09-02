import type { Alumno } from "../../../domain/alumno/Alumno.js";
import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";

export class ListarAlumnosUseCase {
  constructor(private readonly alumnos: AlumnoRepository) {}

  async ejecutar(): Promise<Alumno[]> {
    return this.alumnos.listarActivos();
  }
}
