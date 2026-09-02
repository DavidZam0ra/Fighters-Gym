import type { FastifyInstance, FastifyReply } from "fastify";
import type { LoginResponseDTO } from "@fighters-gym/shared-types";
import { loginSchema } from "../schemas/auth.schemas.js";
import { CredencialesInvalidasError } from "../../../application/use-cases/auth/LoginUseCase.js";
import { RefreshTokenInvalidoError } from "../../../application/use-cases/auth/RefrescarTokenUseCase.js";
import type { Container } from "../../../composition-root/container.js";

const NOMBRE_COOKIE_REFRESH = "refresh_token";
const SEGUNDOS_REFRESH = 30 * 24 * 60 * 60;

export function registrarRutasAuth(app: FastifyInstance, container: Container): void {
  app.post("/auth/login", async (request, reply) => {
    const datos = loginSchema.parse(request.body);

    try {
      const tokens = await container.loginUseCase.ejecutar(datos);
      fijarCookieRefresh(reply, tokens.refreshToken);
      const respuesta: LoginResponseDTO = { accessToken: tokens.accessToken };
      return respuesta;
    } catch (error) {
      if (error instanceof CredencialesInvalidasError) {
        return reply.code(401).send({ error: error.message });
      }
      throw error;
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const refreshToken = request.cookies[NOMBRE_COOKIE_REFRESH];
    if (refreshToken === undefined) {
      return reply.code(401).send({ error: "No hay sesión activa." });
    }

    try {
      const tokens = await container.refrescarTokenUseCase.ejecutar(refreshToken);
      fijarCookieRefresh(reply, tokens.refreshToken);
      const respuesta: LoginResponseDTO = { accessToken: tokens.accessToken };
      return respuesta;
    } catch (error) {
      if (error instanceof RefreshTokenInvalidoError) {
        return reply.code(401).send({ error: error.message });
      }
      throw error;
    }
  });
}

function fijarCookieRefresh(reply: FastifyReply, valor: string): void {
  reply.setCookie(NOMBRE_COOKIE_REFRESH, valor, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/auth",
    maxAge: SEGUNDOS_REFRESH,
  });
}
