import { useEffect, useState, type FormEvent } from "react";
import type { ConfiguracionGimnasioDTO } from "@fighters-gym/shared-types";
import { useAuth } from "../lib/AuthContext.js";
import { ApiError, peticionApi } from "../lib/apiClient.js";
import { PanelLayout } from "../components/PanelLayout.js";

export function AjustesPage() {
  const { accessToken } = useAuth();
  const [configuracion, setConfiguracion] = useState<ConfiguracionGimnasioDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  useEffect(() => {
    if (accessToken === null) {
      return;
    }
    peticionApi<ConfiguracionGimnasioDTO>("/ajustes", { accessToken })
      .then(setConfiguracion)
      .catch(() => setError("No se ha podido cargar la configuración del gimnasio."));
  }, [accessToken]);

  async function guardarConfiguracion(datos: ConfiguracionGimnasioDTO): Promise<void> {
    if (accessToken === null) {
      return;
    }
    setError(null);
    setGuardando(true);
    setGuardadoOk(false);
    try {
      await peticionApi("/ajustes", { method: "PUT", accessToken, body: datos });
      setConfiguracion(datos);
      setGuardadoOk(true);
    } catch {
      setError("No se han podido guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <PanelLayout titulo="Ajustes">
      {error !== null && <p className="mensaje-error">{error}</p>}

      {configuracion !== null && (
        <div className="ajustes-layout">
          <DatosGimnasioTarjeta
            configuracion={configuracion}
            guardando={guardando}
            guardadoOk={guardadoOk}
            onGuardar={guardarConfiguracion}
          />

          <UsuarioTarjeta />

          <FuncionalidadesTarjeta
            configuracion={configuracion}
            guardando={guardando}
            onCambiar={(cambios) => void guardarConfiguracion({ ...configuracion, ...cambios })}
          />
        </div>
      )}
    </PanelLayout>
  );
}

function DatosGimnasioTarjeta({
  configuracion,
  guardando,
  guardadoOk,
  onGuardar,
}: {
  configuracion: ConfiguracionGimnasioDTO;
  guardando: boolean;
  guardadoOk: boolean;
  onGuardar: (datos: ConfiguracionGimnasioDTO) => Promise<void>;
}) {
  const [nombre, setNombre] = useState(configuracion.nombre);
  const [direccion, setDireccion] = useState(configuracion.direccion);
  const [telefono, setTelefono] = useState(configuracion.telefono);
  const [email, setEmail] = useState(configuracion.email);

  async function enviar(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    await onGuardar({ ...configuracion, nombre, direccion, telefono, email });
  }

  return (
    <form className="tarjeta-panel" onSubmit={(e) => void enviar(e)}>
      <h2 className="display tarjeta-panel-cabecera">Datos del gimnasio</h2>
      <div className="campo">
        <label>Nombre</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div className="campo">
        <label>Dirección</label>
        <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
      </div>
      <div className="formulario-grid">
        <div className="campo">
          <label>Teléfono / WhatsApp</label>
          <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        </div>
        <div className="campo">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="ajustes-guardar">
        <button type="submit" className="boton-primario boton-primario--compacto" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        {guardadoOk && <span className="texto-exito">Guardado.</span>}
      </div>
    </form>
  );
}

function UsuarioTarjeta() {
  const { usuario } = useAuth();
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  return (
    <div className="tarjeta-panel">
      <h2 className="display tarjeta-panel-cabecera">Usuarios</h2>
      <div className="ajustes-usuario-fila">
        <div className="panel-usuario-avatar">{(usuario?.nombre ?? "?").charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ajustes-usuario-nombre">{usuario?.nombre ?? "Cargando…"}</div>
          <div className="texto-muted">{usuario?.email ?? ""}</div>
        </div>
        <span className="etiqueta-pill">{usuario?.rol === "admin" ? "Administrador" : "Entrenador/a"}</span>
      </div>
      {formularioAbierto ? (
        <CambiarPasswordFormulario onCerrar={() => setFormularioAbierto(false)} />
      ) : (
        <button
          type="button"
          className="boton-secundario ajustes-cambiar-password-boton"
          onClick={() => setFormularioAbierto(true)}
        >
          Cambiar contraseña
        </button>
      )}
    </div>
  );
}

function CambiarPasswordFormulario({ onCerrar }: { onCerrar: () => void }) {
  const { accessToken } = useAuth();
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmada, setPasswordConfirmada] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  async function enviar(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    if (accessToken === null) {
      return;
    }
    setError(null);
    if (passwordNueva !== passwordConfirmada) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }
    setEnviando(true);
    try {
      await peticionApi("/auth/cambiar-password", {
        method: "POST",
        accessToken,
        body: { passwordActual, passwordNueva },
      });
      setOk(true);
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirmada("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido cambiar la contraseña.");
    } finally {
      setEnviando(false);
    }
  }

  if (ok) {
    return (
      <div className="ajustes-password-form">
        <span className="texto-exito">Contraseña cambiada correctamente.</span>
        <button type="button" className="boton-secundario" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form className="ajustes-password-form" onSubmit={(e) => void enviar(e)}>
      {error !== null && <p className="mensaje-error">{error}</p>}
      <div className="campo">
        <label>Contraseña actual</label>
        <input
          type="password"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          required
        />
      </div>
      <div className="formulario-grid">
        <div className="campo">
          <label>Contraseña nueva</label>
          <input
            type="password"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="campo">
          <label>Repite la contraseña nueva</label>
          <input
            type="password"
            value={passwordConfirmada}
            onChange={(e) => setPasswordConfirmada(e.target.value)}
            minLength={8}
            required
          />
        </div>
      </div>
      <div className="ajustes-guardar">
        <button type="submit" className="boton-primario boton-primario--compacto" disabled={enviando}>
          {enviando ? "Guardando…" : "Cambiar contraseña"}
        </button>
        <button type="button" className="boton-secundario" onClick={onCerrar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function FuncionalidadesTarjeta({
  configuracion,
  guardando,
  onCambiar,
}: {
  configuracion: ConfiguracionGimnasioDTO;
  guardando: boolean;
  onCambiar: (cambios: Partial<ConfiguracionGimnasioDTO>) => void;
}) {
  return (
    <div className="tarjeta-panel">
      <h2 className="display tarjeta-panel-cabecera">Funcionalidades</h2>

      <div className="ajustes-funcionalidad-fila">
        <div>
          <div className="ajustes-funcionalidad-titulo">Escaneo de fichas por foto</div>
          <div className="texto-muted ajustes-funcionalidad-descripcion">
            Muestra el botón de escanear en &ldquo;Nuevo alumno&rdquo;. Apágalo cuando ya no lo necesites.
          </div>
        </div>
        <Interruptor
          activo={configuracion.escaneoFichasActivo}
          disabled={guardando}
          onCambiar={(activo) => onCambiar({ escaneoFichasActivo: activo })}
          etiqueta="Escaneo de fichas por foto"
        />
      </div>

      <div className="ajustes-funcionalidad-fila">
        <div>
          <div className="ajustes-funcionalidad-titulo">Reservas por clase</div>
          <div className="texto-muted ajustes-funcionalidad-descripcion">
            Limita el aforo y abre inscripción antes de cada clase.
          </div>
        </div>
        <span className="etiqueta-pill etiqueta-pill--proximamente">Próximamente</span>
      </div>

      <div className="ajustes-funcionalidad-fila ajustes-funcionalidad-fila--ultima">
        <div>
          <div className="ajustes-funcionalidad-titulo">Notificaciones por WhatsApp</div>
          <div className="texto-muted ajustes-funcionalidad-descripcion">
            Avisa de cuotas atrasadas cada lunes.
          </div>
        </div>
        <Interruptor
          activo={configuracion.notificacionesWhatsappActivo}
          disabled={guardando}
          onCambiar={(activo) => onCambiar({ notificacionesWhatsappActivo: activo })}
          etiqueta="Notificaciones por WhatsApp"
        />
      </div>
    </div>
  );
}

function Interruptor({
  activo,
  disabled,
  onCambiar,
  etiqueta,
}: {
  activo: boolean;
  disabled: boolean;
  onCambiar: (activo: boolean) => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={disabled}
      className={`interruptor${activo ? " interruptor--activo" : ""}`}
      onClick={() => onCambiar(!activo)}
    >
      <span className="interruptor-bola" />
    </button>
  );
}
