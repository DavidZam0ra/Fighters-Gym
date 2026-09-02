const API_URL: string = import.meta.env["VITE_API_URL"] ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface PeticionOptions {
  method?: string;
  body?: unknown;
}

export async function peticionApi<T>(ruta: string, opciones: PeticionOptions = {}): Promise<T> {
  const init: RequestInit = {
    method: opciones.method ?? "GET",
    // Necesario para que la cookie httpOnly del refresh token viaje en
    // /auth/login y /auth/refresh — el panel y el API son orígenes distintos.
    credentials: "include",
  };
  // Solo mandamos Content-Type/body cuando hay cuerpo de verdad — Fastify
  // rechaza con error un application/json con cuerpo vacío (p. ej. en
  // /auth/refresh, que no lleva body).
  if (opciones.body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(opciones.body);
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, init);

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({ error: respuesta.statusText }));
    throw new ApiError(
      typeof cuerpo["error"] === "string" ? cuerpo["error"] : "Error de red.",
      respuesta.status
    );
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }
  return (await respuesta.json()) as T;
}
