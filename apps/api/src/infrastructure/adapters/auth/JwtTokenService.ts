import { SignJWT, jwtVerify } from "jose";
import type { TokenService, TokenPair } from "../../../application/ports/out/TokenService.js";

const DURACION_ACCESS = "15m";
const DURACION_REFRESH = "30d";

export interface JwtTokenServiceConfig {
  accessSecret: string;
  refreshSecret: string;
}

export class JwtTokenService implements TokenService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;

  constructor(config: JwtTokenServiceConfig) {
    this.accessSecret = new TextEncoder().encode(config.accessSecret);
    this.refreshSecret = new TextEncoder().encode(config.refreshSecret);
  }

  async emitir(usuarioId: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      new SignJWT({ sub: usuarioId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(DURACION_ACCESS)
        .sign(this.accessSecret),
      new SignJWT({ sub: usuarioId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(DURACION_REFRESH)
        .sign(this.refreshSecret),
    ]);
    return { accessToken, refreshToken };
  }

  async verificarAccessToken(token: string): Promise<{ usuarioId: string } | null> {
    return this.verificar(token, this.accessSecret);
  }

  async verificarRefreshToken(token: string): Promise<{ usuarioId: string } | null> {
    return this.verificar(token, this.refreshSecret);
  }

  private async verificar(token: string, secret: Uint8Array): Promise<{ usuarioId: string } | null> {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (typeof payload.sub !== "string") {
        return null;
      }
      return { usuarioId: payload.sub };
    } catch {
      return null;
    }
  }
}
