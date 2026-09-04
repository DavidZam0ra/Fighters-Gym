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
  accessToken?: string;
}

export async function peticionApi<T>(ruta: string, opciones: PeticionOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opciones.accessToken !== undefined) {
    headers["Authorization"] = `Bearer ${opciones.accessToken}`;
  }

  const init: RequestInit = {
    method: opciones.method ?? "GET",
  };
  // Solo mandamos Content-Type/body cuando hay cuerpo de verdad — Fastify
  // rechaza con error un application/json con cuerpo vacío.
  if (opciones.body instanceof FormData) {
    // Sin Content-Type manual: el navegador añade el boundary correcto solo.
    init.body = opciones.body;
  } else if (opciones.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opciones.body);
  }
  if (Object.keys(headers).length > 0) {
    init.headers = headers;
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
