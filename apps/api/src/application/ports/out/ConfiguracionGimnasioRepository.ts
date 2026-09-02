import { ConfiguracionGimnasio } from "../../../domain/gimnasio/ConfiguracionGimnasio.js";

export interface ConfiguracionGimnasioRepository {
  obtener(): Promise<ConfiguracionGimnasio>;
  guardar(configuracion: ConfiguracionGimnasio): Promise<void>;
}
