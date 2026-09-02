import type { FastifyReply, FastifyRequest } from "fastify";
import type { TokenService } from "../../../application/ports/out/TokenService.js";

declare module "fastify" {
  interface FastifyRequest {
    usuarioId?: string;
  }
}

const PREFIJO_BEARER = "Bearer ";

/**
 * Fábrica en vez de un preHandler suelto: recibe el TokenService del
 * composition-root en vez de construirlo aquí, así el middleware no conoce
 * el adaptador JWT concreto y es trivial de testear con un TokenService fake.
 */
export function crearAuthenticate(tokens: TokenService) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const cabecera = request.headers.authorization;
    if (cabecera === undefined || !cabecera.startsWith(PREFIJO_BEARER)) {
      await reply.code(401).send({ error: "No autenticado." });
      return;
    }

    const token = cabecera.slice(PREFIJO_BEARER.length);
    const payload = await tokens.verificarAccessToken(token);
    if (payload === null) {
      await reply.code(401).send({ error: "Token inválido o caducado." });
      return;
    }

    request.usuarioId = payload.usuarioId;
  };
}
