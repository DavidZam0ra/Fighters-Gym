import { PasswordHash } from "./PasswordHash.js";
import { Rol } from "./Rol.js";

export interface UsuarioProps {
  id: string;
  nombre: string;
  email: string;
  passwordHash: PasswordHash;
  rol: Rol;
}

export class Usuario {
  readonly id: string;
  readonly nombre: string;
  readonly email: string;
  private _passwordHash: PasswordHash;
  readonly rol: Rol;

  constructor(props: UsuarioProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.email = props.email.toLowerCase();
    this._passwordHash = props.passwordHash;
    this.rol = props.rol;
  }

  get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  cambiarPassword(nuevoHash: PasswordHash): void {
    this._passwordHash = nuevoHash;
  }

  esAdmin(): boolean {
    return this.rol === "admin";
  }
}
