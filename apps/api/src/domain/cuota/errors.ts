export class CuotaYaConfirmadaError extends Error {
  constructor(cuotaId: string) {
    super(`La cuota ${cuotaId} ya está confirmada como pagada.`);
    this.name = "CuotaYaConfirmadaError";
  }
}
