import type { FastifyInstance } from "fastify";
import type { ConfiguracionGimnasioDTO } from "@fighters-gym/shared-types";
import { actualizarConfiguracionSchema } from "../schemas/ajustes.schemas.js";
import { aConfiguracionGimnasioDTO } from "../mappers/ajustes.mapper.js";
import type { Container } from "../../../composition-root/container.js";

export function registrarRutasAjustes(app: FastifyInstance, container: Container): void {
  app.get(
    "/ajustes",
    { preHandler: container.authenticate },
    async (): Promise<ConfiguracionGimnasioDTO> => {
      const configuracion = await container.obtenerConfiguracionGimnasioUseCase.ejecutar();
      return aConfiguracionGimnasioDTO(configuracion);
    }
  );

  app.put("/ajustes", { preHandler: container.authenticate }, async (request, reply) => {
    const datos = actualizarConfiguracionSchema.parse(request.body);
    await container.actualizarConfiguracionGimnasioUseCase.ejecutar(datos);
    return reply.code(204).send();
  });
}
