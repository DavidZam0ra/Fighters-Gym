// Borra todo lo generado por seed-carga.ts (identificado por la marca en
// "notas"). Cuotas/disciplinas/asistencia se borran solas por el
// onDelete: Cascade del schema — no hace falta borrarlas a mano.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { MARCA_DATOS_PRUEBA } from "./marca-datos-prueba.js";

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  const marcados = await prisma.alumno.findMany({
    where: { notas: { contains: "DATOS DE PRUEBA" } },
    select: { id: true },
  });

  if (marcados.length === 0) {
    console.log("No hay datos de prueba que borrar.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Borrando ${marcados.length} alumnos de prueba (marca: ${MARCA_DATOS_PRUEBA})…`);
  const resultado = await prisma.alumno.deleteMany({
    where: { id: { in: marcados.map((a) => a.id) } },
  });
  console.log(`Borrados ${resultado.count} alumnos (y sus cuotas/disciplinas en cascada).`);

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
