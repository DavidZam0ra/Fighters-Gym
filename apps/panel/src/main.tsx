import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./index.css";

const elementoRaiz = document.getElementById("root");
if (elementoRaiz === null) {
  throw new Error("No se encontró el elemento #root.");
}

createRoot(elementoRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>
);
