// Genera N alumnos con datos aleatorios (pero realistas) para probar tiempos
// de carga con volumen — NO forma parte del seed real (seed.ts). Usa el
// mismo flujo real de creación (CrearAlumnoUseCase), no atajos directos a la
// BD, así que la reejecución respeta las mismas reglas que un alta manual.
//
// Uso:
//   pnpm --filter @fighters-gym/api seed:carga [cantidad=250]
//   pnpm --filter @fighters-gym/api seed:carga:limpiar   (borra todo lo generado)
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaAlumnoRepository } from "../src/infrastructure/adapters/db/PrismaAlumnoRepository.js";
import { PrismaCuotaRepository } from "../src/infrastructure/adapters/db/PrismaCuotaRepository.js";
import { CrearAlumnoUseCase } from "../src/application/use-cases/alumno/CrearAlumnoUseCase.js";
import { SystemClock } from "../src/infrastructure/adapters/clock/SystemClock.js";
import { Cuota } from "../src/domain/cuota/Cuota.js";
import { Periodo } from "../src/domain/cuota/Periodo.js";
import type { Disciplina } from "../src/domain/alumno/Disciplina.js";
import type { MetodoPago } from "../src/domain/cuota/MetodoPago.js";
import { MARCA_DATOS_PRUEBA } from "./marca-datos-prueba.js";

const NOMBRES = [
  "Marta", "Iván", "Laura", "Pablo", "Núria", "Alex", "Sofía", "Marc", "Elena", "Adrián",
  "Carla", "Hugo", "Paula", "Daniel", "Irene", "Álvaro", "Lucía", "Sergio", "Ana", "David",
  "Claudia", "Mario", "Andrea", "Diego", "Sara", "Rubén", "Alba", "Javier", "Cristina", "Raúl",
];

const APELLIDOS = [
  "Puig", "Soler", "Ferrer", "Giménez", "Alberola", "Ros", "Bort", "Torres", "López", "García",
  "Martí", "Sanz", "Bataller", "Montesinos", "Vidal", "Company", "Peris", "Ibáñez", "Aznar", "Ferrando",
  "Salvador", "Blasco", "Quiles", "Boronat", "Chust", "Domingo", "Escrivá", "Furió", "Gascó", "Herrero",
];

const DISCIPLINAS_ADULTO: Disciplina[] = [
  "boxeo", "kickboxing", "muay_thai", "mma", "grappling", "jiu_jitsu", "krav_maga", "defensa_personal", "competicion",
];
const DISCIPLINAS_INFANTIL: Disciplina[] = ["boxeo_infantil", "krav_maga_infantil"];
const METODOS: MetodoPago[] = ["bizum", "transferencia", "efectivo"];

const PRECIO_INDIVIDUAL: Record<Disciplina, number> = {
  boxeo: 50,
  kickboxing: 45,
  muay_thai: 45,
  mma: 45,
  grappling: 45,
  jiu_jitsu: 45,
  krav_maga: 45,
  defensa_personal: 45,
  boxeo_infantil: 45,
  krav_maga_infantil: 45,
  competicion: 70,
};

function aleatorio<T>(lista: T[]): T {
  const indice = Math.floor(Math.random() * lista.length);
  return lista[indice] as T;
}

function fechaAleatoriaEntre(desde: Date, hasta: Date): Date {
  return new Date(desde.getTime() + Math.random() * (hasta.getTime() - desde.getTime()));
}

function sugerirCuota(disciplinas: Disciplina[]): number {
  if (disciplinas.includes("competicion")) return PRECIO_INDIVIDUAL.competicion;
  if (disciplinas.length === 1) return PRECIO_INDIVIDUAL[disciplinas[0] as Disciplina];
  if (disciplinas.length === 2) return 60;
  return 75;
}

async function main(): Promise<void> {
  const cantidad = Number(process.argv[2] ?? 250);
  const prisma = new PrismaClient();
  const alumnoRepository = new PrismaAlumnoRepository(prisma);
  const cuotaRepository = new PrismaCuotaRepository(prisma);
  const clock = new SystemClock();
  const crearAlumno = new CrearAlumnoUseCase(alumnoRepository, clock);

  const usuario = await prisma.usuario.findFirst();
  if (usuario === null) {
    throw new Error("No hay ningún usuario en la base — siembra un admin primero (pnpm prisma:seed).");
  }

  console.log(`Generando ${cantidad} alumnos de prueba…`);
  console.time("seed-carga");

  for (let i = 0; i < cantidad; i++) {
    const nombre = aleatorio(NOMBRES);
    const apellidos = `${aleatorio(APELLIDOS)} ${aleatorio(APELLIDOS)}`;
    const esInfantil = Math.random() < 0.15;
    const fechaNacimiento = esInfantil
      ? fechaAleatoriaEntre(new Date("2014-01-01T00:00:00Z"), new Date("2019-01-01T00:00:00Z"))
      : fechaAleatoriaEntre(new Date("1970-01-01T00:00:00Z"), new Date("2008-01-01T00:00:00Z"));

    const catalogo = esInfantil ? DISCIPLINAS_INFANTIL : DISCIPLINAS_ADULTO;
    const numDisciplinas = esInfantil ? 1 : aleatorio([1, 1, 1, 2, 2, 3]);
    const disciplinas = [...new Set(Array.from({ length: numDisciplinas }, () => aleatorio(catalogo)))];

    const alumno = await crearAlumno.ejecutar({
      nombre,
      apellidos,
      telefono: `6${String(Math.floor(Math.random() * 100_000_000)).padStart(8, "0")}`,
      email:
        Math.random() < 0.85
          ? `${nombre.toLowerCase()}.${apellidos.split(" ")[0]?.toLowerCase()}${i}@ejemplo-prueba.test`
          : null,
      dniNie: `${String(10_000_000 + i).padStart(8, "0")}${aleatorio(["A", "B", "C", "D", "E", "F"])}`,
      fechaNacimiento,
      cuotaMensual: sugerirCuota(disciplinas),
      disciplinas,
    });

    alumno.actualizarNotas(MARCA_DATOS_PRUEBA);
    if (Math.random() < 0.08) {
      alumno.darDeBaja();
    }
    await alumnoRepository.guardar(alumno);

    // ~3 meses de historial de cuotas, con una mezcla de pagadas/pendientes.
    const hoy = clock.now();
    for (let mesesAtras = 2; mesesAtras >= 0; mesesAtras--) {
      const fechaPeriodo = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - mesesAtras, 1));
      const periodo = Periodo.desdeFecha(fechaPeriodo);
      const cuota = new Cuota({
        id: randomUUID(),
        alumnoId: alumno.id,
        periodo,
        importe: alumno.cuotaMensual,
        metodo: null,
        fechaPago: null,
        confirmadoPor: null,
      });
      if (Math.random() < 0.75) {
        cuota.confirmarPago(usuario.id, aleatorio(METODOS), fechaAleatoriaEntre(periodo.toDate(), hoy));
      }
      await cuotaRepository.guardar(cuota);
    }

    if ((i + 1) % 25 === 0) {
      console.log(`  ${i + 1}/${cantidad}…`);
    }
  }

  console.timeEnd("seed-carga");
  console.log(`Listo: ${cantidad} alumnos de prueba con ~3 meses de historial de cuotas.`);
  console.log("Para borrarlos: pnpm --filter @fighters-gym/api seed:carga:limpiar");
  await prisma.$disconnect();
}

// Guarda de punto de entrada: si algún día algo más importa una función de
// aquí, cargar el módulo no debe disparar la siembra por sí solo.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
