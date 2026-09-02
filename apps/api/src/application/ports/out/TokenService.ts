export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenService {
  emitir(usuarioId: string): Promise<TokenPair>;
  verificarAccessToken(token: string): Promise<{ usuarioId: string } | null>;
  verificarRefreshToken(token: string): Promise<{ usuarioId: string } | null>;
}
