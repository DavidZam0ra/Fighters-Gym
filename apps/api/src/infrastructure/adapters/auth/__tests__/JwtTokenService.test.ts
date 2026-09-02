import { describe, expect, it } from "vitest";
import { JwtTokenService } from "../JwtTokenService.js";

function crearServicio(): JwtTokenService {
  return new JwtTokenService({
    accessSecret: "secreto-de-acceso-para-tests",
    refreshSecret: "secreto-de-refresco-para-tests",
  });
}

describe("JwtTokenService", () => {
  it("emite un access y un refresh token que cada uno verifica su propio tipo", async () => {
    const tokens = crearServicio();
    const par = await tokens.emitir("usuario-1");

    expect(await tokens.verificarAccessToken(par.accessToken)).toEqual({ usuarioId: "usuario-1" });
    expect(await tokens.verificarRefreshToken(par.refreshToken)).toEqual({ usuarioId: "usuario-1" });
  });

  it("rechaza un access token verificado como si fuera de refresco (secretos distintos)", async () => {
    const tokens = crearServicio();
    const par = await tokens.emitir("usuario-1");

    expect(await tokens.verificarRefreshToken(par.accessToken)).toBeNull();
    expect(await tokens.verificarAccessToken(par.refreshToken)).toBeNull();
  });

  it("rechaza un token con firma de otro secreto", async () => {
    const tokens = crearServicio();
    const otroServicio = new JwtTokenService({
      accessSecret: "otro-secreto-completamente-distinto",
      refreshSecret: "otro-secreto-de-refresco",
    });
    const par = await otroServicio.emitir("usuario-1");

    expect(await tokens.verificarAccessToken(par.accessToken)).toBeNull();
  });

  it("rechaza un token con formato inválido sin lanzar", async () => {
    const tokens = crearServicio();
    expect(await tokens.verificarAccessToken("esto-no-es-un-jwt")).toBeNull();
  });
});
