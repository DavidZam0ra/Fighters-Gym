import type { Clase } from "../../../domain/clase/Clase.js";
import type { ClaseRepository } from "../../ports/out/ClaseRepository.js";

export class ListarClasesUseCase {
  constructor(private readonly clases: ClaseRepository) {}

  async ejecutar(): Promise<Clase[]> {
    return this.clases.listarTodas();
  }
}
