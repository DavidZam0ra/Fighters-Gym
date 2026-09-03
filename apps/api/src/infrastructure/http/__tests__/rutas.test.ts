import { describe, expect, it } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import { registrarManejadorErrores } from "../errorHandler.js";
import { registrarRutasAuth } from "../routes/auth.routes.js";
import { registrarRutasAlumnos } from "../routes/alumno.routes.js";
import { registrarRutasUsuario } from "../routes/usuario.routes.js";
import { registrarRutasDashboard } from "../routes/dashboard.routes.js";
import { crearAuthenticate } from "../middleware/authenticate.js";
import type { Container } from "../../../composition-root/container.js";
import { LoginUseCase } from "../../../application/use-cases/auth/LoginUseCase.js";
import { RefrescarTokenUseCase } from "../../../application/use-cases/auth/RefrescarTokenUseCase.js";
import { ObtenerUsuarioActualUseCase } from "../../../application/use-cases/auth/ObtenerUsuarioActualUseCase.js";
import { CrearAlumnoUseCase } from "../../../application/use-cases/alumno/CrearAlumnoUseCase.js";
import { ListarAlumnosUseCase } from "../../../application/use-cases/alumno/ListarAlumnosUseCase.js";
import { ObtenerFichaAlumnoUseCase } from "../../../application/use-cases/alumno/ObtenerFichaAlumnoUseCase.js";
import { DarDeBajaAlumnoUseCase } from "../../../application/use-cases/alumno/DarDeBajaAlumnoUseCase.js";
import { ObtenerResumenDashboardUseCase } from "../../../application/use-cases/dashboard/ObtenerResumenDashboardUseCase.js";
import {
  AlumnoRepositoryFake,
  CuotaRepositoryFake,
  AsistenciaRepositoryFake,
  ClaseRepositoryFake,
  UsuarioRepositoryFake,
  PasswordHasherFake,
  TokenServiceFake,
  ClockFake,
} from "../../../application/__tests__/fakes.js";
import { Usuario } from "../../../domain/usuario/Usuario.js";

const EMAIL_ADMIN = "admin@fightersgym.test";
const PASSWORD_ADMIN = "clave-segura";

async function construirApp(): Promise<{ app: FastifyInstance; tokens: TokenServiceFake }> {
  const alumnos = new AlumnoRepositoryFake();
  const cuotas = new CuotaRepositoryFake();
  const asistencias = new AsistenciaRepositoryFake();
  const clases = new ClaseRepositoryFake();
  const hasher = new PasswordHasherFake();
  const tokens = new TokenServiceFake();
  const clock = new ClockFake(new Date("2026-09-02T00:00:00Z"));

  const passwordHash = await hasher.hash(PASSWORD_ADMIN);
  const usuario = new Usuario({
    id: "usuario-1",
    nombre: "Admin de prueba",
    email: EMAIL_ADMIN,
    passwordHash,
    rol: "admin",
  });
  const usuarios = new UsuarioRepositoryFake([usuario]);

  const container: Container = {
    clock,
    authenticate: crearAuthenticate(tokens),
    loginUseCase: new LoginUseCase(usuarios, hasher, tokens),
    refrescarTokenUseCase: new RefrescarTokenUseCase(tokens),
    crearAlumnoUseCase: new CrearAlumnoUseCase(alumnos, clock),
    listarAlumnosUseCase: new ListarAlumnosUseCase(alumnos),
    obtenerFichaAlumnoUseCase: new ObtenerFichaAlumnoUseCase(alumnos, cuotas, asistencias),
    darDeBajaAlumnoUseCase: new DarDeBajaAlumnoUseCase(alumnos),
    obtenerUsuarioActualUseCase: new ObtenerUsuarioActualUseCase(usuarios),
    obtenerResumenDashboardUseCase: new ObtenerResumenDashboardUseCase(alumnos, cuotas, clases, clock),
  };

  const app = Fastify();
  registrarManejadorErrores(app);
  await app.register(cookie);
  registrarRutasAuth(app, container);
  registrarRutasAlumnos(app, container);
  registrarRutasUsuario(app, container);
  registrarRutasDashboard(app, container);
  await app.ready();

  return { app, tokens };
}

