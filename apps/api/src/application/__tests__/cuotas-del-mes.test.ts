import { describe, expect, it } from "vitest";
import { RegistrarCuotasDelMesUseCase } from "../use-cases/cuota/RegistrarCuotasDelMesUseCase.js";
import { ListarCuotasDelMesUseCase } from "../use-cases/cuota/ListarCuotasDelMesUseCase.js";
import { ConfirmarPagoUseCase } from "../use-cases/cuota/ConfirmarPagoUseCase.js";
import { CrearAlumnoUseCase } from "../use-cases/alumno/CrearAlumnoUseCase.js";
import { Cuota } from "../../domain/cuota/Cuota.js";
import { Periodo } from "../../domain/cuota/Periodo.js";
import { AlumnoRepositoryFake, CuotaRepositoryFake, ClockFake } from "./fakes.js";

describe("RegistrarCuotasDelMesUseCase", () => {
  it("crea una cuota pendiente por cada alumno activo que no tenga ya una este mes", async () => {
    const alumnos = new AlumnoRepositoryFake();
    const cuotas = new CuotaRepositoryFake();
    const clock = new ClockFake(new Date("2026-09-10T00:00:00Z"));
    const crearAlumno = new CrearAlumnoUseCase(alumnos, clock);

    const alumno1 = await crearAlumno.ejecutar({
      nombre: "Marta",
      apellidos: "Puig",
      telefono: "600000001",
      email: null,
      dniNie: "10000001A",
      fechaNacimiento: new Date("1998-01-01T00:00:00Z"),
      cuotaMensual: 50,
      disciplinas: ["boxeo"],
    });
    const alumno2 = await crearAlumno.ejecutar({
      nombre: "Iván",
      apellidos: "Soler",
      telefono: "600000002",
      email: null,
      dniNie: "10000002B",
      fechaNacimiento: new Date("1995-01-01T00:00:00Z"),
      cuotaMensual: 45,
      disciplinas: ["mma"],
    });

    // Iván ya tiene una cuota de septiembre (p. ej. ya confirmada) — no debe duplicarse.
    await cuotas.guardar(
      new Cuota({
        id: "cuota-existente",
        alumnoId: alumno2.id,
        periodo: Periodo.de(2026, 9),
        importe: 45,
        metodo: "bizum",
        fechaPago: clock.now(),
        confirmadoPor: "usuario-1",
      })
    );

    const useCase = new RegistrarCuotasDelMesUseCase(alumnos, cuotas, clock);
    await useCase.ejecutar();

    const cuotasDeMarta = await cuotas.listarPorAlumno(alumno1.id, 10);
    expect(cuotasDeMarta).toHaveLength(1);
    expect(cuotasDeMarta[0]?.importe).toBe(50);
    expect(cuotasDeMarta[0]?.metodo).toBeNull();

    const cuotasDeIvan = await cuotas.listarPorAlumno(alumno2.id, 10);
    expect(cuotasDeIvan).toHaveLength(1);
    expect(cuotasDeIvan[0]?.id).toBe("cuota-existente");

    // Ejecutarlo de nuevo no debe crear duplicados.
    await useCase.ejecutar();
    expect(await cuotas.listarPorAlumno(alumno1.id, 10)).toHaveLength(1);
  });
});

describe("ListarCuotasDelMesUseCase", () => {
  it("registra las cuotas que falten, y devuelve la lista con nombre y estado, ordenada por nombre", async () => {
    const alumnos = new AlumnoRepositoryFake();
    const cuotas = new CuotaRepositoryFake();
    const clock = new ClockFake(new Date("2026-09-10T00:00:00Z"));
    const crearAlumno = new CrearAlumnoUseCase(alumnos, clock);

    await crearAlumno.ejecutar({
      nombre: "Zaira",
      apellidos: "Torres",
      telefono: "600000003",
      email: null,
      dniNie: "10000003C",
      fechaNacimiento: new Date("1999-01-01T00:00:00Z"),
      cuotaMensual: 45,
      disciplinas: ["boxeo"],
    });
    await crearAlumno.ejecutar({
      nombre: "Ana",
      apellidos: "López",
      telefono: "600000004",
      email: null,
      dniNie: "10000004D",
      fechaNacimiento: new Date("2000-01-01T00:00:00Z"),
      cuotaMensual: 45,
      disciplinas: ["mma"],
    });

    const registrar = new RegistrarCuotasDelMesUseCase(alumnos, cuotas, clock);
    const listar = new ListarCuotasDelMesUseCase(cuotas, alumnos, registrar, clock);

    const resultado = await listar.ejecutar();

    expect(resultado).toHaveLength(2);
    expect(resultado.map((c) => c.nombreAlumno)).toEqual(["Ana López", "Zaira Torres"]);
    expect(resultado.every((c) => c.estado === "pendiente")).toBe(true);
  });

  it("refleja el pago tras confirmarlo con ConfirmarPagoUseCase", async () => {
    const alumnos = new AlumnoRepositoryFake();
    const cuotas = new CuotaRepositoryFake();
    const clock = new ClockFake(new Date("2026-09-10T00:00:00Z"));
    const crearAlumno = new CrearAlumnoUseCase(alumnos, clock);

    const alumno = await crearAlumno.ejecutar({
      nombre: "Marta",
      apellidos: "Puig",
      telefono: "600000005",
      email: null,
      dniNie: "10000005E",
      fechaNacimiento: new Date("1998-01-01T00:00:00Z"),
      cuotaMensual: 50,
      disciplinas: ["boxeo"],
    });

    const registrar = new RegistrarCuotasDelMesUseCase(alumnos, cuotas, clock);
    const listar = new ListarCuotasDelMesUseCase(cuotas, alumnos, registrar, clock);
    const [cuotaGenerada] = await listar.ejecutar();
    expect(cuotaGenerada?.estado).toBe("pendiente");

    const confirmar = new ConfirmarPagoUseCase(cuotas, clock);
    await confirmar.ejecutar({
      cuotaId: cuotaGenerada?.cuotaId as string,
      usuarioId: "usuario-1",
      metodo: "efectivo",
    });

    const [cuotaActualizada] = await listar.ejecutar();
    expect(cuotaActualizada?.estado).toBe("pagado");
    expect(cuotaActualizada?.metodo).toBe("efectivo");
    expect(cuotaActualizada?.alumnoId).toBe(alumno.id);
  });
});
