import type { CuotaDelMesDTO } from "@fighters-gym/shared-types";
import type { CuotaDelMes } from "../../../application/use-cases/cuota/ListarCuotasDelMesUseCase.js";

export function aCuotaDelMesDTO(cuota: CuotaDelMes): CuotaDelMesDTO {
  return {
    cuotaId: cuota.cuotaId,
    alumnoId: cuota.alumnoId,
    nombreAlumno: cuota.nombreAlumno,
    importe: cuota.importe,
    metodo: cuota.metodo,
    fechaPago: cuota.fechaPago?.toISOString() ?? null,
    estado: cuota.estado,
  };
}
