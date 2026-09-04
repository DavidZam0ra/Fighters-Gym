import { useState } from "react";

const API_DICEBEAR = "https://api.dicebear.com/9.x/adventurer/svg";

function iniciales(seed: string): string {
  const palabras = seed.trim().split(/\s+/);
  return palabras
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
}

/** Avatar determinista por alumno (mismo seed = mismo personaje siempre) —
 * dirección confirmada para la app real, no las iniciales que se usaban antes.
 * Si la petición a DiceBear falla (red del móvil, timeout, etc.) cae a un
 * círculo con las iniciales del seed en vez del icono de imagen rota. */
export function AlumnoAvatar({ seed, size = 36 }: { seed: string; size?: number }) {
  const [fallo, setFallo] = useState(false);
  const url = `${API_DICEBEAR}?seed=${encodeURIComponent(seed)}`;

  if (fallo) {
    return (
      <div
        className="alumno-avatar alumno-avatar--fallback"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {iniciales(seed)}
      </div>
    );
  }

  return (
    <img
      src={url}
      width={size}
      height={size}
      alt=""
      className="alumno-avatar"
      style={{ width: size, height: size }}
      onError={() => setFallo(true)}
    />
  );
}
