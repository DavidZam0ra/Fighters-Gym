import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type {
  AlumnoDTO,
  CrearAlumnoRequestDTO,
  Disciplina,
  ConfiguracionGimnasioDTO,
  DatosAlumnoExtraidosDTO,
} from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { ApiError, peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";
import { AlumnoAvatar } from "../components/AlumnoAvatar.js";
import { CATALOGO_DISCIPLINAS } from "../lib/disciplinas.js";
import { sugerirCuotaMensual } from "../lib/precios.js";

const FECHA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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
  const [configuracion, setConfiguracion] = useState<ConfiguracionGimnasioDTO | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [camposParaRevisar, setCamposParaRevisar] = useState<Set<keyof FormularioAlumno>>(new Set());

  useEffect(() => {
    if (accessToken === null) {
      return;
    }
    peticionApi<ConfiguracionGimnasioDTO>("/ajustes", { accessToken })
      .then(setConfiguracion)
      .catch(() => {
        // Si no carga, simplemente no se muestra el escaneo — el formulario manual sigue funcionando.
      });
  }, [accessToken]);

  async function procesarFoto(archivo: File): Promise<void> {
    if (accessToken === null) {
      return;
    }
    setErrorFoto(null);
    setSubiendoFoto(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const datos = await peticionApi<DatosAlumnoExtraidosDTO>("/alumnos/importar-foto", {
        method: "POST",
        accessToken,
        body: formData,
      });

      const revisar = new Set<keyof FormularioAlumno>();
      function marcarSiHayDudas(campo: keyof FormularioAlumno, tieneValor: boolean, confianza: "alta" | "baja") {
        if (confianza === "baja" && tieneValor) {
          revisar.add(campo);
        }
      }

      const fechaNacimiento = FECHA_ISO_REGEX.test(datos.fechaNacimiento.valor) ? datos.fechaNacimiento.valor : "";
      marcarSiHayDudas("nombre", datos.nombre.valor.trim().length > 0, datos.nombre.confianza);
      marcarSiHayDudas("apellidos", datos.apellidos.valor.trim().length > 0, datos.apellidos.confianza);
      marcarSiHayDudas("telefono", datos.telefono.valor.trim().length > 0, datos.telefono.confianza);
      marcarSiHayDudas("dniNie", datos.dniNie.valor.trim().length > 0, datos.dniNie.confianza);
      marcarSiHayDudas("fechaNacimiento", fechaNacimiento.length > 0, datos.fechaNacimiento.confianza);
      marcarSiHayDudas("disciplinas", datos.disciplinas.valor.length > 0, datos.disciplinas.confianza);
      setCamposParaRevisar(revisar);

      setFormulario({
        nombre: datos.nombre.valor.trim(),
        apellidos: datos.apellidos.valor.trim(),
        telefono: datos.telefono.valor.trim(),
        email: datos.email.valor?.trim() ?? "",
        dniNie: datos.dniNie.valor.trim(),
        fechaNacimiento,
        disciplinas: datos.disciplinas.valor,
        cuotaMensual: String(sugerirCuotaMensual(datos.disciplinas.valor)),
      });
      setCuotaTocadaAMano(false);
    } catch (err) {
      setErrorFoto(err instanceof ApiError ? err.message : "No se ha podido leer la foto.");
    } finally {
      setSubiendoFoto(false);
    }
  }

  function limpiarRevisar(campo: keyof FormularioAlumno): void {
    setCamposParaRevisar((actual) => {
      if (!actual.has(campo)) {
        return actual;
      }
      const nuevo = new Set(actual);
      nuevo.delete(campo);
      return nuevo;
    });
  }

  function alternarDisciplina(valor: Disciplina): void {
    limpiarRevisar("disciplinas");
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

      {configuracion?.escaneoFichasActivo === true && (
        <div className="tarjeta-panel escaneo-foto">
          <div className="escaneo-foto-info">
            <div className="tarjeta-panel-titulo">Sube o haz una foto de la ficha</div>
            <span className="texto-muted">
              La IA rellena el formulario de abajo — revisa siempre los datos antes de guardar.
            </span>
            {errorFoto !== null && <p className="mensaje-error">{errorFoto}</p>}
          </div>
          {subiendoFoto ? (
            <span className="escaneo-foto-subiendo">Leyendo la ficha…</span>
          ) : (
            <label className="boton-primario boton-primario--compacto" style={{ cursor: "pointer" }}>
              Tomar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={(evento) => {
                  const archivo = evento.target.files?.[0];
                  evento.target.value = "";
                  if (archivo !== undefined) {
                    void procesarFoto(archivo);
                  }
                }}
              />
            </label>
          )}
        </div>
      )}

      {error !== null && <p className="mensaje-error">{error}</p>}

      <form className="tarjeta-panel formulario-alumno" onSubmit={(e) => void guardar(e)}>
        <div className="formulario-cabecera">
          <AlumnoAvatar seed={seedPreview} size={48} />
          <span className="texto-muted">La miniatura se genera sola a partir del nombre.</span>
        </div>

        <div className="formulario-grid">
          <Campo etiqueta="Nombre" obligatorio revisar={camposParaRevisar.has("nombre")}>
            <input
              value={formulario.nombre}
              onChange={(e) => {
                limpiarRevisar("nombre");
                setFormulario((f) => ({ ...f, nombre: e.target.value }));
              }}
              required
            />
          </Campo>
          <Campo etiqueta="Apellidos" obligatorio revisar={camposParaRevisar.has("apellidos")}>
            <input
              value={formulario.apellidos}
              onChange={(e) => {
                limpiarRevisar("apellidos");
                setFormulario((f) => ({ ...f, apellidos: e.target.value }));
              }}
              required
            />
          </Campo>
          <Campo etiqueta="Teléfono" obligatorio revisar={camposParaRevisar.has("telefono")}>
            <input
              value={formulario.telefono}
              onChange={(e) => {
                limpiarRevisar("telefono");
                setFormulario((f) => ({ ...f, telefono: e.target.value }));
              }}
              required
            />
          </Campo>
          <Campo etiqueta="DNI / NIE" obligatorio revisar={camposParaRevisar.has("dniNie")}>
            <input
              value={formulario.dniNie}
              onChange={(e) => {
                limpiarRevisar("dniNie");
                setFormulario((f) => ({ ...f, dniNie: e.target.value }));
              }}
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
          <Campo
            etiqueta="Fecha de nacimiento"
            obligatorio
            revisar={camposParaRevisar.has("fechaNacimiento")}
          >
            <input
              type="date"
              value={formulario.fechaNacimiento}
              onChange={(e) => {
                limpiarRevisar("fechaNacimiento");
                setFormulario((f) => ({ ...f, fechaNacimiento: e.target.value }));
              }}
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
          {camposParaRevisar.has("disciplinas") && (
            <span className="campo-revisar-nota">La IA no está segura de estas disciplinas — revísalas.</span>
          )}
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
  revisar,
  children,
}: {
  etiqueta: string;
  obligatorio?: boolean;
  revisar?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`campo${revisar === true ? " campo--revisar" : ""}`}>
      <label>
        {etiqueta} {obligatorio === true && <span className="campo-obligatorio">*</span>}
      </label>
      {children}
      {revisar === true && <span className="campo-revisar-nota">La IA no está segura — revisa este dato.</span>}
    </div>
  );
}
