import type { ConfiguracionGimnasio } from "../../../domain/gimnasio/ConfiguracionGimnasio.js";
import type { ConfiguracionGimnasioRepository } from "../../ports/out/ConfiguracionGimnasioRepository.js";

export class ObtenerConfiguracionGimnasioUseCase {
  constructor(private readonly configuraciones: ConfiguracionGimnasioRepository) {}

  async ejecutar(): Promise<ConfiguracionGimnasio> {
    return this.configuraciones.obtener();
  }
}
