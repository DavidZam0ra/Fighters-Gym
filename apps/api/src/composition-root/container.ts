import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../infrastructure/adapters/db/prisma/client.js";
import { PrismaAlumnoRepository } from "../infrastructure/adapters/db/PrismaAlumnoRepository.js";
import { PrismaCuotaRepository } from "../infrastructure/adapters/db/PrismaCuotaRepository.js";
import { PrismaAsistenciaRepository } from "../infrastructure/adapters/db/PrismaAsistenciaRepository.js";
import { PrismaUsuarioRepository } from "../infrastructure/adapters/db/PrismaUsuarioRepository.js";
import { PrismaClaseRepository } from "../infrastructure/adapters/db/PrismaClaseRepository.js";
import { BcryptPasswordHasher } from "../infrastructure/adapters/auth/BcryptPasswordHasher.js";
import { JwtTokenService } from "../infrastructure/adapters/auth/JwtTokenService.js";
import { SystemClock } from "../infrastructure/adapters/clock/SystemClock.js";
import { crearAuthenticate } from "../infrastructure/http/middleware/authenticate.js";
import type { Clock } from "../application/ports/out/Clock.js";
import { LoginUseCase } from "../application/use-cases/auth/LoginUseCase.js";
import { RefrescarTokenUseCase } from "../application/use-cases/auth/RefrescarTokenUseCase.js";
import { CrearAlumnoUseCase } from "../application/use-cases/alumno/CrearAlumnoUseCase.js";
import { ListarAlumnosUseCase } from "../application/use-cases/alumno/ListarAlumnosUseCase.js";
import { ObtenerFichaAlumnoUseCase } from "../application/use-cases/alumno/ObtenerFichaAlumnoUseCase.js";
import { DarDeBajaAlumnoUseCase } from "../application/use-cases/alumno/DarDeBajaAlumnoUseCase.js";
import { ObtenerUsuarioActualUseCase } from "../application/use-cases/auth/ObtenerUsuarioActualUseCase.js";
import { ObtenerResumenDashboardUseCase } from "../application/use-cases/dashboard/ObtenerResumenDashboardUseCase.js";

export interface EnvConfig {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
}

/**
 * Forma explícita (no `ReturnType<typeof crearContainer>`) a propósito: así
 * las rutas dependen de esta interfaz, no de la construcción concreta con
 * Prisma, y los tests de rutas pueden montar un Container con fakes sin
 * tocar la base de datos real.
 */
export interface Container {
  clock: Clock;
  authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  loginUseCase: LoginUseCase;
  refrescarTokenUseCase: RefrescarTokenUseCase;
  crearAlumnoUseCase: CrearAlumnoUseCase;
  listarAlumnosUseCase: ListarAlumnosUseCase;
  obtenerFichaAlumnoUseCase: ObtenerFichaAlumnoUseCase;
  darDeBajaAlumnoUseCase: DarDeBajaAlumnoUseCase;
  obtenerUsuarioActualUseCase: ObtenerUsuarioActualUseCase;
  obtenerResumenDashboardUseCase: ObtenerResumenDashboardUseCase;
}

export function crearContainer(env: EnvConfig): Container {
  const alumnoRepository = new PrismaAlumnoRepository(prisma);
  const cuotaRepository = new PrismaCuotaRepository(prisma);
  const asistenciaRepository = new PrismaAsistenciaRepository(prisma);
  const usuarioRepository = new PrismaUsuarioRepository(prisma);
  const claseRepository = new PrismaClaseRepository(prisma);

  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService({
    accessSecret: env.jwtAccessSecret,
    refreshSecret: env.jwtRefreshSecret,
  });
  const clock = new SystemClock();

  return {
    clock,
    authenticate: crearAuthenticate(tokenService),
    loginUseCase: new LoginUseCase(usuarioRepository, passwordHasher, tokenService),
    refrescarTokenUseCase: new RefrescarTokenUseCase(tokenService),
    crearAlumnoUseCase: new CrearAlumnoUseCase(alumnoRepository, clock),
    listarAlumnosUseCase: new ListarAlumnosUseCase(alumnoRepository),
    obtenerFichaAlumnoUseCase: new ObtenerFichaAlumnoUseCase(
      alumnoRepository,
      cuotaRepository,
      asistenciaRepository
    ),
    darDeBajaAlumnoUseCase: new DarDeBajaAlumnoUseCase(alumnoRepository),
    obtenerUsuarioActualUseCase: new ObtenerUsuarioActualUseCase(usuarioRepository),
    obtenerResumenDashboardUseCase: new ObtenerResumenDashboardUseCase(
      alumnoRepository,
      cuotaRepository,
      claseRepository,
      clock
    ),
  };
}
