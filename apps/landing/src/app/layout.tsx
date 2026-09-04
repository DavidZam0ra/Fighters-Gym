import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONTACTO } from "../lib/datos-gimnasio";
import { URL_BASE } from "../lib/seo";
import "./globals.css";

const TITULO = "Fighters Gym — Club de Boxeo y Artes Marciales en Almàssera";
const DESCRIPCION =
  "Boxeo, kickboxing, muay thai, MMA, jiu-jitsu, grappling y krav maga en Almàssera (Valencia). Club federado. Ven a probar una clase gratis.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title: TITULO,
  description: DESCRIPCION,
  keywords: [
    "gimnasio boxeo Almàssera",
    "artes marciales Valencia",
    "kickboxing Almàssera",
    "muay thai Valencia",
    "MMA Almàssera",
    "jiu-jitsu Valencia",
    "krav maga Almàssera",
  ],
  alternates: { canonical: URL_BASE },
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: URL_BASE,
    siteName: "Fighters Gym",
    locale: "es_ES",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
  robots: { index: true, follow: true },
};

// Datos estructurados (schema.org) para que Google reconozca Fighters Gym
// como negocio local con dirección, teléfono y ubicación real — de ahí
// pueden salir resultados enriquecidos y refuerza la ficha de Google Maps
// ya existente del gimnasio (ver CONTACTO.googleMapsUrl).
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  "@id": URL_BASE,
  name: "Fighters Gym",
  url: URL_BASE,
  image: `${URL_BASE}/logo.png`,
  telephone: `+${CONTACTO.telefonoInternacional}`,
  email: CONTACTO.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Carrer Comtes de Parcent 19",
    addressLocality: "Almàssera",
    postalCode: "46132",
    addressRegion: "Valencia",
    addressCountry: "ES",
  },
  geo: { "@type": "GeoCoordinates", latitude: 39.510443, longitude: -0.3574097 },
  hasMap: CONTACTO.googleMapsUrl,
  sameAs: [CONTACTO.instagram, CONTACTO.facebook, CONTACTO.tiktok],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
