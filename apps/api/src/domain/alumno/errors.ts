export class AlumnoYaDadoDeBajaError extends Error {
  constructor(alumnoId: string) {
    super(`El alumno ${alumnoId} ya está dado de baja.`);
    this.name = "AlumnoYaDadoDeBajaError";
  }
}

export class DisciplinaInvalidaError extends Error {
  constructor(valor: string) {
    super(`"${valor}" no es una disciplina reconocida.`);
    this.name = "DisciplinaInvalidaError";
  }
}
