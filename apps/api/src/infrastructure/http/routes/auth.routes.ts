import type { FastifyInstance } from "fastify";
import type { LoginResponseDTO } from "@fighters-gym/shared-types";
import { loginSchema, refreshSchema } from "../schemas/auth.schemas.js";
import { CredencialesInvalidasError } from "../../../application/use-cases/auth/LoginUseCase.js";
import { RefreshTokenInvalidoError } from "../../../application/use-cases/auth/RefrescarTokenUseCase.js";
import type { Container } from "../../../composition-root/container.js";

// El refresh token viaja en el body (no en una cookie httpOnly): panel y API
// son subdominios de onrender.com, que está en la Public Suffix List, así
// que el navegador los trata como sitios distintos — Safari/iOS bloquea por
// defecto las cookies de terceros y la sesión no sobrevivía en la PWA
// instalada en el móvil. El propio panel guarda el refresh token en
// localStorage y lo reenvía explícito en cada /auth/refresh.
export function registrarRutasAuth(app: FastifyInstance, container: Container): void {
  app.post("/auth/login", async (request, reply) => {
    const datos = loginSchema.parse(request.body);

    try {
      const tokens = await container.loginUseCase.ejecutar(datos);
      const respuesta: LoginResponseDTO = tokens;
      return respuesta;
    } catch (error) {
      if (error instanceof CredencialesInvalidasError) {
        return reply.code(401).send({ error: error.message });
      }
      throw error;
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body);

    try {
      const tokens = await container.refrescarTokenUseCase.ejecutar(refreshToken);
      const respuesta: LoginResponseDTO = tokens;
      return respuesta;
    } catch (error) {
      if (error instanceof RefreshTokenInvalidoError) {
        return reply.code(401).send({ error: error.message });
      }
      throw error;
    }
  });
}
