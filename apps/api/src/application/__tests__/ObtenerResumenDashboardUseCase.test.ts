import { describe, expect, it } from "vitest";
import { ObtenerResumenDashboardUseCase } from "../use-cases/dashboard/ObtenerResumenDashboardUseCase.js";
import { RegistrarCuotasDelMesUseCase } from "../use-cases/cuota/RegistrarCuotasDelMesUseCase.js";
import { CrearAlumnoUseCase } from "../use-cases/alumno/CrearAlumnoUseCase.js";
import { Cuota } from "../../domain/cuota/Cuota.js";
import { Periodo } from "../../domain/cuota/Periodo.js";
import { Clase } from "../../domain/clase/Clase.js";
import {
  AlumnoRepositoryFake,
  CuotaRepositoryFake,
  ClaseRepositoryFake,
  ClockFake,
} from "./fakes.js";

describe("ObtenerResumenDashboardUseCase", () => {
  it("resume alumnos activos, cuotas impagadas del periodo actual, clases de hoy y cobrado del mes", async () => {
    const alumnos = new AlumnoRepositoryFake();
    const cuotas = new CuotaRepositoryFake();
    const clases = new ClaseRepositoryFake();
    // Lunes 2026-09-07: elegido a propósito para que caiga en "lunes".
    const clock = new ClockFake(new Date("2026-09-07T10:00:00Z"));
    const periodoActual = Periodo.desdeFecha(clock.now());
    const registrarCuotasDelMes = new RegistrarCuotasDelMesUseCase(alumnos, cuotas, clock);

    const crearAlumno = new CrearAlumnoUseCase(alumnos, clock);
    const alumnoPendiente = await crearAlumno.ejecutar({
      nombre: "Iván",
      apellidos: "Soler",
      telefono: "600000002",
      email: null,
      dniNie: "10000002B",
      fechaNacimiento: new Date("1992-01-01T00:00:00Z"),
      cuotaMensual: 45,
      disciplinas: ["mma"],
    });
    const alumnoAlDia = await crearAlumno.ejecutar({
      nombre: "Pablo",
      apellidos: "Giménez",
      telefono: "600000003",
      email: null,
      dniNie: "10000003C",
      fechaNacimiento: new Date("1995-01-01T00:00:00Z"),
      cuotaMensual: 45,
      disciplinas: ["kickboxing"],
    });
    const alumnoConDeudaAntigua = await crearAlumno.ejecutar({
      nombre: "Núria",
      apellidos: "Alberola",
      telefono: "600000001",
      email: null,
      dniNie: "10000001A",
      fechaNacimiento: new Date("1990-01-01T00:00:00Z"),
      cuotaMensual: 45,
      disciplinas: ["boxeo"],
    });

    // Impagada de un periodo pasado (agosto): no debe contarse como impagada
    // del periodo actual (el resumen solo mira septiembre, igual que Cuotas).
    // Como este alumno no tiene todavía cuota de septiembre, el propio
    // RegistrarCuotasDelMesUseCase le generará una pendiente al ejecutar.
    await cuotas.guardar(
      new Cuota({
        id: "cuota-agosto",
        alumnoId: alumnoConDeudaAntigua.id,
        periodo: Periodo.de(2026, 8),
        importe: 45,
        metodo: null,
        fechaPago: null,
        confirmadoPor: null,
      })
    );
    // Pendiente: periodo actual (septiembre), sin pagar todavía.
    await cuotas.guardar(
      new Cuota({
        id: "cuota-pendiente",
        alumnoId: alumnoPendiente.id,
        periodo: periodoActual,
        importe: 45,
        metodo: null,
        fechaPago: null,
        confirmadoPor: null,
      })
    );
    // Pagada este mes: cuenta para "cobrado este mes" pero no para "pendientes".
    const cuotaPagada = new Cuota({
      id: "cuota-pagada",
      alumnoId: alumnoAlDia.id,
      periodo: periodoActual,
      importe: 45,
      metodo: null,
      fechaPago: null,
      confirmadoPor: null,
    });
    cuotaPagada.confirmarPago("usuario-1", "bizum", clock.now());
    await cuotas.guardar(cuotaPagada);

    await clases.agregar(
      new Clase({
        id: "clase-1",
        nombre: "Kickboxing",
        disciplina: "kickboxing",
        diaSemana: "lunes",
        horaInicio: "18:15",
        horaFin: "19:15",
        esInfantil: false,
        esSparring: false,
      })
    );
    await clases.agregar(
      new Clase({
        id: "clase-2",
        nombre: "Boxeo infantil",
        disciplina: "boxeo_infantil",
        diaSemana: "martes",
        horaInicio: "17:00",
        horaFin: "18:00",
        esInfantil: true,
        esSparring: false,
      })
    );

    const useCase = new ObtenerResumenDashboardUseCase(alumnos, cuotas, clases, registrarCuotasDelMes, clock);
    const resumen = await useCase.ejecutar();

    expect(resumen.alumnosActivos).toBe(3);
    expect(resumen.clasesHoy).toBe(1);
    expect(resumen.horarioHoy).toEqual([{ id: "clase-1", nombre: "Kickboxing", horaInicio: "18:15" }]);

    // Dos impagadas del periodo actual: la pendiente ya existente de Iván y
    // la nueva pendiente de septiembre autogenerada para Núria. La deuda de
    // agosto de Núria no se cuenta aquí (ese es justo el bug que se arregló).
    expect(resumen.cuotasPendientes).toBe(2);
    expect(resumen.cobradoEsteMes).toBe(45);
    expect(resumen.cuotasAtrasadas).toHaveLength(2);
    expect(resumen.cuotasAtrasadas[0]).toEqual({
      alumnoId: alumnoPendiente.id,
      nombreAlumno: "Iván Soler",
      estado: "pendiente",
    });
    expect(resumen.cuotasAtrasadas[1]).toEqual({
      alumnoId: alumnoConDeudaAntigua.id,
      nombreAlumno: "Núria Alberola",
      estado: "pendiente",
    });
  });
});
