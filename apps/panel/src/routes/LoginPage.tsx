import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.js";
import { ApiError } from "../lib/apiClient.js";
import { HelmetLogoBadge } from "../components/HelmetLogo.js";

export function LoginPage() {
  const { accessToken, cargandoSesion, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!cargandoSesion && accessToken !== null) {
    return <Navigate to="/home" replace />;
  }

  async function manejarSubmit(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(email, password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla-login">
      <div className="login-glow" aria-hidden="true" />
      <div className="login-contenido">
        <HelmetLogoBadge />
        <span className="display login-titulo">Fighters Gym</span>
        <span className="login-subtitulo">Panel de gestión</span>

        <form className="login-tarjeta" onSubmit={(evento) => void manejarSubmit(evento)}>
          <label htmlFor="email">Usuario o email</label>
          <input
            id="email"
            type="email"
            placeholder="rafa@fightersgym.vlc"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            autoComplete="current-password"
            required
          />

          {error !== null && <p className="login-error">{error}</p>}

          <button type="submit" className="boton-primario" disabled={enviando}>
            {enviando ? "Accediendo…" : "Acceder"}
          </button>
        </form>

        <p className="login-nota">
          Acceso exclusivo para administración y entrenadores.
          <br />
          Los datos de alumnos no son públicos.
        </p>
      </div>
    </div>
  );
}
