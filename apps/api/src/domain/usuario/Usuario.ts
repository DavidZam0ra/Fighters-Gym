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
  readonly passwordHash: PasswordHash;
  readonly rol: Rol;

  constructor(props: UsuarioProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.email = props.email.toLowerCase();
    this.passwordHash = props.passwordHash;
    this.rol = props.rol;
  }

  esAdmin(): boolean {
    return this.rol === "admin";
  }
}
