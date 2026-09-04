import type { FastifyInstance } from "fastify";
import type { CuotaDelMesDTO } from "@fighters-gym/shared-types";
import { confirmarPagoSchema } from "../schemas/cuota.schemas.js";
import { idParamSchema } from "../schemas/common.schemas.js";
import { aCuotaDelMesDTO } from "../mappers/cuota.mapper.js";
import { CuotaNoEncontradaError } from "../../../application/use-cases/cuota/ConfirmarPagoUseCase.js";
import { CuotaYaConfirmadaError } from "../../../domain/cuota/errors.js";
import type { Container } from "../../../composition-root/container.js";

export function registrarRutasCuotas(app: FastifyInstance, container: Container): void {
  app.get(
    "/cuotas",
    { preHandler: container.authenticate },
    async (): Promise<CuotaDelMesDTO[]> => {
      const cuotas = await container.listarCuotasDelMesUseCase.ejecutar();
      return cuotas.map(aCuotaDelMesDTO);
    }
  );

  app.post("/cuotas/:id/confirmar", { preHandler: container.authenticate }, async (request, reply) => {
    if (request.usuarioId === undefined) {
      return reply.code(401).send({ error: "No autenticado." });
    }
    const { id } = idParamSchema.parse(request.params);
    const { metodo } = confirmarPagoSchema.parse(request.body);

    try {
      await container.confirmarPagoUseCase.ejecutar({
        cuotaId: id,
        usuarioId: request.usuarioId,
        metodo,
      });
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof CuotaNoEncontradaError) {
        return reply.code(404).send({ error: error.message });
      }
      if (error instanceof CuotaYaConfirmadaError) {
        // 409 Conflict, no 500: dos clics seguidos (o dos pestañas) sobre la
        // misma cuota no son un fallo del servidor, es un estado que ya
        // cambió por debajo — el cliente debe poder distinguirlo y refrescar.
        return reply.code(409).send({ error: error.message });
      }
      throw error;
    }
  });
}
