import type { AlumnoRepository } from "../../ports/out/AlumnoRepository.js";
import { AlumnoNoEncontradoError } from "./DarDeBajaAlumnoUseCase.js";

export class ActualizarNotasAlumnoUseCase {
  constructor(private readonly alumnos: AlumnoRepository) {}

  async ejecutar(alumnoId: string, notas: string | null): Promise<void> {
    const alumno = await this.alumnos.buscarPorId(alumnoId);
    if (alumno === null) {
      throw new AlumnoNoEncontradoError(alumnoId);
    }
    alumno.actualizarNotas(notas);
    await this.alumnos.guardar(alumno);
  }
}
