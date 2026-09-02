export class Periodo {
  private constructor(
    readonly anio: number,
    readonly mes: number
  ) {}

  static de(anio: number, mes: number): Periodo {
    if (mes < 1 || mes > 12) {
      throw new Error(`Mes inválido: ${mes}`);
    }
    return new Periodo(anio, mes);
  }

  static desdeFecha(fecha: Date): Periodo {
    return new Periodo(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1);
  }

  /** Primer día del periodo siguiente — límite de referencia para el margen de 5 días. */
  inicioMesSiguiente(): Date {
    return new Date(Date.UTC(this.anio, this.mes, 1));
  }

  toDate(): Date {
    return new Date(Date.UTC(this.anio, this.mes - 1, 1));
  }

  equals(otro: Periodo): boolean {
    return this.anio === otro.anio && this.mes === otro.mes;
  }

  toString(): string {
    return `${this.anio}-${String(this.mes).padStart(2, "0")}`;
  }
}
