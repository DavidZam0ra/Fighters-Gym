import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FichaAlumnoDTO } from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";

const NOMBRES_MES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const ETIQUETA_ESTADO_CUOTA: Record<string, string> = {
  pagado: "Cuota al día",
  pendiente: "Cuota pendiente",
  atrasado: "Cuota atrasada",
};

const ETIQUETA_ESTADO_ASISTENCIA: Record<string, string> = {
  asistio: "Asistió",
  justificada: "Justificada",
  sin_avisar: "Sin avisar",
};

function nombreMesDePeriodo(periodo: string): string {
  const partes = periodo.split("-");
  const mes = Number(partes[1] ?? "1");
  const nombre = NOMBRES_MES[mes - 1] ?? "";
  return `${nombre} ${partes[0]}`;
}

function mesAnioDeFechaIso(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  return `${String(fecha.getUTCMonth() + 1).padStart(2, "0")}/${fecha.getUTCFullYear()}`;
}

function diaMesDeFechaIso(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  return `${String(fecha.getUTCDate()).padStart(2, "0")}/${String(fecha.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function FichaAlumnoPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [ficha, setFicha] = useState<FichaAlumnoDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  const [notasGuardadas, setNotasGuardadas] = useState(false);

  useEffect(() => {
    if (accessToken === null || id === undefined) {
      return;
    }
    peticionApi<FichaAlumnoDTO>(`/alumnos/${id}`, { accessToken })
      .then((datos) => {
        setFicha(datos);
        setNotas(datos.alumno.notas ?? "");
      })
      .catch(() => setError("No se ha podido cargar la ficha del alumno."));
  }, [accessToken, id]);

  async function guardarNotas(): Promise<void> {
    if (accessToken === null || id === undefined) {
      return;
    }
    setGuardandoNotas(true);
    setNotasGuardadas(false);
    try {
      await peticionApi(`/alumnos/${id}/notas`, {
        method: "PATCH",
        accessToken,
        body: { notas: notas.trim().length === 0 ? null : notas },
      });
      setNotasGuardadas(true);
    } catch {
      setError("No se han podido guardar las notas.");
    } finally {
      setGuardandoNotas(false);
    }
  }

  async function darDeBaja(): Promise<void> {
    if (accessToken === null || id === undefined) {
      return;
    }
    if (!window.confirm(`¿Dar de baja a ${ficha?.alumno.nombre ?? "este alumno"}?`)) {
      return;
    }
    try {
      await peticionApi(`/alumnos/${id}/baja`, { method: "POST", accessToken });
      navigate("/alumnos");
    } catch {
      setError("No se ha podido dar de baja al alumno.");
    }
  }

  if (error !== null) {
    return (
      <PanelLayout titulo="Alumno">
        <p className="mensaje-error">{error}</p>
      </PanelLayout>
    );
  }

  if (ficha === null) {
    return <PanelLayout titulo="Alumno">{null}</PanelLayout>;
  }

  const { alumno, cuotasRecientes, asistenciaDelMes } = ficha;
  const estadoActual = cuotasRecientes[0]?.estado;

  return (
    <PanelLayout titulo={`${alumno.nombre} ${alumno.apellidos}`}>
      <div className="ficha-layout">
        <div className="ficha-columna-izquierda">
          <div className="tarjeta-panel ficha-header">
            <div className="ficha-avatar-grande">
              {alumno.nombre.charAt(0).toUpperCase()}
              {alumno.apellidos.charAt(0).toUpperCase()}
            </div>
            <div className="display ficha-nombre">
              {alumno.nombre} {alumno.apellidos}
            </div>
            {estadoActual !== undefined && (
              <span className={`ficha-badge-estado ficha-badge-estado--${estadoActual}`}>
                ● {ETIQUETA_ESTADO_CUOTA[estadoActual]}
              </span>
            )}
            <a className="ficha-baja" href="#" onClick={(e) => { e.preventDefault(); void darDeBaja(); }}>
              Dar de baja
            </a>
          </div>

          <div className="tarjeta-panel">
            <div className="tarjeta-panel-titulo">Datos</div>
            <div className="ficha-datos-fila">
              <span>Teléfono</span>
              <span>{alumno.telefono}</span>
            </div>
            <div className="ficha-datos-fila">
              <span>Email</span>
              <span>{alumno.email ?? "—"}</span>
            </div>
            <div className="ficha-datos-fila">
              <span>Alta</span>
              <span>{mesAnioDeFechaIso(alumno.fechaAlta)}</span>
            </div>
            <div className="ficha-datos-fila">
              <span>Disciplinas</span>
              <span>{alumno.disciplinas.join(", ")}</span>
            </div>
          </div>

          <div className="tarjeta-panel">
            <div className="tarjeta-panel-titulo">Notas</div>
            <textarea
              className="ficha-notas-textarea"
              value={notas}
              onChange={(evento) => setNotas(evento.target.value)}
              placeholder="Sin notas todavía…"
              rows={4}
            />
            <button
              type="button"
              className="boton-secundario"
              onClick={() => void guardarNotas()}
              disabled={guardandoNotas}
            >
              {guardandoNotas ? "Guardando…" : notasGuardadas ? "Guardado ✓" : "Guardar notas"}
            </button>
          </div>
        </div>

        <div className="ficha-columna-derecha">
          <div className="tarjeta-panel">
            <div className="seccion-cabecera">
              <h2 className="display">Cuotas</h2>
              <span className="texto-muted">{alumno.cuotaMensual}€/mes</span>
            </div>
            {cuotasRecientes.length === 0 ? (
              <p className="lista-vacia">Todavía no hay cuotas registradas.</p>
            ) : (
              <div className="ficha-cuotas-grid">
                {cuotasRecientes.map((cuota) => (
                  <div className="ficha-cuota-item" key={cuota.id}>
                    <div className="texto-muted">{nombreMesDePeriodo(cuota.periodo)}</div>
                    <div className={`ficha-cuota-estado ficha-cuota-estado--${cuota.estado}`}>
                      {ETIQUETA_ESTADO_CUOTA[cuota.estado]}
                      {cuota.fechaPago !== null ? ` · ${diaMesDeFechaIso(cuota.fechaPago)}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tarjeta-panel">
            <div className="seccion-cabecera">
              <h2 className="display">Asistencia este mes</h2>
              <span className="texto-muted">{asistenciaDelMes.length} clases registradas</span>
            </div>
            {asistenciaDelMes.length === 0 ? (
              <p className="lista-vacia">Sin asistencia registrada este mes.</p>
            ) : (
              <>
                <div className="asistencia-grid">
                  {asistenciaDelMes.map((asistencia) => (
                    <div
                      key={asistencia.id}
                      className={`asistencia-dia asistencia-dia--${asistencia.estado}`}
                      title={`${new Date(asistencia.fecha).getUTCDate()} — ${ETIQUETA_ESTADO_ASISTENCIA[asistencia.estado]}`}
                    >
                      {new Date(asistencia.fecha).getUTCDate()}
                    </div>
                  ))}
                </div>
                <div className="asistencia-leyenda">
                  <span>
                    <i className="asistencia-punto asistencia-punto--asistio" />
                    Asistió
                  </span>
                  <span>
                    <i className="asistencia-punto asistencia-punto--justificada" />
                    Justificada
                  </span>
                  <span>
                    <i className="asistencia-punto asistencia-punto--sin_avisar" />
                    Sin avisar
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
