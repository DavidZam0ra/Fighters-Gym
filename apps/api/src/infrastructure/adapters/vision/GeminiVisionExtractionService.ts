import { DISCIPLINAS } from "../../../domain/alumno/Disciplina.js";
import {
  VisionExtractionError,
  type VisionExtractionService,
  type DatosAlumnoExtraidos,
} from "../../../application/ports/out/VisionExtractionService.js";

const MODELO = "gemini-3.6-flash";
const REINTENTOS_MAX = 3;
const ESPERA_ENTRE_REINTENTOS_MS = 2000;

const PROMPT = `Eres un asistente que lee fichas de inscripción en papel de un gimnasio de boxeo/artes marciales español, muchas veces manuscritas. Extrae los datos del alumno de la imagen.

Para cada campo, marca "confianza": "baja" si la letra es difícil de leer, el dato es ambiguo, o no estás seguro — y "alta" si está claro. Ante la duda, usa "baja": es mejor pedirle a la persona que lo revise que dar un dato inventado por bueno.

Si no encuentras algún dato en la imagen, usa una cadena vacía "" como valor (o un array vacío para disciplinas) y marca confianza "baja".

Para "disciplinas", usa SOLO estos valores (pueden marcarse varias casillas en la ficha): ${DISCIPLINAS.join(", ")}.
- boxeo_infantil / krav_maga_infantil son las versiones para niños de boxeo y krav maga.
- competicion es el grupo de preparación para competir.

Para "fechaNacimiento", devuelve el valor en formato ISO YYYY-MM-DD si puedes deducir el año completo (asume el siglo correcto para una fecha de nacimiento realista); si no, cadena vacía.`;

const CAMPO_TEXTO = {
  type: "object",
  properties: {
    valor: { type: "string" },
    confianza: { type: "string", enum: ["alta", "baja"] },
  },
  required: ["valor", "confianza"],
} as const;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    nombre: CAMPO_TEXTO,
    apellidos: CAMPO_TEXTO,
    telefono: CAMPO_TEXTO,
    email: CAMPO_TEXTO,
    dniNie: CAMPO_TEXTO,
    fechaNacimiento: CAMPO_TEXTO,
    disciplinas: {
      type: "object",
      properties: {
        valor: { type: "array", items: { type: "string", enum: [...DISCIPLINAS] } },
        confianza: { type: "string", enum: ["alta", "baja"] },
      },
      required: ["valor", "confianza"],
    },
  },
  required: ["nombre", "apellidos", "telefono", "email", "dniNie", "fechaNacimiento", "disciplinas"],
} as const;

interface CampoTextoBruto {
  valor: string;
  confianza: "alta" | "baja";
}

interface RespuestaGemini {
  nombre: CampoTextoBruto;
  apellidos: CampoTextoBruto;
  telefono: CampoTextoBruto;
  email: CampoTextoBruto;
  dniNie: CampoTextoBruto;
  fechaNacimiento: CampoTextoBruto;
  disciplinas: { valor: string[]; confianza: "alta" | "baja" };
}

export class GeminiVisionExtractionService implements VisionExtractionService {
  constructor(private readonly apiKey: string) {}

  async extraerDatosAlumno(imagen: Buffer): Promise<DatosAlumnoExtraidos> {
    const cuerpo = await this.llamarConReintentos(imagen);
    return {
      nombre: cuerpo.nombre,
      apellidos: cuerpo.apellidos,
      telefono: cuerpo.telefono,
      email: {
        valor: cuerpo.email.valor.trim().length === 0 ? null : cuerpo.email.valor.trim(),
        confianza: cuerpo.email.confianza,
      },
      dniNie: cuerpo.dniNie,
      fechaNacimiento: cuerpo.fechaNacimiento,
      disciplinas: cuerpo.disciplinas,
    };
  }

  private async llamarConReintentos(imagen: Buffer, intento = 0): Promise<RespuestaGemini> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${this.apiKey}`;
    const respuesta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: tipoMime(imagen), data: imagen.toString("base64") } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });

    if (!respuesta.ok) {
      if (respuesta.status === 503 && intento < REINTENTOS_MAX) {
        await new Promise((r) => setTimeout(r, ESPERA_ENTRE_REINTENTOS_MS));
        return this.llamarConReintentos(imagen, intento + 1);
      }
      const detalle = await respuesta.text().catch(() => "");
      throw new VisionExtractionError(`Gemini devolvió ${respuesta.status}: ${detalle}`);
    }

    const cuerpo = (await respuesta.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const texto = cuerpo.candidates?.[0]?.content?.parts?.[0]?.text;
    if (texto === undefined) {
      throw new VisionExtractionError("Gemini no devolvió contenido interpretable.");
    }

    try {
      return JSON.parse(texto) as RespuestaGemini;
    } catch {
      throw new VisionExtractionError("La respuesta de Gemini no es un JSON válido.");
    }
  }
}

function tipoMime(imagen: Buffer): string {
  if (imagen[0] === 0xff && imagen[1] === 0xd8) {
    return "image/jpeg";
  }
  if (imagen[0] === 0x89 && imagen[1] === 0x50 && imagen[2] === 0x4e && imagen[3] === 0x47) {
    return "image/png";
  }
  if (imagen.subarray(0, 4).toString("ascii") === "RIFF" && imagen.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  return "image/jpeg";
}
