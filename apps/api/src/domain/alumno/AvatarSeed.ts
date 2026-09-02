export class AvatarSeed {
  private constructor(private readonly value: string) {}

  static desde(nombre: string, apellidos: string): AvatarSeed {
    const seed = `${nombre} ${apellidos}`.trim();
    if (seed.length === 0) {
      throw new Error("No se puede generar un avatar sin nombre.");
    }
    return new AvatarSeed(seed);
  }

  /** Reconstruye el seed EXACTO ya guardado — nunca se recalcula a partir del nombre actual,
   * así una corrección de nombre más adelante no cambia el avatar que ya tenía el alumno. */
  static desdeValorAlmacenado(valor: string): AvatarSeed {
    return new AvatarSeed(valor);
  }

  toString(): string {
    return this.value;
  }
}
