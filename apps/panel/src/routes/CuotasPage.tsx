import { useEffect, useMemo, useState } from "react";
import type { CuotaDelMesDTO, EstadoCuota, MetodoPago } from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";
import { CuotasSkeleton } from "../components/PageSkeletons.js";

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

export function CuotasPage() {
  const { accessToken } = useAuth();
  const [cuotas, setCuotas] = useState<CuotaDelMesDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<EstadoCuota | "todos">("todos");
  const [metodoElegido, setMetodoElegido] = useState<Record<string, MetodoPago>>({});
  const [confirmando, setConfirmando] = useState<string | null>(null);

  function cargar(): void {
    if (accessToken === null) {
      return;
    }
    peticionApi<CuotaDelMesDTO[]>("/cuotas", { accessToken })
      .then(setCuotas)
      .catch(() => setError("No se han podido cargar las cuotas."));
  }

  useEffect(cargar, [accessToken]);

  const resumen = useMemo(() => {
    const base = { pagado: { total: 0, alumnos: 0 }, pendiente: { total: 0, alumnos: 0 }, atrasado: { total: 0, alumnos: 0 } };
    for (const cuota of cuotas ?? []) {
      base[cuota.estado].total += cuota.importe;
      base[cuota.estado].alumnos += 1;
    }
    return base;
  }, [cuotas]);

  const cuotasFiltradas = useMemo(() => {
    if (cuotas === null) {
      return [];
    }
    if (filtro === "todos") {
      return cuotas;
    }
    return cuotas.filter((cuota) => cuota.estado === filtro);
  }, [cuotas, filtro]);

  async function confirmarPago(cuotaId: string): Promise<void> {
    if (accessToken === null) {
      return;
    }
    const metodo = metodoElegido[cuotaId] ?? "bizum";
    setConfirmando(cuotaId);
    try {
      await peticionApi(`/cuotas/${cuotaId}/confirmar`, {
        method: "POST",
        accessToken,
        body: { metodo },
      });
      cargar();
    } catch {
      setError("No se ha podido confirmar el pago.");
    } finally {
      setConfirmando(null);
    }
  }

  return (
    <PanelLayout titulo="Cuotas">
      {error !== null && <p className="mensaje-error">{error}</p>}

      {cuotas === null ? (
        <CuotasSkeleton />
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

          <div className="lista-tarjeta">
          {cuotasFiltradas.length === 0 ? (
            <p className="lista-vacia">No hay cuotas que coincidan con este filtro.</p>
          ) : (
            cuotasFiltradas.map((cuota) => (
              <div className="fila-cuota" key={cuota.cuotaId}>
                <span className="fila-cuota-nombre">{cuota.nombreAlumno}</span>
                <span className="texto-muted">{FORMATO_EURO.format(cuota.importe)}</span>
                <span className="texto-muted">
                  {cuota.metodo !== null && cuota.fechaPago !== null
                    ? `${ETIQUETA_METODO[cuota.metodo]} · ${diaMesDeFechaIso(cuota.fechaPago)}`
                    : "—"}
                </span>
                <span className={`etiqueta-estado etiqueta-estado--${cuota.estado}`}>
                  ● {ETIQUETA_ESTADO[cuota.estado]}
                </span>
                {cuota.estado === "pagado" ? (
                  <span />
                ) : (
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
