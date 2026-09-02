export interface CampoExtraido<T> {
  valor: T;
  confianza: "alta" | "baja";
}

export interface DatosAlumnoExtraidos {
  nombre: CampoExtraido<string>;
  apellidos: CampoExtraido<string>;
  telefono: CampoExtraido<string>;
  email: CampoExtraido<string | null>;
  dniNie: CampoExtraido<string>;
  fechaNacimiento: CampoExtraido<string>; // ISO date string, sin parsear todavía
  disciplinas: CampoExtraido<string[]>;
}

/**
 * Puerto agnóstico del proveedor — la elección entre Claude/Gemini para
 * leer las hojas de inscripción manuscritas (ver §7 del plan) se resuelve
 * como un adapter, sin tocar ningún use-case.
 */
export interface VisionExtractionService {
  extraerDatosAlumno(imagen: Buffer): Promise<DatosAlumnoExtraidos>;
}
