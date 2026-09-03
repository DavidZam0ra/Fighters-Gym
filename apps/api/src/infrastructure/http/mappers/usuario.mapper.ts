import type { UsuarioActualDTO } from "@fighters-gym/shared-types";
import type { Usuario } from "../../../domain/usuario/Usuario.js";

export function aUsuarioActualDTO(usuario: Usuario): UsuarioActualDTO {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };
}
