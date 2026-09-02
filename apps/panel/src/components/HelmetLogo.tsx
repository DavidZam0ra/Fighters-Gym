interface HelmetLogoBadgeProps {
  size?: number;
}

/** El emblema real aprobado del diseño (Login.dc.html) — casco espartano en medallón. */
export function HelmetLogoBadge({ size = 56 }: HelmetLogoBadgeProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="#3a383c" />
      <g fill="#0a0a0b">
        <polygon points="44,46 26,38 30,50 46,54" />
        <polygon points="42,52 18,50 24,62 44,60" />
        <polygon points="40,58 14,64 22,74 42,66" />
        <polygon points="76,46 94,38 90,50 74,54" />
        <polygon points="78,52 102,50 96,62 76,60" />
        <polygon points="80,58 106,64 98,74 78,66" />
      </g>
      <path
        d="M60,24 C73,24 82,33 82,46 L79,66 L67,83 L60,73 L53,83 L41,66 L38,46 C38,33 47,24 60,24 Z"
        fill="#0a0a0b"
      />
      <rect x="47" y="49" width="26" height="6" fill="#3a383c" />
      <rect x="57" y="49" width="6" height="30" fill="#3a383c" />
    </svg>
  );
}
