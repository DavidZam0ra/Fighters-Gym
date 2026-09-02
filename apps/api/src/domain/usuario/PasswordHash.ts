export class PasswordHash {
  private constructor(private readonly value: string) {}

  static desdeHash(hash: string): PasswordHash {
    if (hash.length === 0) {
      throw new Error("El hash de contraseña no puede estar vacío.");
    }
    return new PasswordHash(hash);
  }

  toString(): string {
    return this.value;
  }
}
