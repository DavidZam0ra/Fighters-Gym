import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fighters Gym — Club de Boxeo y Artes Marciales en Almàssera",
  description:
    "Boxeo, kickboxing, muay thai, MMA, jiu-jitsu, grappling y krav maga en Almàssera (Valencia). Club federado. Ven a probar una clase gratis.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
