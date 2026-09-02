import type { FastifyInstance } from "fastify";
import type { AlumnoDTO } from "@fighters-gym/shared-types";
import { crearAlumnoSchema } from "../schemas/alumno.schemas.js";
import { idParamSchema } from "../schemas/common.schemas.js";
import { aAlumnoDTO, aFichaAlumnoDTO } from "../mappers/alumno.mapper.js";
import { AlumnoNoEncontradoError } from "../../../application/use-cases/alumno/DarDeBajaAlumnoUseCase.js";
import type { Container } from "../../../composition-root/container.js";

export function registrarRutasAlumnos(app: FastifyInstance, container: Container): void {
  app.get("/alumnos", { preHandler: container.authenticate }, async (): Promise<AlumnoDTO[]> => {
    const alumnos = await container.listarAlumnosUseCase.ejecutar();
    return alumnos.map(aAlumnoDTO);
  });

  app.post("/alumnos", { preHandler: container.authenticate }, async (request, reply) => {
    const datos = crearAlumnoSchema.parse(request.body);
    const alumno = await container.crearAlumnoUseCase.ejecutar({
      ...datos,
      fechaNacimiento: new Date(datos.fechaNacimiento),
    });
    return reply.code(201).send(aAlumnoDTO(alumno));
  });

  app.get("/alumnos/:id", { preHandler: container.authenticate }, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    try {
      const ficha = await container.obtenerFichaAlumnoUseCase.ejecutar(id, container.clock.now());
      return aFichaAlumnoDTO(ficha, container.clock.now());
    } catch (error) {
      if (error instanceof AlumnoNoEncontradoError) {
        return reply.code(404).send({ error: error.message });
      }
      throw error;
    }
  });

  app.post("/alumnos/:id/baja", { preHandler: container.authenticate }, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    try {
      await container.darDeBajaAlumnoUseCase.ejecutar(id);
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof AlumnoNoEncontradoError) {
        return reply.code(404).send({ error: error.message });
      }
      throw error;
    }
  });
}
