import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

export function registrarManejadorErrores(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ error: "Datos inválidos.", detalles: error.flatten() });
      return;
    }
    // Errores propios de Fastify (body/JSON malformado, límites, etc.) ya
    // traen su propio statusCode de cliente (4xx) — respetarlo evita
    // convertir peticiones mal formadas en falsos 500.
    if (typeof error.statusCode === "number" && error.statusCode < 500) {
      reply.code(error.statusCode).send({ error: error.message });
      return;
    }
    request.log.error(error);
    reply.code(500).send({ error: "Error interno." });
  });
}
