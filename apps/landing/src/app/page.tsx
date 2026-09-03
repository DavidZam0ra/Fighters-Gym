import { HelmetLogo } from "../components/HelmetLogo";
import { CONTACTO, DISCIPLINAS, TARIFAS_INDIVIDUALES, TARIFAS_PLANAS, WHATSAPP_CTA } from "../lib/datos-gimnasio";
import { DIAS_SEMANA, HORARIO, type ClaseFranja } from "../lib/horario";

export default function Home() {
  return (
    <>
      <header className="cabecera">
        <div className="cabecera-marca">
          <HelmetLogo size={40} />
          <span className="display" style={{ fontSize: 18, letterSpacing: 1 }}>
            Fighters Gym
          </span>
        </div>
        <nav className="cabecera-nav">
          <a href="#disciplinas">Disciplinas</a>
          <a href="#horarios">Horarios</a>
          <a href="#tarifas">Tarifas</a>
          <a href="#contacto">Ubicación</a>
        </nav>
        <a href={WHATSAPP_CTA} className="boton boton--primario">
          Ven a probar
        </a>
      </header>

      <section className="hero">
        <div className="hero-contenido">
          <span className="hero-etiqueta">Club Federado · Almàssera, Valencia</span>
          <h1 className="display">
            Aquí se suda <span style={{ color: "var(--accent)" }}>en familia</span>
          </h1>
          <p>
            Boxeo, kickboxing, muay thai, MMA, jiu-jitsu, grappling y krav maga. Da igual si vienes a
            competir o a soltar el día — aquí entrenas con gente de verdad, desde el primer asalto.
          </p>
          <div className="hero-acciones">
            <a href={WHATSAPP_CTA} className="boton boton--primario">
              Ven a probar
            </a>
            <a href="#horarios" className="boton boton--secundario">
              Ver horarios
            </a>
          </div>
        </div>
      </section>

      <section id="disciplinas" className="seccion seccion--alt">
        <div className="contenedor">
          <div className="seccion-cabecera">
            <h2 className="display">Disciplinas</h2>
            <p>Grupos reducidos, técnica de verdad y progresión adaptada a cada alumno.</p>
          </div>
          <div className="disciplinas-lista">
            {DISCIPLINAS.map((disciplina, indice) => (
              <div className="disciplina-panel" key={disciplina.nombre}>
                <span className="disciplina-panel-indice display">{String(indice + 1).padStart(2, "0")}</span>
                <div className="disciplina-panel-cuerpo">
                  <IconoDisciplina indice={indice} />
                  <h3 className="display">{disciplina.nombre}</h3>
                  <p>{disciplina.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="competicion-nota">
            <strong style={{ color: "var(--text)" }}>Competición</strong> — club federado, con grupo de
            preparación para quien quiere subirse al cuadrilátero o al tatami de verdad.
          </div>
        </div>
      </section>

      <section id="horarios" className="seccion seccion--alt">
        <div className="contenedor">
          <div className="seccion-cabecera">
            <h2 className="display">Horario</h2>
            <p>Sábado: horario de competición variable, consulta disponibilidad. Domingo: cerrado.</p>
          </div>

          {/* Móvil: una tarjeta por día — una tabla de 6 columnas no cabe en un
              teléfono. Escritorio: la rejilla semanal completa. Ambas son
              markup estático, sin JS, a partir de la misma fuente de datos. */}
          <div className="horario-movil">
            {DIAS_SEMANA.map((dia, indiceDia) => (
              <div className="horario-dia-card" key={dia}>
                <div className="horario-dia-titulo">{dia}</div>
                {HORARIO.map((franja) => (
                  <div className="horario-dia-fila" key={franja.hora}>
                    <span className="horario-dia-fila-hora">{franja.hora}</span>
                    <span className="horario-dia-fila-clases">
                      <ClasesDeFranja clases={franja.dias[indiceDia] ?? []} />
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="horario-tabla">
            <div className="horario-fila horario-fila--cabecera">
              <div />
              {DIAS_SEMANA.map((dia) => (
                <div className="horario-fila-dia" key={dia}>
                  {dia}
                </div>
              ))}
            </div>
            {HORARIO.map((franja) => (
              <div className="horario-fila" key={franja.hora}>
                <div className="horario-fila-hora">{franja.hora}</div>
                {franja.dias.map((clases, indice) => (
                  <div className="horario-fila-celda" key={indice}>
                    <ClasesDeFranja clases={clases} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifas" className="seccion">
        <div className="contenedor">
          <div className="seccion-cabecera">
            <h2 className="display">Tarifas</h2>
            <p>Todas las cuotas incluyen acceso a sala libre. Matrícula: 25€ (pago único).</p>
          </div>
          <div className="tarifas-grid">
            <div className="tarifas-lista">
              {TARIFAS_INDIVIDUALES.map((tarifa) => (
                <div className="tarifa-fila" key={tarifa.nombre}>
                  <span>{tarifa.nombre}</span>
                  <span className="tarifa-precio">
                    {tarifa.precio}€<span className="tarifa-precio-unidad">/mes</span>
                  </span>
                </div>
              ))}
            </div>
            <div>
              <div className="tarifas-titulo-grupo">Tarifas planas</div>
              <div className="tarifas-lista">
                {TARIFAS_PLANAS.map((tarifa) => (
                  <div
                    className={`tarifa-fila${"destacado" in tarifa && tarifa.destacado ? " tarifa-fila--destacada" : ""}`}
                    key={tarifa.nombre}
                  >
                    <span>{tarifa.nombre}</span>
                    <span className="tarifa-precio">
                      {tarifa.precio}€<span className="tarifa-precio-unidad">/mes</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="tarifas-extra">
                Entrenamiento personal, planes de nutrición y seguimiento también disponibles — pregunta en
                recepción o por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="seccion seccion--alt">
        <div className="contenedor">
          <div className="contacto-grid">
            <div className="contacto-info">
              <h2 className="display">Ven a probarlo</h2>
              <div className="contacto-linea">
                <IconoUbicacion />
                <a href={CONTACTO.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  {CONTACTO.direccion}
                </a>
              </div>
              <div className="contacto-linea">
                <IconoTelefono />
                <a href={`tel:+${CONTACTO.telefonoInternacional}`}>{CONTACTO.telefono}</a>
              </div>
              <div className="contacto-linea">
                <IconoEmail />
                <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>
              </div>
              <div className="contacto-redes">
                <a className="contacto-red" href={CONTACTO.instagram} aria-label="Instagram">
                  <IconoInstagram />
                </a>
                <a className="contacto-red" href={CONTACTO.facebook} aria-label="Facebook">
                  <IconoFacebook />
                </a>
                <a className="contacto-red" href={CONTACTO.tiktok} aria-label="TikTok">
                  <IconoTiktok />
                </a>
              </div>
            </div>
            <div className="contacto-mapa">
              <iframe
                src={CONTACTO.googleMapsEmbedSrc}
                title="Mapa de ubicación de Fighters Gym"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                className="contacto-mapa-enlace"
                href={CONTACTO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="pie">
        <span className="display">Fighters Gym</span>
        <span>Boxing &amp; Fight Club · Almàssera</span>
        <a href={CONTACTO.tienda}>Tienda</a>
      </footer>
    </>
  );
}

function ClasesDeFranja({ clases }: { clases: ClaseFranja[] }) {
  if (clases.length === 0) {
    return <span className="horario-clase horario-clase--libre">Sala libre</span>;
  }
  return (
    <>
      {clases.map((clase) => (
        <span key={clase.nombre} style={{ display: "block" }}>
          <span className="horario-clase">{clase.nombre}</span>
          {clase.sparring === true && <span className="horario-sparring"> · sparring</span>}
        </span>
      ))}
    </>
  );
}

const TRAZOS_DISCIPLINA = [
  // Boxeo
  "M7 13V8a3 3 0 0 1 3-3 3 3 0 0 1 3 3M10 8a3 3 0 0 1 3-3 3 3 0 0 1 3 3v5|M7 13v3a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-3|M7 13h9",
  // Kickboxing / Muay Thai
  "M5 20l3-7 4-2 2-6 3 1-2 7-4 2-2 7z",
  // MMA / Grappling (dos círculos, caso especial más abajo)
  "circulos",
  // Jiu-Jitsu
  "M3 12h18|M9 8l-4 4 4 4|M15 8l4 4-4 4",
  // Krav Maga / Defensa personal
  "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
  // Infantil
  "M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6|M9 4.5l1 1.6M15 4.5l-1 1.6",
] as const;

function IconoDisciplina({ indice }: { indice: number }) {
  const trazos = TRAZOS_DISCIPLINA[indice];
  const props = {
    className: "disciplina-icono",
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true as const,
  };

  if (trazos === "circulos") {
    return (
      <svg {...props}>
        <circle cx="9" cy="9" r="4" />
        <circle cx="15" cy="15" r="4" />
      </svg>
    );
  }
  if (indice === 5) {
    // Infantil: cabecita (círculo) + cuerpo + orejas — se pierde si solo se
    // dibujan los trazos sueltos.
    return (
      <svg {...props}>
        <circle cx="12" cy="7" r="3.2" />
        {trazos?.split("|").map((d) => <path key={d} d={d} />)}
      </svg>
    );
  }
  return (
    <svg {...props}>
      {trazos?.split("|").map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

function IconoUbicacion({ tamano = 20 }: { tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.6}>
      <path d="M12 21s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconoTelefono() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.6}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2.1z" />
    </svg>
  );
}

function IconoEmail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.6}>
      <path d="M4 4h16v16H4z" />
      <path d="M4 6l8 7 8-7" />
    </svg>
  );
}

function IconoInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconoTiktok() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v10.8a3.6 3.6 0 1 1-3-3.55" />
      <path d="M14 3c.3 2.6 2.2 4.6 4.8 4.8" />
    </svg>
  );
}
