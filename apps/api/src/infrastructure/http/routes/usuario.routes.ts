import type { FastifyInstance } from "fastify";
import type { UsuarioActualDTO } from "@fighters-gym/shared-types";
import { aUsuarioActualDTO } from "../mappers/usuario.mapper.js";
import type { Container } from "../../../composition-root/container.js";

export function registrarRutasUsuario(app: FastifyInstance, container: Container): void {
  app.get("/auth/me", { preHandler: container.authenticate }, async (request, reply) => {
    // request.usuarioId lo rellena el middleware authenticate a partir del access token;
    // si no está, authenticate ya habría cortado la petición con 401 antes de llegar aquí.
    if (request.usuarioId === undefined) {
      return reply.code(401).send({ error: "No autenticado." });
    }
    const usuario = await container.obtenerUsuarioActualUseCase.ejecutar(request.usuarioId);
    const respuesta: UsuarioActualDTO = aUsuarioActualDTO(usuario);
    return respuesta;
  });
}
