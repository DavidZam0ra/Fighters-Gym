import { Skeleton } from "./Skeleton.js";

function FilaListaSkeleton() {
  return (
    <div className="skeleton-fila-lista">
      <Skeleton width="55%" />
      <Skeleton width="60px" height="20px" radius="999px" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <div className="tarjetas-kpi">
        {[0, 1, 2, 3].map((i) => (
          <div className="tarjeta-kpi" key={i}>
            <Skeleton width="70%" height="26px" className="skeleton-tarjeta-kpi-valor" />
            <Skeleton width="90%" height="12px" style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>

      <div className="dashboard-columnas">
        <section>
          <div className="seccion-cabecera">
            <h2 className="display">Cuotas pendientes</h2>
          </div>
          <div className="lista-tarjeta">
            {[0, 1, 2].map((i) => (
              <FilaListaSkeleton key={i} />
            ))}
          </div>
        </section>

        <section>
          <div className="seccion-cabecera">
            <h2 className="display">Horario de hoy</h2>
          </div>
          <div className="lista-tarjeta">
            {[0, 1, 2].map((i) => (
              <FilaListaSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function AlumnosSkeleton() {
  return (
    <div className="lista-tarjeta lista-tarjeta--alumnos">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div className="skeleton-fila-alumno" key={i}>
          <Skeleton width="36px" height="36px" className="skeleton-circulo" />
          <div className="skeleton-fila-alumno-info">
            <Skeleton width="45%" height="13px" />
            <Skeleton width="65%" height="11px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CuotasSkeleton() {
  return (
    <>
      <div className="tarjetas-kpi tarjetas-kpi--cuotas">
        {[0, 1, 2].map((i) => (
          <div className="tarjeta-kpi" key={i}>
            <Skeleton width="60%" height="12px" />
            <Skeleton width="80%" height="26px" className="skeleton-tarjeta-kpi-valor" />
            <Skeleton width="40%" height="12px" style={{ marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div className="lista-tarjeta">
        {[0, 1, 2, 3, 4].map((i) => (
          <FilaListaSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export function CalendarioSkeleton() {
  return (
    <div className="lista-tarjeta">
      {[0, 1, 2, 3, 4].map((i) => (
        <div className="skeleton-fila-lista" key={i}>
          <Skeleton width="60px" height="13px" />
          <Skeleton width="45%" height="26px" radius="8px" />
        </div>
      ))}
    </div>
  );
}

export function FichaAlumnoSkeleton() {
  return (
    <div className="ficha-layout">
      <div className="ficha-columna-izquierda">
        <div className="tarjeta-panel ficha-header">
          <Skeleton width="64px" height="64px" className="skeleton-circulo" />
          <Skeleton width="60%" height="18px" />
          <Skeleton width="90px" height="20px" radius="999px" />
        </div>

        <div className="tarjeta-panel">
          <div className="tarjeta-panel-titulo">Datos</div>
          {[0, 1, 2, 3].map((i) => (
            <div className="skeleton-ficha-datos-fila" key={i}>
              <Skeleton width="30%" />
              <Skeleton width="40%" />
            </div>
          ))}
        </div>
      </div>

      <div className="ficha-columna-derecha">
        <div className="tarjeta-panel">
          <div className="seccion-cabecera">
            <h2 className="display">Cuotas</h2>
          </div>
          <div className="ficha-cuotas-grid">
            {[0, 1, 2].map((i) => (
              <div className="ficha-cuota-item" key={i}>
                <Skeleton width="70%" height="12px" />
                <Skeleton width="85%" height="14px" style={{ marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="tarjeta-panel">
          <div className="seccion-cabecera">
            <h2 className="display">Asistencia este mes</h2>
          </div>
          <Skeleton width="100%" height="120px" />
        </div>
      </div>
    </div>
  );
}

export function AjustesSkeleton() {
  return (
    <div className="ajustes-layout">
      <div className="tarjeta-panel">
        <div className="tarjeta-panel-cabecera">
          <Skeleton width="40%" height="16px" />
        </div>
        <div className="campo">
          <Skeleton width="60px" height="11px" />
          <Skeleton width="100%" height="40px" style={{ marginTop: 6 }} />
        </div>
        <div className="campo">
          <Skeleton width="80px" height="11px" />
          <Skeleton width="100%" height="40px" style={{ marginTop: 6 }} />
        </div>
        <Skeleton width="140px" height="38px" style={{ marginTop: 4 }} />
      </div>

      <div className="tarjeta-panel">
        <div className="tarjeta-panel-cabecera">
          <Skeleton width="30%" height="16px" />
        </div>
        <div className="ajustes-usuario-fila">
          <Skeleton width="32px" height="32px" className="skeleton-circulo" />
          <Skeleton width="50%" height="13px" />
        </div>
      </div>
    </div>
  );
}
