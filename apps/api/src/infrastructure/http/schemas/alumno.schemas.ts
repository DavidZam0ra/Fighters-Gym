import { z } from "zod";
import { DISCIPLINAS } from "../../../domain/alumno/Disciplina.js";

export const crearAlumnoSchema = z.object({
  nombre: z.string().min(1),
  apellidos: z.string().min(1),
  telefono: z.string().min(1),
  email: z.string().email().nullable(),
  dniNie: z.string().min(1),
  fechaNacimiento: z.string().min(1),
  cuotaMensual: z.number().positive(),
  disciplinas: z.array(z.enum(DISCIPLINAS)).min(1),
});
