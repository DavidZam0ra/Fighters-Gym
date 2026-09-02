import { useAuth } from "../lib/AuthContext.js";
import { HelmetLogoBadge } from "../components/HelmetLogo.js";

export function HomePage() {
  const { logout } = useAuth();

  return (
    <div className="pantalla-home">
      <header className="home-cabecera">
        <div className="home-marca">
          <HelmetLogoBadge size={36} />
          <span className="display">Fighters Gym</span>
        </div>
        <button type="button" className="boton-secundario" onClick={logout}>
          Cerrar sesión
        </button>
      </header>
      <main className="home-contenido">
        <p>Sesión iniciada correctamente.</p>
        <p className="texto-muted">
          Aquí vivirá el resumen del día, alumnos, cuotas, calendario y ajustes.
        </p>
      </main>
    </div>
  );
}
