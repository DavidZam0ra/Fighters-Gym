import type { ConfiguracionGimnasioRepository } from "../../ports/out/ConfiguracionGimnasioRepository.js";

export interface ActualizarConfiguracionGimnasioInput {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  escaneoFichasActivo: boolean;
  notificacionesWhatsappActivo: boolean;
}

export class ActualizarConfiguracionGimnasioUseCase {
  constructor(private readonly configuraciones: ConfiguracionGimnasioRepository) {}

  async ejecutar(datos: ActualizarConfiguracionGimnasioInput): Promise<void> {
    const configuracion = await this.configuraciones.obtener();
    configuracion.nombre = datos.nombre;
    configuracion.direccion = datos.direccion;
    configuracion.telefono = datos.telefono;
    configuracion.email = datos.email;

    if (datos.escaneoFichasActivo) {
      configuracion.activarEscaneoFichas();
    } else {
      configuracion.desactivarEscaneoFichas();
    }

    if (datos.notificacionesWhatsappActivo) {
      configuracion.activarNotificacionesWhatsapp();
    } else {
      configuracion.desactivarNotificacionesWhatsapp();
    }

    await this.configuraciones.guardar(configuracion);
  }
}
