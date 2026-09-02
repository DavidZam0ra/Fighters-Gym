import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { peticionApi } from "./apiClient.js";

interface LoginResponse {
  accessToken: string;
}

interface AuthContextValue {
  accessToken: string | null;
  cargandoSesion: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    // Al cargar la app, intenta recuperar la sesión a partir de la cookie
    // httpOnly de refresco (si existe) — así un F5 no obliga a re-loguearse.
    peticionApi<LoginResponse>("/auth/refresh", { method: "POST" })
      .then((respuesta) => setAccessToken(respuesta.accessToken))
      .catch(() => setAccessToken(null))
      .finally(() => setCargandoSesion(false));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const respuesta = await peticionApi<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setAccessToken(respuesta.accessToken);
  }

  function logout(): void {
    setAccessToken(null);
  }

  const value = useMemo(
    () => ({ accessToken, cargandoSesion, login, logout }),
    [accessToken, cargandoSesion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return context;
}
