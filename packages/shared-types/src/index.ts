// Wire-format DTOs shared between apps/api and apps/panel ONLY.
// Never put domain entities/value objects here — those live in
// apps/api/src/domain and stay private to the API.
//
// Populado feature a feature a medida que se construye cada ruta/pantalla
// (ver el build order del plan). Primeras DTOs: auth + alumnos (Paso 5).

export type Disciplina =
  | "boxeo"
  | "kickboxing"
  | "muay_thai"
  | "mma"
  | "jiu_jitsu"
  | "grappling"
  | "krav_maga"
  | "defensa_personal"
  | "boxeo_infantil"
  | "krav_maga_infantil"
  | "competicion";

export type EstadoAlumno = "activo" | "dado_de_baja";
export type EstadoCuota = "pagado" | "pendiente" | "atrasado";
export type MetodoPago = "bizum" | "transferencia" | "efectivo";
export type EstadoAsistencia = "asistio" | "justificada" | "sin_avisar";
export type DiaSemana = "lunes" | "martes" | "miercoles" | "jueves" | "viernes";

export interface AlumnoDTO {
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string | null;
  dniNie: string;
  fechaNacimiento: string;
  fechaAlta: string;
  estado: EstadoAlumno;
  cuotaMensual: number;
  disciplinas: Disciplina[];
  notas: string | null;
  avatarSeed: string;
}

export interface ActualizarNotasRequestDTO {
  notas: string | null;
}

export interface CampoExtraidoDTO<T> {
  valor: T;
  confianza: "alta" | "baja";
}

export interface DatosAlumnoExtraidosDTO {
  nombre: CampoExtraidoDTO<string>;
  apellidos: CampoExtraidoDTO<string>;
  telefono: CampoExtraidoDTO<string>;
  email: CampoExtraidoDTO<string | null>;
  dniNie: CampoExtraidoDTO<string>;
  fechaNacimiento: CampoExtraidoDTO<string>;
  disciplinas: CampoExtraidoDTO<Disciplina[]>;
}

export interface CrearAlumnoRequestDTO {
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string | null;
  dniNie: string;
  fechaNacimiento: string;
  cuotaMensual: number;
  disciplinas: Disciplina[];
}

export interface CuotaDTO {
  id: string;
  periodo: string;
  importe: number;
  metodo: MetodoPago | null;
  fechaPago: string | null;
  estado: EstadoCuota;
}

export interface AsistenciaDTO {
  id: string;
  fecha: string;
  estado: EstadoAsistencia;
}

export interface FichaAlumnoDTO {
  alumno: AlumnoDTO;
  cuotasRecientes: CuotaDTO[];
  asistenciaDelMes: AsistenciaDTO[];
}

export interface CuotaDelMesDTO {
  cuotaId: string;
  alumnoId: string;
  nombreAlumno: string;
  importe: number;
  metodo: MetodoPago | null;
  fechaPago: string | null;
  estado: EstadoCuota;
}

export interface ConfirmarPagoRequestDTO {
  metodo: MetodoPago;
}

export interface ClaseDTO {
  id: string;
  nombre: string;
  disciplina: Disciplina;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  esInfantil: boolean;
  esSparring: boolean;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export type Rol = "admin" | "profesor";

export interface UsuarioActualDTO {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface CuotaPendienteResumenDTO {
  alumnoId: string;
  nombreAlumno: string;
  estado: "pendiente" | "atrasado";
}

export interface ClaseDeHoyDTO {
  id: string;
  nombre: string;
  horaInicio: string;
}

export interface ResumenDashboardDTO {
  alumnosActivos: number;
  cuotasPendientes: number;
  clasesHoy: number;
  cobradoEsteMes: number;
  cuotasAtrasadas: CuotaPendienteResumenDTO[];
  horarioHoy: ClaseDeHoyDTO[];
}

export interface ConfiguracionGimnasioDTO {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  escaneoFichasActivo: boolean;
  notificacionesWhatsappActivo: boolean;
}

export type ActualizarConfiguracionGimnasioRequestDTO = ConfiguracionGimnasioDTO;

export interface CambiarPasswordRequestDTO {
  passwordActual: string;
  passwordNueva: string;
}
