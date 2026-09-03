import type { FastifyInstance } from "fastify";
import type { ResumenDashboardDTO } from "@fighters-gym/shared-types";
import type { Container } from "../../../composition-root/container.js";

export function registrarRutasDashboard(app: FastifyInstance, container: Container): void {
  app.get(
    "/dashboard/resumen",
    { preHandler: container.authenticate },
    async (): Promise<ResumenDashboardDTO> => {
      return container.obtenerResumenDashboardUseCase.ejecutar();
    }
  );
}
