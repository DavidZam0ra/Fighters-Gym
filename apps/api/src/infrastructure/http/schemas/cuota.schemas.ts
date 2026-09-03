import { z } from "zod";

export const confirmarPagoSchema = z.object({
  metodo: z.enum(["bizum", "transferencia", "efectivo"]),
});
