import type { ConfiguracionGimnasioDTO } from "@fighters-gym/shared-types";
import type { ConfiguracionGimnasio } from "../../../domain/gimnasio/ConfiguracionGimnasio.js";

export function aConfiguracionGimnasioDTO(configuracion: ConfiguracionGimnasio): ConfiguracionGimnasioDTO {
  return {
    nombre: configuracion.nombre,
    direccion: configuracion.direccion,
    telefono: configuracion.telefono,
    email: configuracion.email,
    escaneoFichasActivo: configuracion.escaneoFichasActivo,
    notificacionesWhatsappActivo: configuracion.notificacionesWhatsappActivo,
  };
}
