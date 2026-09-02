import bcrypt from "bcrypt";
import { PasswordHash } from "../../../domain/usuario/PasswordHash.js";
import type { PasswordHasher } from "../../../application/ports/out/PasswordHasher.js";

const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(passwordEnClaro: string): Promise<PasswordHash> {
    const hash = await bcrypt.hash(passwordEnClaro, SALT_ROUNDS);
    return PasswordHash.desdeHash(hash);
  }

  async verificar(passwordEnClaro: string, hash: PasswordHash): Promise<boolean> {
    return bcrypt.compare(passwordEnClaro, hash.toString());
  }
}
