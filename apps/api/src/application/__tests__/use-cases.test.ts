import { describe, it, expect, beforeEach } from "vitest";
import { CrearAlumnoUseCase } from "../use-cases/alumno/CrearAlumnoUseCase.js";
import { DarDeBajaAlumnoUseCase, AlumnoNoEncontradoError } from "../use-cases/alumno/DarDeBajaAlumnoUseCase.js";
import { ImportarAlumnoPorFotoUseCase } from "../use-cases/alumno/ImportarAlumnoPorFotoUseCase.js";
import { ConfirmarPagoUseCase } from "../use-cases/cuota/ConfirmarPagoUseCase.js";
import { LoginUseCase, CredencialesInvalidasError } from "../use-cases/auth/LoginUseCase.js";
import { Cuota } from "../../domain/cuota/Cuota.js";
import { Periodo } from "../../domain/cuota/Periodo.js";
import { CuotaYaConfirmadaError } from "../../domain/cuota/errors.js";
import { Usuario } from "../../domain/usuario/Usuario.js";
import {
  AlumnoRepositoryFake,
  CuotaRepositoryFake,
  UsuarioRepositoryFake,
  PasswordHasherFake,
  TokenServiceFake,
  ClockFake,
  VisionExtractionServiceFake,
} from "./fakes.js";

describe("CrearAlumnoUseCase", () => {
  it("da de alta un alumno activo con la fecha de alta de hoy", async () => {
    const alumnos = new AlumnoRepositoryFake();
    const clock = new ClockFake(new Date("2026-09-02T00:00:00Z"));
    const useCase = new CrearAlumnoUseCase(alumnos, clock);

    const alumno = await useCase.ejecutar({
      nombre: "Marta",
      apellidos: "Puig",
      telefono: "600111222",
      email: null,
      dniNie: "11111111A",
      fechaNacimiento: new Date("1998-05-01T00:00:00Z"),
      cuotaMensual: 50,
      disciplinas: ["boxeo"],
    });

    expect(alumno.estado).toBe("activo");
    expect(alumno.fechaAlta).toEqual(clock.now());
    expect(await alumnos.buscarPorId(alumno.id)).toBe(alumno);
  });

  it("rechaza un alumno sin ninguna disciplina", async () => {
    const alumnos = new AlumnoRepositoryFake();
    const useCase = new CrearAlumnoUseCase(alumnos, new ClockFake(new Date()));

    await expect(
      useCase.ejecutar({
        nombre: "Marta",
        apellidos: "Puig",
        telefono: "600111222",
        email: null,
        dniNie: "11111111A",
        fechaNacimiento: new Date("1998-05-01T00:00:00Z"),
        cuotaMensual: 50,
        disciplinas: [],
      })
    ).rejects.toThrow();
  });
});

describe("DarDeBajaAlumnoUseCase", () => {
  it("marca al alumno como dado_de_baja", async () => {
    const alumnos = new AlumnoRepositoryFake();
    const clock = new ClockFake(new Date());
    const crear = new CrearAlumnoUseCase(alumnos, clock);
    const alumno = await crear.ejecutar({
      nombre: "Iván",
      apellidos: "Soler",
      telefono: "600333444",
      email: null,
      dniNie: "22222222B",
      fechaNacimiento: new Date("1995-01-01T00:00:00Z"),
      cuotaMensual: 45,
      disciplinas: ["mma"],
    });

    const darDeBaja = new DarDeBajaAlumnoUseCase(alumnos);
    await darDeBaja.ejecutar(alumno.id);

    expect((await alumnos.buscarPorId(alumno.id))?.estado).toBe("dado_de_baja");
  });

  it("lanza AlumnoNoEncontradoError si el id no existe", async () => {
    const darDeBaja = new DarDeBajaAlumnoUseCase(new AlumnoRepositoryFake());
    await expect(darDeBaja.ejecutar("no-existe")).rejects.toThrow(AlumnoNoEncontradoError);
  });
});

describe("ImportarAlumnoPorFotoUseCase", () => {
  it("devuelve un borrador sin guardar ningún alumno", async () => {
    const alumnos = new AlumnoRepositoryFake();
    const useCase = new ImportarAlumnoPorFotoUseCase(new VisionExtractionServiceFake());

    const borrador = await useCase.ejecutar(Buffer.from("foto-falsa"));

    expect(borrador.nombre.valor).toBe("Carla");
    expect(borrador.dniNie.confianza).toBe("baja");
    expect(await alumnos.listarActivos()).toHaveLength(0);
  });
});

