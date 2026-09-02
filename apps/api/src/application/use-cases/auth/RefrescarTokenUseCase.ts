import type { TokenService, TokenPair } from "../../ports/out/TokenService.js";

export class RefreshTokenInvalidoError extends Error {
  constructor() {
    super("El refresh token no es válido o ha caducado.");
    this.name = "RefreshTokenInvalidoError";
  }
}

export class RefrescarTokenUseCase {
  constructor(private readonly tokens: TokenService) {}

  async ejecutar(refreshToken: string): Promise<TokenPair> {
    const payload = await this.tokens.verificarRefreshToken(refreshToken);
    if (payload === null) {
      throw new RefreshTokenInvalidoError();
    }
    return this.tokens.emitir(payload.usuarioId);
  }
}
