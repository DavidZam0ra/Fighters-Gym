import { describe, expect, it } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import { registrarManejadorErrores } from "../errorHandler.js";
import { registrarRutasAuth } from "../routes/auth.routes.js";
import { registrarRutasAlumnos } from "../routes/alumno.routes.js";
import { registrarRutasUsuario } from "../routes/usuario.routes.js";
import { registrarRutasDashboard } from "../routes/dashboard.routes.js";
import { registrarRutasCuotas } from "../routes/cuota.routes.js";
import { registrarRutasClases } from "../routes/clase.routes.js";
import { registrarRutasAjustes } from "../routes/ajustes.routes.js";
import { crearAuthenticate } from "../middleware/authenticate.js";
import type { Container } from "../../../composition-root/container.js";
import { LoginUseCase } from "../../../application/use-cases/auth/LoginUseCase.js";
import { RefrescarTokenUseCase } from "../../../application/use-cases/auth/RefrescarTokenUseCase.js";
import { ObtenerUsuarioActualUseCase } from "../../../application/use-cases/auth/ObtenerUsuarioActualUseCase.js";
import { CrearAlumnoUseCase } from "../../../application/use-cases/alumno/CrearAlumnoUseCase.js";
import { ListarAlumnosUseCase } from "../../../application/use-cases/alumno/ListarAlumnosUseCase.js";
import { ObtenerFichaAlumnoUseCase } from "../../../application/use-cases/alumno/ObtenerFichaAlumnoUseCase.js";
import { DarDeBajaAlumnoUseCase } from "../../../application/use-cases/alumno/DarDeBajaAlumnoUseCase.js";
import { ActualizarNotasAlumnoUseCase } from "../../../application/use-cases/alumno/ActualizarNotasAlumnoUseCase.js";
import { ObtenerResumenDashboardUseCase } from "../../../application/use-cases/dashboard/ObtenerResumenDashboardUseCase.js";
import { RegistrarCuotasDelMesUseCase } from "../../../application/use-cases/cuota/RegistrarCuotasDelMesUseCase.js";
import { ListarCuotasDelMesUseCase } from "../../../application/use-cases/cuota/ListarCuotasDelMesUseCase.js";
import { ConfirmarPagoUseCase } from "../../../application/use-cases/cuota/ConfirmarPagoUseCase.js";
import { ListarClasesUseCase } from "../../../application/use-cases/clase/ListarClasesUseCase.js";
import { ObtenerConfiguracionGimnasioUseCase } from "../../../application/use-cases/ajustes/ObtenerConfiguracionGimnasioUseCase.js";
import { ActualizarConfiguracionGimnasioUseCase } from "../../../application/use-cases/ajustes/ActualizarConfiguracionGimnasioUseCase.js";
import { CambiarPasswordUseCase } from "../../../application/use-cases/auth/CambiarPasswordUseCase.js";
import { ImportarAlumnoPorFotoUseCase } from "../../../application/use-cases/alumno/ImportarAlumnoPorFotoUseCase.js";
import {
  AlumnoRepositoryFake,
  CuotaRepositoryFake,
  AsistenciaRepositoryFake,
  ClaseRepositoryFake,
  UsuarioRepositoryFake,
  ConfiguracionGimnasioRepositoryFake,
  VisionExtractionServiceFake,
  PasswordHasherFake,
  TokenServiceFake,
  ClockFake,
} from "../../../application/__tests__/fakes.js";
import { Usuario } from "../../../domain/usuario/Usuario.js";
import { Clase } from "../../../domain/clase/Clase.js";

const EMAIL_ADMIN = "admin@fightersgym.test";
const PASSWORD_ADMIN = "clave-segura";

