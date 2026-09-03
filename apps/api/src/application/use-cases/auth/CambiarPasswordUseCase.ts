import type { UsuarioRepository } from "../../ports/out/UsuarioRepository.js";
import type { PasswordHasher } from "../../ports/out/PasswordHasher.js";
import { UsuarioNoEncontradoError } from "./ObtenerUsuarioActualUseCase.js";

export class PasswordActualIncorrectaError extends Error {
  constructor() {
    super("La contraseña actual no es correcta.");
    this.name = "PasswordActualIncorrectaError";
  }
}

export interface CambiarPasswordInput {
  usuarioId: string;
  passwordActual: string;
  passwordNueva: string;
}

export class CambiarPasswordUseCase {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async ejecutar(input: CambiarPasswordInput): Promise<void> {
    const usuario = await this.usuarios.buscarPorId(input.usuarioId);
    if (usuario === null) {
      throw new UsuarioNoEncontradoError(input.usuarioId);
    }

    const passwordActualValida = await this.hasher.verificar(input.passwordActual, usuario.passwordHash);
    if (!passwordActualValida) {
      throw new PasswordActualIncorrectaError();
    }

    const nuevoHash = await this.hasher.hash(input.passwordNueva);
    usuario.cambiarPassword(nuevoHash);
    await this.usuarios.guardar(usuario);
  }
}
