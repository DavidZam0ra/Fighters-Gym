import { Disciplina } from "../alumno/Disciplina.js";
import { DiaSemana } from "./DiaSemana.js";

export interface ClaseProps {
  id: string;
  nombre: string;
  disciplina: Disciplina;
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  esInfantil: boolean;
  esSparring: boolean;
}

export class Clase {
  readonly id: string;
  readonly nombre: string;
  readonly disciplina: Disciplina;
  readonly diaSemana: DiaSemana;
  readonly horaInicio: string;
  readonly horaFin: string;
  readonly esInfantil: boolean;
  readonly esSparring: boolean;

  constructor(props: ClaseProps) {
    if (props.horaFin <= props.horaInicio) {
      throw new Error("La hora de fin debe ser posterior a la hora de inicio.");
    }
    this.id = props.id;
    this.nombre = props.nombre;
    this.disciplina = props.disciplina;
    this.diaSemana = props.diaSemana;
    this.horaInicio = props.horaInicio;
    this.horaFin = props.horaFin;
    this.esInfantil = props.esInfantil;
    this.esSparring = props.esSparring;
  }
}
