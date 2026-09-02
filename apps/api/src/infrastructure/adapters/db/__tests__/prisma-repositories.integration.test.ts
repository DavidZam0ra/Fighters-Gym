import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaAlumnoRepository } from "../PrismaAlumnoRepository.js";
import { PrismaCuotaRepository } from "../PrismaCuotaRepository.js";
import { PrismaUsuarioRepository } from "../PrismaUsuarioRepository.js";
import { Alumno } from "../../../../domain/alumno/Alumno.js";
import { Cuota } from "../../../../domain/cuota/Cuota.js";
import { Periodo } from "../../../../domain/cuota/Periodo.js";

const prisma = new PrismaClient();
const alumnoRepo = new PrismaAlumnoRepository(prisma);
const cuotaRepo = new PrismaCuotaRepository(prisma);
const usuarioRepo = new PrismaUsuarioRepository(prisma);

const ID_ALUMNO = "00000000-0000-4000-8000-000000000001";
const ID_CUOTA = "00000000-0000-4000-8000-000000000002";
const ID_USUARIO = "00000000-0000-4000-8000-000000000003";

afterAll(async () => {
  await prisma.cuota.deleteMany({ where: { id: ID_CUOTA } });
  await prisma.alumno.deleteMany({ where: { id: ID_ALUMNO } });
  await prisma.usuario.deleteMany({ where: { id: ID_USUARIO } });
  await prisma.$disconnect();
});

describe("Adaptadores Prisma (integración contra la base real)", () => {
  it("PrismaAlumnoRepository: guarda, recupera y da de baja con las disciplinas intactas", async () => {
    const alumno = new Alumno({
      id: ID_ALUMNO,
      nombre: "Prueba",
      apellidos: "Integración",
      telefono: "600000000",
      email: null,
      dniNie: "00000000Z",
      fechaNacimiento: new Date("2000-01-01T00:00:00Z"),
      fechaAlta: new Date("2026-09-02T00:00:00Z"),
      estado: "activo",
      cuotaMensual: 40,
      disciplinas: ["boxeo", "mma"],
    });
    await alumnoRepo.guardar(alumno);

    const recuperado = await alumnoRepo.buscarPorId(ID_ALUMNO);
    expect(recuperado?.nombreCompleto).toBe("Prueba Integración");
    expect([...(recuperado?.disciplinas ?? [])].sort()).toEqual(["boxeo", "mma"]);
    expect(recuperado?.avatarSeed.toString()).toBe(alumno.avatarSeed.toString());

    recuperado?.darDeBaja();
    if (recuperado !== null && recuperado !== undefined) {
      await alumnoRepo.guardar(recuperado);
    }

    expect((await alumnoRepo.buscarPorId(ID_ALUMNO))?.estado).toBe("dado_de_baja");
    const activos = await alumnoRepo.listarActivos();
    expect(activos.find((a) => a.id === ID_ALUMNO)).toBeUndefined();
  });

  it("PrismaCuotaRepository + PrismaUsuarioRepository: confirma un pago con FK real a Usuario", async () => {
    await prisma.usuario.create({
      data: {
        id: ID_USUARIO,
        nombre: "Admin de prueba",
        email: `admin-prueba-${ID_USUARIO}@fightersgym.test`,
        passwordHash: "hash-de-prueba",
        rol: "admin",
      },
    });
    const usuario = await usuarioRepo.buscarPorId(ID_USUARIO);
    expect(usuario?.esAdmin()).toBe(true);

    const periodo = Periodo.de(2026, 8);
    const cuota = new Cuota({
      id: ID_CUOTA,
      alumnoId: ID_ALUMNO,
      periodo,
      importe: 40,
      metodo: null,
      fechaPago: null,
      confirmadoPor: null,
    });
    await cuotaRepo.guardar(cuota);

    cuota.confirmarPago(ID_USUARIO, "bizum", new Date("2026-09-03T00:00:00Z"));
    await cuotaRepo.guardar(cuota);

    const recuperada = await cuotaRepo.buscarPorAlumnoYPeriodo(ID_ALUMNO, periodo);
    expect(recuperada?.confirmadoPor).toBe(ID_USUARIO);
    expect(recuperada?.metodo).toBe("bizum");
    expect(recuperada?.estadoActual(new Date("2026-09-03T00:00:00Z"))).toBe("pagado");
  });
});
