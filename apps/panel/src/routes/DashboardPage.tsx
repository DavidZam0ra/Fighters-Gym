import { useEffect, useState } from "react";
import type { ResumenDashboardDTO } from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";
import { DashboardSkeleton } from "../components/PageSkeletons.js";

const FORMATO_EURO = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function DashboardPage() {
  const { accessToken } = useAuth();
  const [resumen, setResumen] = useState<ResumenDashboardDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken === null) {
      return;
    }
    peticionApi<ResumenDashboardDTO>("/dashboard/resumen", { accessToken })
      .then(setResumen)
      .catch(() => setError("No se ha podido cargar el resumen."));
  }, [accessToken]);

  return (
    <PanelLayout titulo="Dashboard">
      {error !== null && <p className="mensaje-error">{error}</p>}

      {resumen === null ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="tarjetas-kpi">
            <TarjetaKpi valor={String(resumen.alumnosActivos)} etiqueta="Alumnos activos" />
            <TarjetaKpi
              valor={String(resumen.cuotasPendientes)}
              etiqueta="Cuotas pendientes"
              color="var(--color-aviso)"
            />
            <TarjetaKpi valor={String(resumen.clasesHoy)} etiqueta="Clases hoy" color="var(--color-info)" />
            <TarjetaKpi
              valor={FORMATO_EURO.format(resumen.cobradoEsteMes)}
              etiqueta="Cobrado este mes"
              color="var(--color-exito)"
            />
          </div>

          <div className="dashboard-columnas">
            <section>
              <div className="seccion-cabecera">
                <h2 className="display">Cuotas pendientes</h2>
              </div>
              <div className="lista-tarjeta">
                {resumen.cuotasAtrasadas.length === 0 ? (
                  <p className="lista-vacia">Todo al día — no hay cuotas pendientes.</p>
                ) : (
                  resumen.cuotasAtrasadas.map((cuota) => (
                    <div className="fila-lista" key={cuota.alumnoId}>
                      <span className="fila-lista-titulo">{cuota.nombreAlumno}</span>
                      <span className={`etiqueta-estado etiqueta-estado--${cuota.estado}`}>
                        {cuota.estado === "atrasado" ? "Atrasada" : "Pendiente"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="seccion-cabecera">
                <h2 className="display">Horario de hoy</h2>
              </div>
              <div className="lista-tarjeta">
                {resumen.horarioHoy.length === 0 ? (
                  <p className="lista-vacia">No hay clases programadas hoy.</p>
                ) : (
                  resumen.horarioHoy.map((clase) => (
                    <div className="fila-lista" key={clase.id}>
                      <span className="fila-lista-titulo">{clase.nombre}</span>
                      <span className="texto-muted">{clase.horaInicio}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </PanelLayout>
  );
}

function TarjetaKpi({ valor, etiqueta, color }: { valor: string; etiqueta: string; color?: string }) {
  return (
    <div className="tarjeta-kpi">
      <div className="tarjeta-kpi-valor display" style={color !== undefined ? { color } : undefined}>
        {valor}
      </div>
      <div className="tarjeta-kpi-etiqueta">{etiqueta}</div>
    </div>
  );
}
