import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.js";
import { NavIcon, type NombreIcono } from "./NavIcon.js";

interface EnlaceNav {
  to: string;
  etiqueta: string;
  icono: NombreIcono;
  proximamente?: boolean;
}

const ENLACES_NAV: EnlaceNav[] = [
  { to: "/home", etiqueta: "Dashboard", icono: "dashboard" },
  { to: "/alumnos", etiqueta: "Alumnos", icono: "alumnos" },
  { to: "/calendario", etiqueta: "Calendario", icono: "calendario" },
  { to: "/cuotas", etiqueta: "Cuotas", icono: "cuotas" },
];

const ENLACES_CUENTA: EnlaceNav[] = [{ to: "/ajustes", etiqueta: "Ajustes", icono: "ajustes" }];

// La tabbar móvil no tiene secciones — junta Gestión + Cuenta en una sola fila.
const ENLACES_TABBAR: EnlaceNav[] = [...ENLACES_NAV, ...ENLACES_CUENTA];

export function PanelLayout({ children, titulo }: { children: ReactNode; titulo: string }) {
  const { usuario, logout } = useAuth();
  const location = useLocation();

  const fecha = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="panel-shell">
      <aside className="panel-sidebar">
        <div className="panel-marca">
          <img src="/logo.png" alt="Fighters Gym" className="panel-marca-logo" />
        </div>

        <div className="panel-nav-titulo">Gestión</div>
        <nav className="panel-nav">
          {ENLACES_NAV.map((enlace) => (
            <EnlaceSidebar key={enlace.to} enlace={enlace} activo={location.pathname === enlace.to} />
          ))}
        </nav>

        <div className="panel-nav-titulo">Cuenta</div>
        <nav className="panel-nav">
          {ENLACES_CUENTA.map((enlace) => (
            <EnlaceSidebar key={enlace.to} enlace={enlace} activo={location.pathname === enlace.to} />
          ))}
        </nav>

        <div className="panel-usuario">
          <div className="panel-usuario-avatar">{(usuario?.nombre ?? "?").charAt(0).toUpperCase()}</div>
          <div className="panel-usuario-info">
            <div className="panel-usuario-nombre">{usuario?.nombre ?? "Cargando…"}</div>
            <div className="panel-usuario-rol">
              {usuario?.rol === "admin" ? "Administración" : "Entrenador/a"}
            </div>
          </div>
        </div>
      </aside>

      <div className="panel-principal">
        <header className="panel-topbar">
          <span className="panel-topbar-titulo display">{titulo}</span>
          <div className="panel-topbar-derecha">
            <span className="panel-topbar-fecha">{fecha}</span>
            <button type="button" className="boton-secundario" onClick={() => void logout()}>
              Salir
            </button>
          </div>
        </header>
        <main className="panel-contenido">{children}</main>
      </div>

      <nav className="panel-tabbar">
        {ENLACES_TABBAR.map((enlace) => (
          <EnlaceTabBar key={enlace.to} enlace={enlace} activo={location.pathname === enlace.to} />
        ))}
      </nav>
    </div>
  );
}

function EnlaceSidebar({ enlace, activo }: { enlace: EnlaceNav; activo: boolean }) {
  if (enlace.proximamente) {
    return (
      <span className="panel-nav-link panel-nav-link--proximamente" title="Próximamente">
        <NavIcon nombre={enlace.icono} />
        {enlace.etiqueta}
      </span>
    );
  }
  return (
    <Link to={enlace.to} className={`panel-nav-link${activo ? " panel-nav-link--activo" : ""}`}>
      <NavIcon nombre={enlace.icono} />
      {enlace.etiqueta}
    </Link>
  );
}

function EnlaceTabBar({ enlace, activo }: { enlace: EnlaceNav; activo: boolean }) {
  if (enlace.proximamente) {
    return (
      <span className="panel-tabbar-link panel-tabbar-link--proximamente" title="Próximamente">
        <NavIcon nombre={enlace.icono} />
        <span>{enlace.etiqueta}</span>
      </span>
    );
  }
  return (
    <Link to={enlace.to} className={`panel-tabbar-link${activo ? " panel-tabbar-link--activo" : ""}`}>
      <NavIcon nombre={enlace.icono} />
      <span>{enlace.etiqueta}</span>
    </Link>
  );
}
