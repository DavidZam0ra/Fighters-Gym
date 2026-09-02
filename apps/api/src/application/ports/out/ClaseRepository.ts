import { Clase } from "../../../domain/clase/Clase.js";

export interface ClaseRepository {
  listarTodas(): Promise<Clase[]>;
}
