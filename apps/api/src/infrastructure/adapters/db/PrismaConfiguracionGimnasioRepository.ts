import { PrismaClient } from "@prisma/client";
import { ConfiguracionGimnasio } from "../../../domain/gimnasio/ConfiguracionGimnasio.js";
import type { ConfiguracionGimnasioRepository } from "../../../application/ports/out/ConfiguracionGimnasioRepository.js";

const ID_FILA_UNICA = 1;

export class PrismaConfiguracionGimnasioRepository implements ConfiguracionGimnasioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtener(): Promise<ConfiguracionGimnasio> {
    const fila = await this.prisma.configuracionGimnasio.findUniqueOrThrow({
      where: { id: ID_FILA_UNICA },
    });
    return new ConfiguracionGimnasio({
      nombre: fila.nombre,
      direccion: fila.direccion,
      telefono: fila.telefono,
      email: fila.email,
      escaneoFichasActivo: fila.escaneoFichasActivo,
      notificacionesWhatsappActivo: fila.notificacionesWhatsappActivo,
    });
  }

  async guardar(configuracion: ConfiguracionGimnasio): Promise<void> {
    const datos = {
      nombre: configuracion.nombre,
      direccion: configuracion.direccion,
      telefono: configuracion.telefono,
      email: configuracion.email,
      escaneoFichasActivo: configuracion.escaneoFichasActivo,
      notificacionesWhatsappActivo: configuracion.notificacionesWhatsappActivo,
    };
    await this.prisma.configuracionGimnasio.upsert({
      where: { id: ID_FILA_UNICA },
      create: { id: ID_FILA_UNICA, ...datos },
      update: datos,
    });
  }
}
