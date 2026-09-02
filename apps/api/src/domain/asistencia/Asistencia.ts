import { EstadoAsistencia } from "./EstadoAsistencia.js";

export interface AsistenciaProps {
  id: string;
  alumnoId: string;
  fecha: Date;
  estado: EstadoAsistencia;
}

export class Asistencia {
  readonly id: string;
  readonly alumnoId: string;
  readonly fecha: Date;
  readonly estado: EstadoAsistencia;

  constructor(props: AsistenciaProps) {
    this.id = props.id;
    this.alumnoId = props.alumnoId;
    this.fecha = props.fecha;
    this.estado = props.estado;
  }
}
