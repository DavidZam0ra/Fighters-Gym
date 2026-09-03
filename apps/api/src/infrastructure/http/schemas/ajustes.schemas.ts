import { z } from "zod";

export const actualizarConfiguracionSchema = z.object({
  nombre: z.string().min(1),
  direccion: z.string().min(1),
  telefono: z.string().min(1),
  email: z.string().email(),
  escaneoFichasActivo: z.boolean(),
  notificacionesWhatsappActivo: z.boolean(),
});
