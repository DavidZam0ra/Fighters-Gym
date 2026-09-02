import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.js";

export function ProtectedRoute() {
  const { accessToken, cargandoSesion } = useAuth();

  if (cargandoSesion) {
    return (
      <div className="pantalla-carga">
        <span>Cargando…</span>
      </div>
    );
  }
  if (accessToken === null) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
