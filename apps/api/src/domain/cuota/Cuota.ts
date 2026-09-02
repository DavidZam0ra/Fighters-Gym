import { EstadoCuota } from "./EstadoCuota.js";
import { MetodoPago } from "./MetodoPago.js";
import { Periodo } from "./Periodo.js";

const DIAS_DE_MARGEN = 5;

export interface CuotaProps {
  id: string;
  alumnoId: string;
  periodo: Periodo;
  importe: number;
  metodo: MetodoPago | null;
  fechaPago: Date | null;
  confirmadoPor: string | null;
}

export class Cuota {
  readonly id: string;
  readonly alumnoId: string;
  readonly periodo: Periodo;
  readonly importe: number;
  private _metodo: MetodoPago | null;
  private _fechaPago: Date | null;
  private _confirmadoPor: string | null;

  constructor(props: CuotaProps) {
    this.id = props.id;
    this.alumnoId = props.alumnoId;
    this.periodo = props.periodo;
    this.importe = props.importe;
    this._metodo = props.metodo;
    this._fechaPago = props.fechaPago;
    this._confirmadoPor = props.confirmadoPor;
  }

  get metodo(): MetodoPago | null {
    return this._metodo;
  }

  get fechaPago(): Date | null {
    return this._fechaPago;
  }

  get confirmadoPor(): string | null {
    return this._confirmadoPor;
  }

  /**
   * Estado calculado a partir de `fechaHoy`, no un campo persistido como
   * fuente de verdad: una cuota de un `periodo` dado sigue "pendiente" hasta
   * el día 5 del mes siguiente (inclusive); desde el día 6, si sigue sin
   * pagar, pasa a "atrasado". Regla confirmada con el cliente.
   */
  estadoActual(fechaHoy: Date): EstadoCuota {
    if (this._fechaPago !== null) {
      return "pagado";
    }
    const finDeMargen = this.periodo.inicioMesSiguiente();
    finDeMargen.setUTCDate(finDeMargen.getUTCDate() + DIAS_DE_MARGEN);
    return fechaHoy <= finDeMargen ? "pendiente" : "atrasado";
  }

  confirmarPago(usuarioId: string, metodo: MetodoPago, fechaPago: Date): void {
    if (this._fechaPago !== null) {
      throw new Error(`La cuota ${this.id} ya está confirmada como pagada.`);
    }
    this._metodo = metodo;
    this._fechaPago = fechaPago;
    this._confirmadoPor = usuarioId;
  }
}
