import { Prisma, PrismaClient } from "@prisma/client";
import { Usuario } from "../../../domain/usuario/Usuario.js";
import { PasswordHash } from "../../../domain/usuario/PasswordHash.js";
import type { Rol } from "../../../domain/usuario/Rol.js";
import type { UsuarioRepository } from "../../../application/ports/out/UsuarioRepository.js";

type UsuarioRow = Prisma.UsuarioGetPayload<Record<string, never>>;

export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const fila = await this.prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
    return fila === null ? null : this.aDominio(fila);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const fila = await this.prisma.usuario.findUnique({ where: { id } });
    return fila === null ? null : this.aDominio(fila);
  }

  private aDominio(fila: UsuarioRow): Usuario {
    return new Usuario({
      id: fila.id,
      nombre: fila.nombre,
      email: fila.email,
      passwordHash: PasswordHash.desdeHash(fila.passwordHash),
      rol: fila.rol as Rol,
    });
  }
}
