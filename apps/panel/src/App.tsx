import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext.js";
import { ProtectedRoute } from "./routes/ProtectedRoute.js";
import { LoginPage } from "./routes/LoginPage.js";
import { DashboardPage } from "./routes/DashboardPage.js";
import { AlumnosPage } from "./routes/AlumnosPage.js";
import { FichaAlumnoPage } from "./routes/FichaAlumnoPage.js";
import { NuevoAlumnoPage } from "./routes/NuevoAlumnoPage.js";
import { CuotasPage } from "./routes/CuotasPage.js";
import { CalendarioPage } from "./routes/CalendarioPage.js";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<DashboardPage />} />
            <Route path="/alumnos" element={<AlumnosPage />} />
            <Route path="/alumnos/nuevo" element={<NuevoAlumnoPage />} />
            <Route path="/alumnos/:id" element={<FichaAlumnoPage />} />
            <Route path="/cuotas" element={<CuotasPage />} />
            <Route path="/calendario" element={<CalendarioPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