describe("ConfirmarPagoUseCase — regla de atraso (5 días de margen)", () => {
  let cuotas: CuotaRepositoryFake;
  let clock: ClockFake;
  const periodoAgosto = Periodo.de(2026, 8);

  beforeEach(() => {
    cuotas = new CuotaRepositoryFake();
    clock = new ClockFake(new Date("2026-09-01T00:00:00Z"));
  });

  it("sigue pendiente el día 5 de septiembre", () => {
    const cuota = new Cuota({
      id: "cuota-1",
      alumnoId: "alumno-1",
      periodo: periodoAgosto,
      importe: 50,
      metodo: null,
      fechaPago: null,
      confirmadoPor: null,
    });
    clock.avanzarA(new Date("2026-09-05T23:59:00Z"));

    expect(cuota.estadoActual(clock.now())).toBe("pendiente");
  });

  it("pasa a atrasada el día 6 de septiembre", () => {
    const cuota = new Cuota({
      id: "cuota-2",
      alumnoId: "alumno-1",
      periodo: periodoAgosto,
      importe: 50,
      metodo: null,
      fechaPago: null,
      confirmadoPor: null,
    });
    clock.avanzarA(new Date("2026-09-06T00:00:01Z"));

    expect(cuota.estadoActual(clock.now())).toBe("atrasado");
  });

  it("confirmar el pago la deja en pagado sin importar la fecha", async () => {
    const cuota = new Cuota({
      id: "cuota-3",
      alumnoId: "alumno-1",
      periodo: periodoAgosto,
      importe: 50,
      metodo: null,
      fechaPago: null,
      confirmadoPor: null,
    });
    await cuotas.guardar(cuota);
    clock.avanzarA(new Date("2026-09-20T00:00:00Z"));

    const useCase = new ConfirmarPagoUseCase(cuotas, clock);
    await useCase.ejecutar({ cuotaId: cuota.id, usuarioId: "usuario-1", metodo: "bizum" });

    const cuotaActualizada = await cuotas.buscarPorId(cuota.id);
    expect(cuotaActualizada?.estadoActual(clock.now())).toBe("pagado");
    expect(cuotaActualizada?.confirmadoPor).toBe("usuario-1");
  });

  it("lanza CuotaYaConfirmadaError al confirmar dos veces la misma cuota", async () => {
    const cuota = new Cuota({
      id: "cuota-4",
      alumnoId: "alumno-1",
      periodo: periodoAgosto,
      importe: 50,
      metodo: null,
      fechaPago: null,
      confirmadoPor: null,
    });
    await cuotas.guardar(cuota);

    const useCase = new ConfirmarPagoUseCase(cuotas, clock);
    await useCase.ejecutar({ cuotaId: cuota.id, usuarioId: "usuario-1", metodo: "bizum" });

    await expect(
      useCase.ejecutar({ cuotaId: cuota.id, usuarioId: "usuario-1", metodo: "efectivo" })
    ).rejects.toThrow(CuotaYaConfirmadaError);
  });
});

describe("LoginUseCase", () => {
  it("emite un par de tokens con credenciales correctas", async () => {
    const hasher = new PasswordHasherFake();
    const passwordHash = await hasher.hash("clave-segura");
    const usuario = new Usuario({
      id: "usuario-1",
      nombre: "Rafa Ros",
      email: "rafa@fightersgym.vlc",
      passwordHash,
      rol: "admin",
    });
    const useCase = new LoginUseCase(new UsuarioRepositoryFake([usuario]), hasher, new TokenServiceFake());

    const tokens = await useCase.ejecutar({ email: "rafa@fightersgym.vlc", password: "clave-segura" });

    expect(tokens.accessToken).toBe("access:usuario-1");
  });

  it("rechaza credenciales incorrectas", async () => {
    const hasher = new PasswordHasherFake();
    const passwordHash = await hasher.hash("clave-segura");
    const usuario = new Usuario({
      id: "usuario-1",
      nombre: "Rafa Ros",
      email: "rafa@fightersgym.vlc",
      passwordHash,
      rol: "admin",
    });
    const useCase = new LoginUseCase(new UsuarioRepositoryFake([usuario]), hasher, new TokenServiceFake());

    await expect(
      useCase.ejecutar({ email: "rafa@fightersgym.vlc", password: "incorrecta" })
    ).rejects.toThrow(CredencialesInvalidasError);
  });
});
