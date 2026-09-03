import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { crearContainer } from "../../composition-root/container.js";
import { registrarManejadorErrores } from "./errorHandler.js";
import { registrarRutasAuth } from "./routes/auth.routes.js";
import { registrarRutasAlumnos } from "./routes/alumno.routes.js";
import { registrarRutasUsuario } from "./routes/usuario.routes.js";
import { registrarRutasDashboard } from "./routes/dashboard.routes.js";
import { registrarRutasCuotas } from "./routes/cuota.routes.js";
import { registrarRutasClases } from "./routes/clase.routes.js";
import { registrarRutasAjustes } from "./routes/ajustes.routes.js";

const PUERTO = Number(process.env["PORT"] ?? 4000);

async function main(): Promise<void> {
  const jwtAccessSecret = process.env["JWT_ACCESS_SECRET"];
  const jwtRefreshSecret = process.env["JWT_REFRESH_SECRET"];
  if (jwtAccessSecret === undefined || jwtRefreshSecret === undefined) {
    throw new Error("Faltan JWT_ACCESS_SECRET / JWT_REFRESH_SECRET en el entorno.");
  }

  const container = crearContainer({ jwtAccessSecret, jwtRefreshSecret });

  const app = Fastify({ logger: true });
  registrarManejadorErrores(app);

  await app.register(cors, {
    origin: process.env["CORS_ORIGIN"] ?? "http://localhost:5173",
    credentials: true,
  });
  await app.register(cookie);

  app.get("/health", async () => ({ ok: true }));
  registrarRutasAuth(app, container);
  registrarRutasAlumnos(app, container);
  registrarRutasUsuario(app, container);
  registrarRutasDashboard(app, container);
  registrarRutasCuotas(app, container);
  registrarRutasClases(app, container);
  registrarRutasAjustes(app, container);

  await app.listen({ port: PUERTO, host: "0.0.0.0" });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
