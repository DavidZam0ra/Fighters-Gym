import { useEffect, useState } from "react";
import type { ClaseDTO, DiaSemana } from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";
import { CalendarioSkeleton } from "../components/PageSkeletons.js";

const DIAS: Array<{ valor: DiaSemana; etiqueta: string; etiquetaCorta: string }> = [
  { valor: "lunes", etiqueta: "Lunes", etiquetaCorta: "Lun" },
  { valor: "martes", etiqueta: "Martes", etiquetaCorta: "Mar" },
  { valor: "miercoles", etiqueta: "Miércoles", etiquetaCorta: "Mié" },
  { valor: "jueves", etiqueta: "Jueves", etiquetaCorta: "Jue" },
  { valor: "viernes", etiqueta: "Viernes", etiquetaCorta: "Vie" },
];

const DIA_DE_HOY: DiaSemana | null = (() => {
  const mapa: Record<number, DiaSemana | null> = {
    0: null,
    1: "lunes",
    2: "martes",
    3: "miercoles",
    4: "jueves",
    5: "viernes",
    6: null,
  };
  return mapa[new Date().getDay()] ?? null;
})();

function colorClase(clase: ClaseDTO): string {
  if (clase.esInfantil) {
    return clase.disciplina === "krav_maga_infantil" ? "clase-bloque--krav-inf" : "clase-bloque--infantil";
  }
  if (clase.disciplina === "krav_maga") return "clase-bloque--krav";
  if (clase.disciplina === "kickboxing" || clase.disciplina === "muay_thai") return "clase-bloque--kick";
  if (clase.disciplina === "mma" || clase.disciplina === "grappling") return "clase-bloque--mma";
  if (clase.disciplina === "jiu_jitsu") return "clase-bloque--jj";
  return "clase-bloque--boxeo";
}

export function CalendarioPage() {
  const { accessToken } = useAuth();
  const [clases, setClases] = useState<ClaseDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>(DIA_DE_HOY ?? "lunes");

  useEffect(() => {
    if (accessToken === null) {
      return;
    }
    peticionApi<ClaseDTO[]>("/clases", { accessToken })
      .then(setClases)
      .catch(() => setError("No se ha podido cargar el horario."));
  }, [accessToken]);

  const horas = clases !== null ? [...new Set(clases.map((c) => c.horaInicio))].sort() : [];
  const clasesDelDiaSeleccionado =
    clases?.filter((c) => c.diaSemana === diaSeleccionado).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)) ??
    [];

  return (
    <PanelLayout titulo="Calendario">
      {error !== null && <p className="mensaje-error">{error}</p>}

      {clases === null ? (
        <CalendarioSkeleton />
      ) : (
        <>
          {/* Móvil: selector de día + lista vertical (una rejilla de 5 columnas no
              es legible en un teléfono). Escritorio: rejilla semanal completa. */}
          <div className="calendario-selector-dia">
            {DIAS.map((dia) => (
              <button
                key={dia.valor}
                type="button"
                className={`filtro-pill${diaSeleccionado === dia.valor ? " filtro-pill--activo" : ""}`}
                onClick={() => setDiaSeleccionado(dia.valor)}
              >
                {dia.etiquetaCorta}
              </button>
            ))}
          </div>

          <div className="calendario-lista-movil lista-tarjeta">
            {clasesDelDiaSeleccionado.length === 0 ? (
              <p className="lista-vacia">No hay clases programadas este día.</p>
            ) : (
              clasesDelDiaSeleccionado.map((clase) => (
                <div className="fila-lista" key={clase.id}>
                  <span className="calendario-hora-movil">{clase.horaInicio}</span>
                  <span className={`clase-bloque ${colorClase(clase)}`}>{clase.nombre}</span>
                </div>
              ))
            )}
          </div>

          <div className="calendario-tabla">
            <div className="calendario-fila calendario-fila--cabecera">
              <div />
              {DIAS.map((dia) => (
                <div key={dia.valor} className="calendario-dia-cabecera">
                  {dia.etiquetaCorta}
                </div>
              ))}
            </div>

            {horas.map((hora) => (
              <div className="calendario-fila" key={hora}>
                <div className="calendario-hora">{hora}</div>
                {DIAS.map((dia) => {
                  const clasesDelHueco = clases.filter(
                    (c) => c.horaInicio === hora && c.diaSemana === dia.valor
                  );
                  return (
                    <div className="calendario-celda" key={dia.valor}>
                      {clasesDelHueco.map((clase) => (
                        <div key={clase.id} className={`clase-bloque ${colorClase(clase)}`}>
                          {clase.nombre}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="texto-muted calendario-nota">
        Sábado: horario de competición variable · Domingo: cerrado.
      </p>
    </PanelLayout>
  );
}
