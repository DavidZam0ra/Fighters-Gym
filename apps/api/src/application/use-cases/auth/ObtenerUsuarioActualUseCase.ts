import type { Usuario } from "../../../domain/usuario/Usuario.js";
import type { UsuarioRepository } from "../../ports/out/UsuarioRepository.js";

export class UsuarioNoEncontradoError extends Error {
  constructor(id: string) {
    super(`No existe ningún usuario con id ${id}.`);
    this.name = "UsuarioNoEncontradoError";
  }
}

export class ObtenerUsuarioActualUseCase {
  constructor(private readonly usuarios: UsuarioRepository) {}

  async ejecutar(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (usuario === null) {
      throw new UsuarioNoEncontradoError(usuarioId);
    }
    return usuario;
  }
}
