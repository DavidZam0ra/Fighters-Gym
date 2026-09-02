import { Disciplina, esDisciplinaValida } from "./Disciplina.js";
import { EstadoAlumno } from "./EstadoAlumno.js";
import { AvatarSeed } from "./AvatarSeed.js";
import { AlumnoYaDadoDeBajaError, DisciplinaInvalidaError } from "./errors.js";

export interface AlumnoProps {
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string | null;
  dniNie: string;
  fechaNacimiento: Date;
  fechaAlta: Date;
  estado: EstadoAlumno;
  cuotaMensual: number;
  disciplinas: Disciplina[];
  /** Solo al reconstruir desde persistencia — si se omite, se calcula de nombre+apellidos. */
  avatarSeed?: AvatarSeed;
}

export class Alumno {
  readonly id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string | null;
  readonly dniNie: string;
  readonly fechaNacimiento: Date;
  readonly fechaAlta: Date;
  private _estado: EstadoAlumno;
  cuotaMensual: number;
  private _disciplinas: Disciplina[];
  readonly avatarSeed: AvatarSeed;

  constructor(props: AlumnoProps) {
    validarDisciplinas(props.disciplinas);

    this.id = props.id;
    this.nombre = props.nombre;
    this.apellidos = props.apellidos;
    this.telefono = props.telefono;
    this.email = props.email;
    this.dniNie = props.dniNie;
    this.fechaNacimiento = props.fechaNacimiento;
    this.fechaAlta = props.fechaAlta;
    this._estado = props.estado;
    this.cuotaMensual = props.cuotaMensual;
    this._disciplinas = props.disciplinas;
    this.avatarSeed = props.avatarSeed ?? AvatarSeed.desde(props.nombre, props.apellidos);
  }

  get estado(): EstadoAlumno {
    return this._estado;
  }

  get disciplinas(): readonly Disciplina[] {
    return this._disciplinas;
  }

  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellidos}`;
  }

  darDeBaja(): void {
    if (this._estado === "dado_de_baja") {
      throw new AlumnoYaDadoDeBajaError(this.id);
    }
    this._estado = "dado_de_baja";
  }

  reactivar(): void {
    this._estado = "activo";
  }

  actualizarDisciplinas(disciplinas: Disciplina[]): void {
    validarDisciplinas(disciplinas);
    this._disciplinas = disciplinas;
  }
}

function validarDisciplinas(disciplinas: Disciplina[]): void {
  if (disciplinas.length === 0) {
    throw new Error("Un alumno debe tener al menos una disciplina.");
  }
  for (const disciplina of disciplinas) {
    if (!esDisciplinaValida(disciplina)) {
      throw new DisciplinaInvalidaError(disciplina);
    }
  }
}