async function construirApp(): Promise<{
  app: FastifyInstance;
  tokens: TokenServiceFake;
  clases: ClaseRepositoryFake;
}> {
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
  const configuracionGimnasio = new ConfiguracionGimnasioRepositoryFake();
  const registrarCuotasDelMes = new RegistrarCuotasDelMesUseCase(alumnos, cuotas, clock);

  const container: Container = {
    clock,
    authenticate: crearAuthenticate(tokens),
    loginUseCase: new LoginUseCase(usuarios, hasher, tokens),
    refrescarTokenUseCase: new RefrescarTokenUseCase(tokens),
    crearAlumnoUseCase: new CrearAlumnoUseCase(alumnos, clock),
    listarAlumnosUseCase: new ListarAlumnosUseCase(alumnos),
    obtenerFichaAlumnoUseCase: new ObtenerFichaAlumnoUseCase(alumnos, cuotas, asistencias),
    darDeBajaAlumnoUseCase: new DarDeBajaAlumnoUseCase(alumnos),
    actualizarNotasAlumnoUseCase: new ActualizarNotasAlumnoUseCase(alumnos),
    obtenerUsuarioActualUseCase: new ObtenerUsuarioActualUseCase(usuarios),
    obtenerResumenDashboardUseCase: new ObtenerResumenDashboardUseCase(
      alumnos,
      cuotas,
      clases,
      registrarCuotasDelMes,
      clock
    ),
    listarCuotasDelMesUseCase: new ListarCuotasDelMesUseCase(cuotas, alumnos, registrarCuotasDelMes, clock),
    confirmarPagoUseCase: new ConfirmarPagoUseCase(cuotas, clock),
    listarClasesUseCase: new ListarClasesUseCase(clases),
    obtenerConfiguracionGimnasioUseCase: new ObtenerConfiguracionGimnasioUseCase(configuracionGimnasio),
    actualizarConfiguracionGimnasioUseCase: new ActualizarConfiguracionGimnasioUseCase(configuracionGimnasio),
    cambiarPasswordUseCase: new CambiarPasswordUseCase(usuarios, hasher),
    importarAlumnoPorFotoUseCase: new ImportarAlumnoPorFotoUseCase(new VisionExtractionServiceFake()),
  };

  const app = Fastify();
  registrarManejadorErrores(app);
  await app.register(cookie);
  await app.register(multipart);
  registrarRutasAuth(app, container);
  registrarRutasAlumnos(app, container);
  registrarRutasUsuario(app, container);
  registrarRutasDashboard(app, container);
  registrarRutasClases(app, container);
  registrarRutasCuotas(app, container);
  registrarRutasAjustes(app, container);
  await app.ready();

  return { app, tokens, clases };
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

describe("POST /auth/logout", () => {
  it("borra la cookie de refresco en el servidor, no solo el token en el cliente", async () => {
    const { app } = await construirApp();

    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: EMAIL_ADMIN, password: PASSWORD_ADMIN },
    });
    const cookieRefresh = login.cookies.find((c) => c.name === "refresh_token");
    expect(cookieRefresh).toBeDefined();

    const logout = await app.inject({ method: "POST", url: "/auth/logout" });
    expect(logout.statusCode).toBe(204);
    const cookieBorrada = logout.cookies.find((c) => c.name === "refresh_token");
    // clearCookie vacía el valor y expira la cookie en el pasado.
    expect(cookieBorrada?.value).toBe("");

    // Regresión del bug real: tras "logout", un /auth/refresh con la cookie ya
    // borrada no debe devolver una sesión nueva.
    const refreshTrasLogout = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      cookies: { refresh_token: cookieBorrada?.value ?? "" },
    });
    expect(refreshTrasLogout.statusCode).toBe(401);
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
    expect(ficha.json().alumno.notas).toBeNull();

    const notas = await app.inject({
      method: "PATCH",
      url: `/alumnos/${alumnoCreado.id}/notas`,
      headers: cabeceras,
      payload: { notas: "Preparando su primer combate amateur." },
    });
    expect(notas.statusCode).toBe(204);

    const fichaConNotas = await app.inject({
      method: "GET",
      url: `/alumnos/${alumnoCreado.id}`,
      headers: cabeceras,
    });
    expect(fichaConNotas.json().alumno.notas).toBe("Preparando su primer combate amateur.");

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

  it("POST /alumnos/importar-foto exige autenticación", async () => {
    const { app } = await construirApp();
    const respuesta = await app.inject({ method: "POST", url: "/alumnos/importar-foto" });
    expect(respuesta.statusCode).toBe(401);
  });

  it("extrae los datos de una foto de ficha usando el servicio de visión", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");

    const boundary = "----test-boundary";
    const cuerpo = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="archivo"; filename="ficha.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
      ),
      Buffer.from([0xff, 0xd8, 0xff, 0xdb]), // cabecera JPEG mínima, el contenido no importa (el fake ignora la imagen)
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const respuesta = await app.inject({
      method: "POST",
      url: "/alumnos/importar-foto",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: cuerpo,
    });

    expect(respuesta.statusCode).toBe(200);
    const datos = respuesta.json();
    expect(datos.nombre.valor).toBe("Carla");
    expect(datos.dniNie.confianza).toBe("baja");
    expect(datos.disciplinas.valor).toEqual(["kickboxing", "muay_thai"]);
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