describe("POST /auth/login", () => {
  it("devuelve un accessToken y fija la cookie de refresco con credenciales correctas", async () => {
    const { app } = await construirApp();

    const respuesta = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: EMAIL_ADMIN, password: PASSWORD_ADMIN },
    });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().accessToken).toBe("access:usuario-1");
    expect(respuesta.cookies.some((c) => c.name === "refresh_token")).toBe(true);
  });

  it("rechaza credenciales incorrectas con 401", async () => {
    const { app } = await construirApp();

    const respuesta = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: EMAIL_ADMIN, password: "mala-clave" },
    });

    expect(respuesta.statusCode).toBe(401);
  });

  it("rechaza un cuerpo inválido con 400", async () => {
    const { app } = await construirApp();

    const respuesta = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "no-es-un-email" },
    });

    expect(respuesta.statusCode).toBe(400);
  });
});

describe("POST /auth/refresh", () => {
  it("responde 401, no 500, cuando no hay cookie de sesión", async () => {
    const { app } = await construirApp();

    // Regresión: el panel llama a /auth/refresh al arrancar, sin cuerpo,
    // pero con Content-Type: application/json — Fastify trata eso como un
    // error de parseo (cuerpo vacío) que el errorHandler debe traducir a un
    // 4xx normal, no a un 500 genérico.
    const respuesta = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: { "content-type": "application/json" },
    });

    expect(respuesta.statusCode).not.toBe(500);
    expect(respuesta.statusCode).toBe(400);
  });

  it("responde 401 cuando la cookie de refresco no existe", async () => {
    const { app } = await construirApp();

    const respuesta = await app.inject({ method: "POST", url: "/auth/refresh" });

    expect(respuesta.statusCode).toBe(401);
  });
});

describe("Rutas de alumnos", () => {
  it("GET /alumnos exige autenticación", async () => {
    const { app } = await construirApp();
    const respuesta = await app.inject({ method: "GET", url: "/alumnos" });
    expect(respuesta.statusCode).toBe(401);
  });

  it("crea un alumno autenticado, lo lista y luego lo da de baja", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");
    const cabeceras = { authorization: `Bearer ${accessToken}` };

    const creacion = await app.inject({
      method: "POST",
      url: "/alumnos",
      headers: cabeceras,
      payload: {
        nombre: "Marta",
        apellidos: "Puig",
        telefono: "600111222",
        email: null,
        dniNie: "11111111A",
        fechaNacimiento: "1998-05-01",
        cuotaMensual: 50,
        disciplinas: ["boxeo"],
      },
    });
    expect(creacion.statusCode).toBe(201);
    const alumnoCreado = creacion.json();

    const listado = await app.inject({ method: "GET", url: "/alumnos", headers: cabeceras });
    expect(listado.statusCode).toBe(200);
    expect(listado.json()).toHaveLength(1);
    expect(listado.json()[0].nombre).toBe("Marta");

    const ficha = await app.inject({
      method: "GET",
      url: `/alumnos/${alumnoCreado.id}`,
      headers: cabeceras,
    });
    expect(ficha.statusCode).toBe(200);
    expect(ficha.json().alumno.id).toBe(alumnoCreado.id);

    const baja = await app.inject({
      method: "POST",
      url: `/alumnos/${alumnoCreado.id}/baja`,
      headers: cabeceras,
    });
    expect(baja.statusCode).toBe(204);

    const listadoTrasBaja = await app.inject({ method: "GET", url: "/alumnos", headers: cabeceras });
    expect(listadoTrasBaja.json()).toHaveLength(0);
  });

  it("devuelve 404 al pedir la ficha de un alumno inexistente", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");

    const respuesta = await app.inject({
      method: "GET",
      url: "/alumnos/00000000-0000-4000-8000-000000000099",
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(respuesta.statusCode).toBe(404);
  });
});

describe("GET /auth/me", () => {
  it("exige autenticación", async () => {
    const { app } = await construirApp();
    const respuesta = await app.inject({ method: "GET", url: "/auth/me" });
    expect(respuesta.statusCode).toBe(401);
  });

  it("devuelve los datos del usuario autenticado", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");

    const respuesta = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toMatchObject({ id: "usuario-1", email: EMAIL_ADMIN, rol: "admin" });
  });
});

describe("GET /dashboard/resumen", () => {
  it("exige autenticación", async () => {
    const { app } = await construirApp();
    const respuesta = await app.inject({ method: "GET", url: "/dashboard/resumen" });
    expect(respuesta.statusCode).toBe(401);
  });

  it("devuelve un resumen vacío coherente cuando no hay datos", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");

    const respuesta = await app.inject({
      method: "GET",
      url: "/dashboard/resumen",
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toEqual({
      alumnosActivos: 0,
      cuotasPendientes: 0,
      clasesHoy: 0,
      cobradoEsteMes: 0,
      cuotasAtrasadas: [],
      horarioHoy: [],
    });
  });
});
