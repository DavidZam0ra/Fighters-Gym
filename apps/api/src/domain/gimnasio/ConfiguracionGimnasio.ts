export interface ConfiguracionGimnasioProps {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  escaneoFichasActivo: boolean;
  notificacionesWhatsappActivo: boolean;
}

export class ConfiguracionGimnasio {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  private _escaneoFichasActivo: boolean;
  private _notificacionesWhatsappActivo: boolean;

  constructor(props: ConfiguracionGimnasioProps) {
    this.nombre = props.nombre;
    this.direccion = props.direccion;
    this.telefono = props.telefono;
    this.email = props.email;
    this._escaneoFichasActivo = props.escaneoFichasActivo;
    this._notificacionesWhatsappActivo = props.notificacionesWhatsappActivo;
  }

  get escaneoFichasActivo(): boolean {
    return this._escaneoFichasActivo;
  }

  activarEscaneoFichas(): void {
    this._escaneoFichasActivo = true;
  }

  desactivarEscaneoFichas(): void {
    this._escaneoFichasActivo = false;
  }

  get notificacionesWhatsappActivo(): boolean {
    return this._notificacionesWhatsappActivo;
  }

  activarNotificacionesWhatsapp(): void {
    this._notificacionesWhatsappActivo = true;
  }

  desactivarNotificacionesWhatsapp(): void {
    this._notificacionesWhatsappActivo = false;
  }
}
