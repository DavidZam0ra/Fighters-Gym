import type { AlumnoRepository } from "../ports/out/AlumnoRepository.js";
import type { CuotaRepository } from "../ports/out/CuotaRepository.js";
import type { AsistenciaRepository } from "../ports/out/AsistenciaRepository.js";
import type { ClaseRepository } from "../ports/out/ClaseRepository.js";
import type { UsuarioRepository } from "../ports/out/UsuarioRepository.js";
import type { PasswordHasher } from "../ports/out/PasswordHasher.js";
import type { TokenService, TokenPair } from "../ports/out/TokenService.js";
import type { Clock } from "../ports/out/Clock.js";
import type {
  VisionExtractionService,
  DatosAlumnoExtraidos,
} from "../ports/out/VisionExtractionService.js";
import type { Alumno } from "../../domain/alumno/Alumno.js";
import type { Cuota } from "../../domain/cuota/Cuota.js";
import type { Periodo } from "../../domain/cuota/Periodo.js";
import type { Asistencia } from "../../domain/asistencia/Asistencia.js";
import type { Clase } from "../../domain/clase/Clase.js";
import type { Usuario } from "../../domain/usuario/Usuario.js";
import { PasswordHash } from "../../domain/usuario/PasswordHash.js";
import type { ConfiguracionGimnasioRepository } from "../ports/out/ConfiguracionGimnasioRepository.js";
import { ConfiguracionGimnasio } from "../../domain/gimnasio/ConfiguracionGimnasio.js";

export class AlumnoRepositoryFake implements AlumnoRepository {
  private readonly porId = new Map<string, Alumno>();

  async guardar(alumno: Alumno): Promise<void> {
    this.porId.set(alumno.id, alumno);
  }

  async buscarPorId(id: string): Promise<Alumno | null> {
    return this.porId.get(id) ?? null;
  }

  async buscarPorIds(ids: string[]): Promise<Alumno[]> {
    const idsUnicos = new Set(ids);
    return [...this.porId.values()].filter((a) => idsUnicos.has(a.id));
  }

  async listarActivos(): Promise<Alumno[]> {
    return [...this.porId.values()].filter((a) => a.estado === "activo");
  }
}

export class CuotaRepositoryFake implements CuotaRepository {
  private readonly porId = new Map<string, Cuota>();

  async guardar(cuota: Cuota): Promise<void> {
    this.porId.set(cuota.id, cuota);
  }

  async buscarPorId(id: string): Promise<Cuota | null> {
    return this.porId.get(id) ?? null;
  }

  async listarPorPeriodo(periodo: Periodo): Promise<Cuota[]> {
    return [...this.porId.values()].filter((c) => c.periodo.equals(periodo));
  }

  async buscarPorAlumnoYPeriodo(alumnoId: string, periodo: Periodo): Promise<Cuota | null> {
    return (
      [...this.porId.values()].find((c) => c.alumnoId === alumnoId && c.periodo.equals(periodo)) ?? null
    );
  }

  async listarPorAlumno(alumnoId: string, limite: number): Promise<Cuota[]> {
    return [...this.porId.values()].filter((c) => c.alumnoId === alumnoId).slice(0, limite);
  }

}

export class ClaseRepositoryFake implements ClaseRepository {
  private readonly clases: Clase[] = [];

  async agregar(clase: Clase): Promise<void> {
    this.clases.push(clase);
  }

  async listarTodas(): Promise<Clase[]> {
    return [...this.clases];
  }
}

export class AsistenciaRepositoryFake implements AsistenciaRepository {
  private readonly items: Asistencia[] = [];

  async guardar(asistencia: Asistencia): Promise<void> {
    this.items.push(asistencia);
  }

  async listarPorAlumnoYMes(alumnoId: string, anio: number, mes: number): Promise<Asistencia[]> {
    return this.items.filter(
      (a) => a.alumnoId === alumnoId && a.fecha.getUTCFullYear() === anio && a.fecha.getUTCMonth() + 1 === mes
    );
  }
}

export class UsuarioRepositoryFake implements UsuarioRepository {
  private readonly usuarios: Usuario[];

  constructor(usuarios: Usuario[] = []) {
    this.usuarios = usuarios;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.email === email.toLowerCase()) ?? null;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.id === id) ?? null;
  }

  async guardar(usuario: Usuario): Promise<void> {
    const indice = this.usuarios.findIndex((u) => u.id === usuario.id);
    if (indice === -1) {
      this.usuarios.push(usuario);
    } else {
      this.usuarios[indice] = usuario;
    }
  }
}

/** Sin hashing real: compara texto plano contra el propio "hash". Solo para tests. */
export class PasswordHasherFake implements PasswordHasher {
  async hash(passwordEnClaro: string): Promise<PasswordHash> {
    return PasswordHash.desdeHash(passwordEnClaro);
  }

  async verificar(passwordEnClaro: string, hash: PasswordHash): Promise<boolean> {
    return passwordEnClaro === hash.toString();
  }
}

export class TokenServiceFake implements TokenService {
  async emitir(usuarioId: string): Promise<TokenPair> {
    return { accessToken: `access:${usuarioId}`, refreshToken: `refresh:${usuarioId}` };
  }

  async verificarAccessToken(token: string): Promise<{ usuarioId: string } | null> {
    return token.startsWith("access:") ? { usuarioId: token.slice(7) } : null;
  }

  async verificarRefreshToken(token: string): Promise<{ usuarioId: string } | null> {
    return token.startsWith("refresh:") ? { usuarioId: token.slice(8) } : null;
  }
}

export class ClockFake implements Clock {
  constructor(private fecha: Date) {}

  now(): Date {
    return this.fecha;
  }

  avanzarA(fecha: Date): void {
    this.fecha = fecha;
  }
}

export class ConfiguracionGimnasioRepositoryFake implements ConfiguracionGimnasioRepository {
  private configuracion: ConfiguracionGimnasio;

  constructor(
    configuracion: ConfiguracionGimnasio = new ConfiguracionGimnasio({
      nombre: "Fighters Gym",
      direccion: "Carrer Comtes de Parcent 19, Almàssera",
      telefono: "667 09 55 99",
      email: "fightersgym.vlc@gmail.com",
      escaneoFichasActivo: false,
      notificacionesWhatsappActivo: false,
    })
  ) {
    this.configuracion = configuracion;
  }

  async obtener(): Promise<ConfiguracionGimnasio> {
    return this.configuracion;
  }

  async guardar(configuracion: ConfiguracionGimnasio): Promise<void> {
    this.configuracion = configuracion;
  }
}

export class VisionExtractionServiceFake implements VisionExtractionService {
  async extraerDatosAlumno(_imagen: Buffer): Promise<DatosAlumnoExtraidos> {
    return {
      nombre: { valor: "Carla", confianza: "alta" },
      apellidos: { valor: "Montesinos Bort", confianza: "alta" },
      telefono: { valor: "611223344", confianza: "alta" },
      email: { valor: "carla.mb@ejemplo.com", confianza: "alta" },
      dniNie: { valor: "12345678X", confianza: "baja" },
      fechaNacimiento: { valor: "2009-03-14", confianza: "alta" },
      disciplinas: { valor: ["kickboxing", "muay_thai"], confianza: "alta" },
    };
  }
}
