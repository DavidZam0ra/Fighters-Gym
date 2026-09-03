import { Usuario } from "../../../domain/usuario/Usuario.js";

export interface UsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  guardar(usuario: Usuario): Promise<void>;
}
