import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { AlumnoDTO, CuotaDelMesDTO, EstadoCuota, MetodoPago } from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { ApiError, peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";
import { AlumnoAvatar } from "../components/AlumnoAvatar.js";
import { AlumnosSkeleton } from "../components/PageSkeletons.js";
import { etiquetaDisciplina } from "../lib/disciplinas.js";

const FORMATO_EURO = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

const ETIQUETA_ESTADO: Record<EstadoCuota, string> = {
  pagado: "Pagado",
  pendiente: "Pendiente",
  atrasado: "Atrasada",
};

const ETIQUETA_METODO: Record<MetodoPago, string> = {
  bizum: "Bizum",
  transferencia: "Transferencia",
  efectivo: "Efectivo",
};

const FILTROS: Array<{ valor: EstadoCuota | "todos"; etiqueta: string }> = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "pagado", etiqueta: "Pagado" },
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "atrasado", etiqueta: "Atrasado" },
];

function diaMesDeFechaIso(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  return `${String(fecha.getUTCDate()).padStart(2, "0")}/${String(fecha.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function AlumnosPage() {
  const { accessToken } = useAuth();
  const [alumnos, setAlumnos] = useState<AlumnoDTO[] | null>(null);
  const [cuotas, setCuotas] = useState<CuotaDelMesDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<EstadoCuota | "todos">("todos");
  const [metodoElegido, setMetodoElegido] = useState<Record<string, MetodoPago>>({});
  const [confirmando, setConfirmando] = useState<string | null>(null);

  async function cargar(): Promise<void> {
    if (accessToken === null) {
      return;
    }
    try {
      const [alumnosDatos, cuotasDatos] = await Promise.all([
        peticionApi<AlumnoDTO[]>("/alumnos", { accessToken }),
        peticionApi<CuotaDelMesDTO[]>("/cuotas", { accessToken }),
      ]);
      setAlumnos(alumnosDatos);
      setCuotas(cuotasDatos);
    } catch {
      setError("No se han podido cargar los alumnos.");
    }
  }

  useEffect(() => {
    void cargar();
  }, [accessToken]);

  // Una cuota del mes por alumno — RegistrarCuotasDelMesUseCase (detrás de
  // GET /cuotas) garantiza que todo alumno activo tiene una fila para el
  // periodo actual, así que en la práctica esto casi nunca falta.
  const cuotaPorAlumno = useMemo(() => {
    const mapa = new Map<string, CuotaDelMesDTO>();
    for (const cuota of cuotas ?? []) {
      mapa.set(cuota.alumnoId, cuota);
    }
    return mapa;
  }, [cuotas]);

  const resumen = useMemo(() => {
    const base = {
      pagado: { total: 0, alumnos: 0 },
      pendiente: { total: 0, alumnos: 0 },
      atrasado: { total: 0, alumnos: 0 },
    };
    for (const cuota of cuotas ?? []) {
      base[cuota.estado].total += cuota.importe;
      base[cuota.estado].alumnos += 1;
    }
    return base;
  }, [cuotas]);

  const filas = useMemo(() => {
    if (alumnos === null) {
      return [];
    }
    const termino = busqueda.trim().toLowerCase();
    return alumnos
      .filter(
        (alumno) => termino.length === 0 || `${alumno.nombre} ${alumno.apellidos}`.toLowerCase().includes(termino)
      )
      .map((alumno) => ({ alumno, cuota: cuotaPorAlumno.get(alumno.id) }))
      .filter(({ cuota }) => filtro === "todos" || cuota?.estado === filtro);
  }, [alumnos, cuotaPorAlumno, busqueda, filtro]);

  async function confirmarPago(cuotaId: string): Promise<void> {
    if (accessToken === null) {
      return;
    }
    const metodo = metodoElegido[cuotaId] ?? "bizum";
    setError(null);
    setConfirmando(cuotaId);
    try {
      await peticionApi(`/cuotas/${cuotaId}/confirmar`, {
        method: "POST",
        accessToken,
        body: { metodo },
      });
      // Se espera a que la lista se recargue de verdad antes de reactivar el
      // botón — si no, un segundo clic durante la ventana en la que ya está
      // confirmada en el servidor pero la pantalla no se ha enterado
      // todavía dispara una doble confirmación.
      await cargar();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Esta cuota ya estaba confirmada.");
        await cargar();
      } else {
        setError("No se ha podido confirmar el pago.");
      }
    } finally {
      setConfirmando(null);
    }
  }

  const cargando = alumnos === null || cuotas === null;

  return (
    <PanelLayout titulo="Alumnos">
      {error !== null && <p className="mensaje-error">{error}</p>}

      {cargando ? (
        <AlumnosSkeleton />
      ) : (
        <>
          <div className="tarjetas-kpi tarjetas-kpi--cuotas">
            <div className="tarjeta-kpi">
              <div className="tarjeta-kpi-etiqueta">Cobrado</div>
              <div className="tarjeta-kpi-valor display" style={{ color: "var(--color-exito)" }}>
                {FORMATO_EURO.format(resumen.pagado.total)}
              </div>
              <div className="texto-muted">{resumen.pagado.alumnos} alumnos</div>
            </div>
            <div className="tarjeta-kpi">
              <div className="tarjeta-kpi-etiqueta">Pendiente</div>
              <div className="tarjeta-kpi-valor display" style={{ color: "var(--color-aviso)" }}>
                {FORMATO_EURO.format(resumen.pendiente.total)}
              </div>
              <div className="texto-muted">{resumen.pendiente.alumnos} alumnos</div>
            </div>
            <div className="tarjeta-kpi">
              <div className="tarjeta-kpi-etiqueta">Atrasado</div>
              <div className="tarjeta-kpi-valor display" style={{ color: "var(--color-error)" }}>
                {FORMATO_EURO.format(resumen.atrasado.total)}
              </div>
              <div className="texto-muted">{resumen.atrasado.alumnos} alumnos</div>
            </div>
          </div>

          <div className="alumnos-cabecera-acciones">
            <input
              type="search"
              className="campo-busqueda"
              placeholder="Buscar por nombre…"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
            <div className="filtro-pills">
              {FILTROS.map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  className={`filtro-pill${filtro === opcion.valor ? " filtro-pill--activo" : ""}`}
                  onClick={() => setFiltro(opcion.valor)}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>
            <Link to="/alumnos/nuevo" className="boton-primario boton-primario--compacto boton-nuevo-alumno">
              + Nuevo alumno
            </Link>
          </div>

          <div className="lista-tarjeta lista-tarjeta--alumnos">
            {filas.length === 0 ? (
              <p className="lista-vacia">No hay alumnos que coincidan con la búsqueda.</p>
            ) : (
              filas.map(({ alumno, cuota }) => (
                <div className="fila-alumno-cuota" key={alumno.id}>
                  <Link to={`/alumnos/${alumno.id}`} className="fila-alumno-cuota-info">
                    <AlumnoAvatar seed={alumno.avatarSeed} size={36} />
                    <div className="fila-alumno-info">
                      <span className="fila-alumno-nombre">
                        {alumno.nombre} {alumno.apellidos}
                      </span>
                      <span className="texto-muted">
                        {alumno.disciplinas.map(etiquetaDisciplina).join(", ")}
                      </span>
                    </div>
                  </Link>

                  <div className="fila-alumno-cuota-detalle">
                    <span className="texto-muted">{FORMATO_EURO.format(alumno.cuotaMensual)}</span>
                    <span className="texto-muted">
                      {cuota?.metodo != null && cuota.fechaPago !== null
                        ? `${ETIQUETA_METODO[cuota.metodo]} · ${diaMesDeFechaIso(cuota.fechaPago)}`
                        : "—"}
                    </span>
                    {cuota !== undefined && (
                      <span className={`etiqueta-estado etiqueta-estado--${cuota.estado}`}>
                        ● {ETIQUETA_ESTADO[cuota.estado]}
                      </span>
                    )}
                  </div>

                  {cuota !== undefined && cuota.estado !== "pagado" && (
                    <div className="fila-cuota-accion">
                      <select
                        className="selector-metodo"
                        value={metodoElegido[cuota.cuotaId] ?? "bizum"}
                        onChange={(evento) =>
                          setMetodoElegido((actual) => ({
                            ...actual,
                            [cuota.cuotaId]: evento.target.value as MetodoPago,
                          }))
                        }
                      >
                        <option value="bizum">Bizum</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="efectivo">Efectivo</option>
                      </select>
                      <button
                        type="button"
                        className="boton-primario boton-primario--compacto"
                        disabled={confirmando === cuota.cuotaId}
                        onClick={() => void confirmarPago(cuota.cuotaId)}
                      >
                        {confirmando === cuota.cuotaId ? "…" : "Confirmar"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </PanelLayout>
  );
}
