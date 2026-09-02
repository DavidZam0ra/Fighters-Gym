import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";

export class AlumnoNoEncontradoError extends Error {
  constructor(id: string) {
    super(`No existe ningún alumno con id ${id}.`);
    this.name = "AlumnoNoEncontradoError";
  }
}

export class DarDeBajaAlumnoUseCase {
  constructor(private readonly alumnos: AlumnoRepository) {}

  async ejecutar(alumnoId: string): Promise<void> {
    const alumno = await this.alumnos.buscarPorId(alumnoId);
    if (alumno === null) {
      throw new AlumnoNoEncontradoError(alumnoId);
    }
    alumno.darDeBaja();
    await this.alumnos.guardar(alumno);
  }
}