describe("Rutas de cuotas", () => {
  it("GET /cuotas exige autenticación", async () => {
    const { app } = await construirApp();
    const respuesta = await app.inject({ method: "GET", url: "/cuotas" });
    expect(respuesta.statusCode).toBe(401);
  });

  it("autogenera la cuota del mes del alumno activo y permite confirmarla", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");
    const cabeceras = { authorization: `Bearer ${accessToken}` };

    await app.inject({
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

    const listado = await app.inject({ method: "GET", url: "/cuotas", headers: cabeceras });
    expect(listado.statusCode).toBe(200);
    const cuotas = listado.json();
    expect(cuotas).toHaveLength(1);
    expect(cuotas[0]).toMatchObject({ nombreAlumno: "Marta Puig", importe: 50, estado: "pendiente" });

    const confirmacion = await app.inject({
      method: "POST",
      url: `/cuotas/${cuotas[0].cuotaId}/confirmar`,
      headers: cabeceras,
      payload: { metodo: "bizum" },
    });
    expect(confirmacion.statusCode).toBe(204);

    const listadoTrasConfirmar = await app.inject({ method: "GET", url: "/cuotas", headers: cabeceras });
    expect(listadoTrasConfirmar.json()[0]).toMatchObject({ estado: "pagado", metodo: "bizum" });
  });

  it("devuelve 404 al confirmar una cuota inexistente", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");

    const respuesta = await app.inject({
      method: "POST",
      url: "/cuotas/00000000-0000-4000-8000-000000000099/confirmar",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { metodo: "efectivo" },
    });

    expect(respuesta.statusCode).toBe(404);
  });
});

describe("GET /clases", () => {
  it("exige autenticación", async () => {
    const { app } = await construirApp();
    const respuesta = await app.inject({ method: "GET", url: "/clases" });
    expect(respuesta.statusCode).toBe(401);
  });

  it("devuelve el catálogo de clases", async () => {
    const { app, tokens, clases } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");
    await clases.agregar(
      new Clase({
        id: "clase-1",
        nombre: "Boxeo",
        disciplina: "boxeo",
        diaSemana: "lunes",
        horaInicio: "11:15",
        horaFin: "12:15",
        esInfantil: false,
        esSparring: false,
      })
    );

    const respuesta = await app.inject({
      method: "GET",
      url: "/clases",
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toEqual([
      {
        id: "clase-1",
        nombre: "Boxeo",
        disciplina: "boxeo",
        diaSemana: "lunes",
        horaInicio: "11:15",
        horaFin: "12:15",
        esInfantil: false,
        esSparring: false,
      },
    ]);
  });
});

describe("Rutas de ajustes", () => {
  it("GET /ajustes exige autenticación", async () => {
    const { app } = await construirApp();
    const respuesta = await app.inject({ method: "GET", url: "/ajustes" });
    expect(respuesta.statusCode).toBe(401);
  });

  it("lee y actualiza la configuración del gimnasio", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");
    const cabeceras = { authorization: `Bearer ${accessToken}` };

    const lectura = await app.inject({ method: "GET", url: "/ajustes", headers: cabeceras });
    expect(lectura.statusCode).toBe(200);
    expect(lectura.json().nombre).toBe("Fighters Gym");
    expect(lectura.json().escaneoFichasActivo).toBe(false);

    const actualizacion = await app.inject({
      method: "PUT",
      url: "/ajustes",
      headers: cabeceras,
      payload: {
        nombre: "Fighters Gym",
        direccion: "Carrer Comtes de Parcent 19, Almàssera",
        telefono: "667 09 55 99",
        email: "fightersgym.vlc@gmail.com",
        escaneoFichasActivo: true,
        notificacionesWhatsappActivo: true,
      },
    });
    expect(actualizacion.statusCode).toBe(204);

    const lecturaTrasActualizar = await app.inject({ method: "GET", url: "/ajustes", headers: cabeceras });
    expect(lecturaTrasActualizar.json().escaneoFichasActivo).toBe(true);
    expect(lecturaTrasActualizar.json().notificacionesWhatsappActivo).toBe(true);
  });
});

describe("POST /auth/cambiar-password", () => {
  it("exige autenticación", async () => {
    const { app } = await construirApp();
    const respuesta = await app.inject({
      method: "POST",
      url: "/auth/cambiar-password",
      payload: { passwordActual: "x", passwordNueva: "clave-nueva-larga" },
    });
    expect(respuesta.statusCode).toBe(401);
  });

  it("rechaza la contraseña actual incorrecta", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");

    const respuesta = await app.inject({
      method: "POST",
      url: "/auth/cambiar-password",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { passwordActual: "incorrecta", passwordNueva: "clave-nueva-larga" },
    });
    expect(respuesta.statusCode).toBe(401);
  });

  it("cambia la contraseña y permite volver a loguearse con la nueva", async () => {
    const { app, tokens } = await construirApp();
    const { accessToken } = await tokens.emitir("usuario-1");

    const cambio = await app.inject({
      method: "POST",
      url: "/auth/cambiar-password",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { passwordActual: PASSWORD_ADMIN, passwordNueva: "clave-nueva-larga" },
    });
    expect(cambio.statusCode).toBe(204);

    const loginConNueva = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: EMAIL_ADMIN, password: "clave-nueva-larga" },
    });
    expect(loginConNueva.statusCode).toBe(200);

    const loginConAntigua = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: EMAIL_ADMIN, password: PASSWORD_ADMIN },
    });
    expect(loginConAntigua.statusCode).toBe(401);
  });
});
