import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

export function registrarManejadorErrores(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ error: "Datos inválidos.", detalles: error.flatten() });
      return;
    }
    request.log.error(error);
    reply.code(500).send({ error: "Error interno." });
  });
}
