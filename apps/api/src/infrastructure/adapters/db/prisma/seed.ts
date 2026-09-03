import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { BcryptPasswordHasher } from "../../auth/BcryptPasswordHasher.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env["ADMIN_EMAIL"] ?? "fightersgym.vlc@gmail.com";
  const nombre = process.env["ADMIN_NOMBRE"] ?? "Rafa Ros";
  const password = process.env["ADMIN_PASSWORD"];
  if (password === undefined || password.length === 0) {
    throw new Error(
      'Define ADMIN_PASSWORD antes de sembrar el admin, p. ej.: ADMIN_PASSWORD="algo-seguro" pnpm --filter @fighters-gym/api prisma:seed'
    );
  }

  const hasher = new BcryptPasswordHasher();
  const passwordHash = (await hasher.hash(password)).toString();

  await prisma.usuario.upsert({
    where: { email },
    create: { id: randomUUID(), nombre, email, passwordHash, rol: "admin" },
    update: { nombre, passwordHash, rol: "admin" },
  });
  console.log(`Usuario admin "${email}" sembrado correctamente.`);

  await prisma.configuracionGimnasio.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      nombre: "Fighters Gym",
      direccion: "Carrer Comtes de Parcent 19, 46132 Almàssera (Valencia)",
      telefono: "667 09 55 99",
      email: "fightersgym.vlc@gmail.com",
      escaneoFichasActivo: false,
      notificacionesWhatsappActivo: false,
    },
    // Si ya existe, no la pisamos — puede que Rafa ya la haya editado desde Ajustes.
    update: {},
  });
  console.log("Configuración del gimnasio sembrada correctamente.");

  for (const clase of CLASES) {
    await prisma.clase.upsert({
      where: { id: clase.id },
      create: clase,
      update: clase,
    });
  }
  console.log(`${CLASES.length} clases del horario semanal sembradas correctamente.`);
}

// Horario real del gimnasio (de las fotos de los flyers de Rafa), de lunes a
// viernes — sábado es competición variable y domingo cerrado, así que no
// entran en esta rejilla fija semanal.
const CLASES = [
  ...franjaBoxeo("box-1115", "11:15", "12:15"),
  ...franjaBoxeo("box-1700", "17:00", "18:00"),
  { id: "box-inf-1800-lun", nombre: "Boxeo infantil", disciplina: "boxeo_infantil", diaSemana: "lunes", horaInicio: "18:00", horaFin: "19:00", esInfantil: true, esSparring: false },
  { id: "kick-1800-lun", nombre: "Kickboxing / Muay Thai", disciplina: "kickboxing", diaSemana: "lunes", horaInicio: "18:00", horaFin: "19:00", esInfantil: false, esSparring: false },
  { id: "krav-inf-1800-mar", nombre: "Krav Maga infantil", disciplina: "krav_maga_infantil", diaSemana: "martes", horaInicio: "18:00", horaFin: "19:00", esInfantil: true, esSparring: false },
  { id: "krav-1800-mar", nombre: "Krav Maga", disciplina: "krav_maga", diaSemana: "martes", horaInicio: "18:00", horaFin: "19:00", esInfantil: false, esSparring: false },
  { id: "box-inf-1800-mie", nombre: "Boxeo infantil", disciplina: "boxeo_infantil", diaSemana: "miercoles", horaInicio: "18:00", horaFin: "19:00", esInfantil: true, esSparring: false },
  { id: "kick-1800-mie", nombre: "Kickboxing / Muay Thai", disciplina: "kickboxing", diaSemana: "miercoles", horaInicio: "18:00", horaFin: "19:00", esInfantil: false, esSparring: false },
  { id: "krav-inf-1800-jue", nombre: "Krav Maga infantil", disciplina: "krav_maga_infantil", diaSemana: "jueves", horaInicio: "18:00", horaFin: "19:00", esInfantil: true, esSparring: false },
  { id: "krav-1800-jue", nombre: "Krav Maga", disciplina: "krav_maga", diaSemana: "jueves", horaInicio: "18:00", horaFin: "19:00", esInfantil: false, esSparring: false },
  { id: "box-inf-1800-vie", nombre: "Boxeo infantil", disciplina: "boxeo_infantil", diaSemana: "viernes", horaInicio: "18:00", horaFin: "19:00", esInfantil: true, esSparring: false },
  { id: "kick-spar-1800-vie", nombre: "Kickboxing · sparring", disciplina: "kickboxing", diaSemana: "viernes", horaInicio: "18:00", horaFin: "19:00", esInfantil: false, esSparring: true },
  { id: "mma-1900-lun", nombre: "MMA / Grappling", disciplina: "mma", diaSemana: "lunes", horaInicio: "19:00", horaFin: "20:00", esInfantil: false, esSparring: false },
  { id: "jj-1900-mar", nombre: "Jiu-Jitsu", disciplina: "jiu_jitsu", diaSemana: "martes", horaInicio: "19:00", horaFin: "20:00", esInfantil: false, esSparring: false },
  { id: "mma-1900-mie", nombre: "MMA / Grappling", disciplina: "mma", diaSemana: "miercoles", horaInicio: "19:00", horaFin: "20:00", esInfantil: false, esSparring: false },
  { id: "jj-1900-jue", nombre: "Jiu-Jitsu", disciplina: "jiu_jitsu", diaSemana: "jueves", horaInicio: "19:00", horaFin: "20:00", esInfantil: false, esSparring: false },
  { id: "mma-spar-1900-vie", nombre: "MMA · sparring", disciplina: "mma", diaSemana: "viernes", horaInicio: "19:00", horaFin: "20:00", esInfantil: false, esSparring: true },
  { id: "jj-spar-1900-vie", nombre: "Jiu-Jitsu · sparring", disciplina: "jiu_jitsu", diaSemana: "viernes", horaInicio: "19:00", horaFin: "20:00", esInfantil: false, esSparring: true },
  ...franjaBoxeo("box-2000", "20:00", "21:00"),
] as const;

function franjaBoxeo(prefijoId: string, horaInicio: string, horaFin: string) {
  const dias = ["lunes", "martes", "miercoles", "jueves"] as const;
  return [
    ...dias.map((dia) => ({
      id: `${prefijoId}-${dia.slice(0, 3)}`,
      nombre: "Boxeo",
      disciplina: "boxeo" as const,
      diaSemana: dia,
      horaInicio,
      horaFin,
      esInfantil: false,
      esSparring: false,
    })),
    {
      id: `${prefijoId}-vie`,
      nombre: "Boxeo · sparring",
      disciplina: "boxeo" as const,
      diaSemana: "viernes" as const,
      horaInicio,
      horaFin,
      esInfantil: false,
      esSparring: true,
    },
  ];
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
