export type NombreIcono = "dashboard" | "alumnos" | "calendario" | "cuotas" | "ajustes";

const PROPS_SVG = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
} as const;

export function NavIcon({ nombre }: { nombre: NombreIcono }) {
  switch (nombre) {
    case "dashboard":
      return (
        <svg {...PROPS_SVG} aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" />
          <rect x="13" y="3" width="8" height="8" />
          <rect x="3" y="13" width="8" height="8" />
          <rect x="13" y="13" width="8" height="8" />
        </svg>
      );
    case "alumnos":
      return (
        <svg {...PROPS_SVG} aria-hidden="true">
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" />
          <circle cx="17" cy="8.5" r="2.6" />
          <path d="M15 14.2c2.4.4 4 2.4 4 5.8" />
        </svg>
      );
    case "calendario":
      return (
        <svg {...PROPS_SVG} aria-hidden="true">
          <rect x="3" y="4" width="18" height="17" />
          <path d="M3 9h18" />
          <path d="M8 2v4M16 2v4" />
        </svg>
      );
    case "cuotas":
      return (
        <svg {...PROPS_SVG} aria-hidden="true">
          <rect x="2" y="6" width="20" height="13" />
          <path d="M2 10h20" />
        </svg>
      );
    case "ajustes":
      return (
        <svg {...PROPS_SVG} aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10c.1.7.6 1.2 1.3 1.4H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.1z" />
        </svg>
      );
  }
}
