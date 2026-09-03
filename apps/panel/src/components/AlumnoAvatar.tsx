const API_DICEBEAR = "https://api.dicebear.com/9.x/adventurer/svg";

/** Avatar determinista por alumno (mismo seed = mismo personaje siempre) —
 * dirección confirmada para la app real, no las iniciales que se usaban antes. */
export function AlumnoAvatar({ seed, size = 36 }: { seed: string; size?: number }) {
  const url = `${API_DICEBEAR}?seed=${encodeURIComponent(seed)}`;
  return (
    <img
      src={url}
      width={size}
      height={size}
      alt=""
      className="alumno-avatar"
      style={{ width: size, height: size }}
    />
  );
}
