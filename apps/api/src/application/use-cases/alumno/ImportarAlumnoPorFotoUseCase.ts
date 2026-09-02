import type {
  VisionExtractionService,
  DatosAlumnoExtraidos,
} from "../../ports/out/VisionExtractionService.js";

/**
 * Solo extrae datos de la foto — NUNCA guarda un alumno. El personal revisa
 * el resultado (sobre todo los campos con confianza "baja") y confirma a
 * través de CrearAlumnoUseCase por separado.
 */
export class ImportarAlumnoPorFotoUseCase {
  constructor(private readonly vision: VisionExtractionService) {}

  async ejecutar(imagen: Buffer): Promise<DatosAlumnoExtraidos> {
    return this.vision.extraerDatosAlumno(imagen);
  }
}
