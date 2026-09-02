import type { UsuarioRepository } from "../../ports/out/UsuarioRepository.js";
import type { PasswordHasher } from "../../ports/out/PasswordHasher.js";
import type { TokenService, TokenPair } from "../../ports/out/TokenService.js";

export class CredencialesInvalidasError extends Error {
  constructor() {
    super("Email o contraseña incorrectos.");
    this.name = "CredencialesInvalidasError";
  }
}

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService
  ) {}

  async ejecutar(input: LoginInput): Promise<TokenPair> {
    const usuario = await this.usuarios.buscarPorEmail(input.email.toLowerCase());
    if (usuario === null) {
      throw new CredencialesInvalidasError();
    }
    const passwordValida = await this.hasher.verificar(input.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new CredencialesInvalidasError();
    }
    return this.tokens.emitir(usuario.id);
  }
}
