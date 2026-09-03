import { Alumno } from "../../../domain/alumno/Alumno.js";

export interface AlumnoRepository {
  guardar(alumno: Alumno): Promise<void>;
  buscarPorId(id: string): Promise<Alumno | null>;
  buscarPorIds(ids: string[]): Promise<Alumno[]>;
  listarActivos(): Promise<Alumno[]>;
}
