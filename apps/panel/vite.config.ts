import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // start_url apunta directo a /home: instalar la PWA en el móvil de Rafa
      // nunca debe abrir la landing pública, solo el panel ya logueado.
      manifest: {
        name: "Fighters Gym — Panel",
        short_name: "Fighters Gym",
        description: "Panel de gestión de alumnos y cuotas de Fighters Gym",
        start_url: "/home",
        scope: "/",
        display: "standalone",
        background_color: "#121113",
        theme_color: "#121113",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
