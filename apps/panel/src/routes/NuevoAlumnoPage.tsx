import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { AlumnoDTO, CrearAlumnoRequestDTO, Disciplina } from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { ApiError, peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";
import { AlumnoAvatar } from "../components/AlumnoAvatar.js";
import { CATALOGO_DISCIPLINAS } from "../lib/disciplinas.js";
import { sugerirCuotaMensual } from "../lib/precios.js";

interface FormularioAlumno {
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  dniNie: string;
  fechaNacimiento: string;
  disciplinas: Disciplina[];
  cuotaMensual: string;
}

const FORMULARIO_VACIO: FormularioAlumno = {
  nombre: "",
  apellidos: "",
  telefono: "",
  email: "",
  dniNie: "",
  fechaNacimiento: "",
  disciplinas: [],
  cuotaMensual: "",
};

export function NuevoAlumnoPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState<FormularioAlumno>(FORMULARIO_VACIO);
  const [cuotaTocadaAMano, setCuotaTocadaAMano] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function alternarDisciplina(valor: Disciplina): void {
    setFormulario((actual) => {
      const yaSeleccionada = actual.disciplinas.includes(valor);
      const disciplinas = yaSeleccionada
        ? actual.disciplinas.filter((d) => d !== valor)
        : [...actual.disciplinas, valor];
      return {
        ...actual,
        disciplinas,
        cuotaMensual: cuotaTocadaAMano ? actual.cuotaMensual : String(sugerirCuotaMensual(disciplinas)),
      };
    });
  }

  async function guardar(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    if (accessToken === null) {
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const datos: CrearAlumnoRequestDTO = {
        nombre: formulario.nombre.trim(),
        apellidos: formulario.apellidos.trim(),
        telefono: formulario.telefono.trim(),
        email: formulario.email.trim().length === 0 ? null : formulario.email.trim(),
        dniNie: formulario.dniNie.trim(),
        fechaNacimiento: formulario.fechaNacimiento,
        cuotaMensual: Number(formulario.cuotaMensual),
        disciplinas: formulario.disciplinas,
      };
      const alumno = await peticionApi<AlumnoDTO>("/alumnos", { method: "POST", accessToken, body: datos });
      navigate(`/alumnos/${alumno.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido guardar el alumno.");
    } finally {
      setEnviando(false);
    }
  }

  const seedPreview =
    formulario.nombre.trim().length > 0 || formulario.apellidos.trim().length > 0
      ? `${formulario.nombre} ${formulario.apellidos}`.trim()
      : "?";

  return (
    <PanelLayout titulo="Nuevo alumno">
      <p className="texto-muted">
        Escanea la ficha de inscripción en papel y la IA rellena el formulario por ti, o escribe los datos
        directamente — revísalos siempre antes de guardar.
      </p>

      <div className="tarjeta-panel escaneo-foto escaneo-foto--proximamente" title="Próximamente">
        <div className="escaneo-foto-info">
          <div className="tarjeta-panel-titulo">Sube o haz una foto de la ficha</div>
          <span className="texto-muted">
            Escaneo por IA — próximamente. De momento, rellena el formulario de abajo a mano.
          </span>
        </div>
        <span className="boton-primario boton-primario--compacto boton-primario--deshabilitado">
          Tomar foto
        </span>
      </div>

      {error !== null && <p className="mensaje-error">{error}</p>}

      <form className="tarjeta-panel formulario-alumno" onSubmit={(e) => void guardar(e)}>
        <div className="formulario-cabecera">
          <AlumnoAvatar seed={seedPreview} size={48} />
          <span className="texto-muted">La miniatura se genera sola a partir del nombre.</span>
        </div>

        <div className="formulario-grid">
          <Campo etiqueta="Nombre" obligatorio>
            <input
              value={formulario.nombre}
              onChange={(e) => setFormulario((f) => ({ ...f, nombre: e.target.value }))}
              required
            />
          </Campo>
          <Campo etiqueta="Apellidos" obligatorio>
            <input
              value={formulario.apellidos}
              onChange={(e) => setFormulario((f) => ({ ...f, apellidos: e.target.value }))}
              required
            />
          </Campo>
          <Campo etiqueta="Teléfono" obligatorio>
            <input
              value={formulario.telefono}
              onChange={(e) => setFormulario((f) => ({ ...f, telefono: e.target.value }))}
              required
            />
          </Campo>
          <Campo etiqueta="DNI / NIE" obligatorio>
            <input
              value={formulario.dniNie}
              onChange={(e) => setFormulario((f) => ({ ...f, dniNie: e.target.value }))}
              required
            />
          </Campo>
          <Campo etiqueta="Email">
            <input
              type="email"
              value={formulario.email}
              onChange={(e) => setFormulario((f) => ({ ...f, email: e.target.value }))}
            />
          </Campo>
          <Campo etiqueta="Fecha de nacimiento" obligatorio>
            <input
              type="date"
              value={formulario.fechaNacimiento}
              onChange={(e) => setFormulario((f) => ({ ...f, fechaNacimiento: e.target.value }))}
              required
            />
          </Campo>
        </div>

        <div className="campo">
          <label>Disciplinas</label>
          <div className="disciplinas-selector">
            {CATALOGO_DISCIPLINAS.map((disciplina) => (
              <button
                type="button"
                key={disciplina.valor}
                className={`filtro-pill${
                  formulario.disciplinas.includes(disciplina.valor) ? " filtro-pill--activo" : ""
                }`}
                onClick={() => alternarDisciplina(disciplina.valor)}
              >
                {disciplina.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <Campo etiqueta="Cuota mensual (€)" obligatorio>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formulario.cuotaMensual}
            onChange={(e) => {
              setCuotaTocadaAMano(true);
              setFormulario((f) => ({ ...f, cuotaMensual: e.target.value }));
            }}
            required
          />
        </Campo>
        {formulario.disciplinas.length > 0 && !cuotaTocadaAMano && (
          <span className="texto-muted campo-nota">
            Sugerida según la tarifa de {formulario.disciplinas.length}{" "}
            {formulario.disciplinas.length === 1 ? "modalidad" : "modalidades"} — puedes cambiarla.
          </span>
        )}

        <button type="submit" className="boton-primario formulario-submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar alumno"}
        </button>
      </form>
    </PanelLayout>
  );
}

function Campo({
  etiqueta,
  obligatorio,
  children,
}: {
  etiqueta: string;
  obligatorio?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="campo">
      <label>
        {etiqueta} {obligatorio === true && <span className="campo-obligatorio">*</span>}
      </label>
      {children}
    </div>
  );
}
