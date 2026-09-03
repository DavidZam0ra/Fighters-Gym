import type { FastifyInstance } from "fastify";
import type { ClaseDTO } from "@fighters-gym/shared-types";
import { aClaseDTO } from "../mappers/clase.mapper.js";
import type { Container } from "../../../composition-root/container.js";

export function registrarRutasClases(app: FastifyInstance, container: Container): void {
  app.get("/clases", { preHandler: container.authenticate }, async (): Promise<ClaseDTO[]> => {
    const clases = await container.listarClasesUseCase.ejecutar();
    return clases.map(aClaseDTO);
  });
}
