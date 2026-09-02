import { PasswordHash } from "../../../domain/usuario/PasswordHash.js";

export interface PasswordHasher {
  hash(passwordEnClaro: string): Promise<PasswordHash>;
  verificar(passwordEnClaro: string, hash: PasswordHash): Promise<boolean>;
}
