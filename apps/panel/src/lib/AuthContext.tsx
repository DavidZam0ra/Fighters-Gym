import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UsuarioActualDTO } from "@fighters-gym/shared-types";
import { peticionApi } from "./apiClient.js";

interface LoginResponse {
  accessToken: string;
}

interface AuthContextValue {
  accessToken: string | null;
  usuario: UsuarioActualDTO | null;
  cargandoSesion: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioActualDTO | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    // Al cargar la app, intenta recuperar la sesión a partir de la cookie
    // httpOnly de refresco (si existe) — así un F5 no obliga a re-loguearse.
    peticionApi<LoginResponse>("/auth/refresh", { method: "POST" })
      .then((respuesta) => setAccessToken(respuesta.accessToken))
      .catch(() => setAccessToken(null))
      .finally(() => setCargandoSesion(false));
  }, []);

  useEffect(() => {
    // Se pide una única vez por sesión (cuando cambia el token, es decir,
    // login/logout/refresh) — no en cada pantalla que se monta. El nombre y
    // el rol no cambian salvo que se cierre sesión.
    if (accessToken === null) {
      setUsuario(null);
      return;
    }
    peticionApi<UsuarioActualDTO>("/auth/me", { accessToken })
      .then(setUsuario)
      .catch(() => setUsuario(null));
  }, [accessToken]);

  async function login(email: string, password: string): Promise<void> {
    const respuesta = await peticionApi<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setAccessToken(respuesta.accessToken);
  }

  async function logout(): Promise<void> {
    // Necesario de verdad, no un simple "olvidar el token": borra la cookie
    // httpOnly de refresco en el servidor. Sin esto, un F5 tras "Salir"
    // volvería a iniciar sesión solo con la cookie todavía viva.
    try {
      await peticionApi("/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
    }
  }

  const value = useMemo(
    () => ({ accessToken, usuario, cargandoSesion, login, logout }),
    [accessToken, usuario, cargandoSesion]
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
