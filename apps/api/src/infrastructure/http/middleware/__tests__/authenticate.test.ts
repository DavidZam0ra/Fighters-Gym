import { describe, expect, it } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";
import { crearAuthenticate } from "../authenticate.js";
import { TokenServiceFake } from "../../../../application/__tests__/fakes.js";

function crearRequestFake(authorization?: string): FastifyRequest {
  return { headers: { authorization } } as unknown as FastifyRequest;
}

function crearReplyFake(): { reply: FastifyReply; codigoEnviado: () => number | undefined } {
  let codigo: number | undefined;
  const reply = {
    code(valor: number) {
      codigo = valor;
      return reply;
    },
    async send() {
      return reply;
    },
  };
  return { reply: reply as unknown as FastifyReply, codigoEnviado: () => codigo };
}

describe("authenticate", () => {
  it("responde 401 si no hay cabecera Authorization", async () => {
    const authenticate = crearAuthenticate(new TokenServiceFake());
    const request = crearRequestFake(undefined);
    const { reply, codigoEnviado } = crearReplyFake();

    await authenticate(request, reply);

    expect(codigoEnviado()).toBe(401);
    expect(request.usuarioId).toBeUndefined();
  });

  it("responde 401 si el token no es válido", async () => {
    const authenticate = crearAuthenticate(new TokenServiceFake());
    const request = crearRequestFake("Bearer token-basura");
    const { reply, codigoEnviado } = crearReplyFake();

    await authenticate(request, reply);

    expect(codigoEnviado()).toBe(401);
  });

  it("adjunta usuarioId a la request con un access token válido", async () => {
    const tokens = new TokenServiceFake();
    const { accessToken } = await tokens.emitir("usuario-42");
    const authenticate = crearAuthenticate(tokens);
    const request = crearRequestFake(`Bearer ${accessToken}`);
    const { reply, codigoEnviado } = crearReplyFake();

    await authenticate(request, reply);

    expect(codigoEnviado()).toBeUndefined();
    expect(request.usuarioId).toBe("usuario-42");
  });
});
