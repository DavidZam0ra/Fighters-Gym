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
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
