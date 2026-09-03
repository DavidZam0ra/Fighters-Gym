import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { AlumnoDTO } from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";
import { AlumnoAvatar } from "../components/AlumnoAvatar.js";
import { AlumnosSkeleton } from "../components/PageSkeletons.js";
import { etiquetaDisciplina } from "../lib/disciplinas.js";

export function AlumnosPage() {
  const { accessToken } = useAuth();
  const [alumnos, setAlumnos] = useState<AlumnoDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (accessToken === null) {
      return;
    }
    peticionApi<AlumnoDTO[]>("/alumnos", { accessToken })
      .then(setAlumnos)
      .catch(() => setError("No se han podido cargar los alumnos."));
  }, [accessToken]);

  const alumnosFiltrados = useMemo(() => {
    if (alumnos === null) {
      return [];
    }
    const termino = busqueda.trim().toLowerCase();
    if (termino.length === 0) {
      return alumnos;
    }
    return alumnos.filter((alumno) =>
      `${alumno.nombre} ${alumno.apellidos}`.toLowerCase().includes(termino)
    );
  }, [alumnos, busqueda]);

  return (
    <PanelLayout titulo="Alumnos">
      {error !== null && <p className="mensaje-error">{error}</p>}

      <div className="alumnos-cabecera-acciones">
        <input
          type="search"
          className="campo-busqueda"
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
        <Link to="/alumnos/nuevo" className="boton-primario boton-primario--compacto boton-nuevo-alumno">
          + Nuevo alumno
        </Link>
      </div>

      {alumnos === null ? (
        <AlumnosSkeleton />
      ) : (
        <div className="lista-tarjeta lista-tarjeta--alumnos">
          {alumnosFiltrados.length === 0 ? (
            <p className="lista-vacia">No hay alumnos que coincidan con la búsqueda.</p>
          ) : (
            alumnosFiltrados.map((alumno) => (
              <Link className="fila-alumno" to={`/alumnos/${alumno.id}`} key={alumno.id}>
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
            ))
          )}
        </div>
      )}
    </PanelLayout>
  );
}
