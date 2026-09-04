import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LoginResponseDTO, UsuarioActualDTO } from "@fighters-gym/shared-types";
import { peticionApi } from "./apiClient.js";

const CLAVE_REFRESH_TOKEN = "fg_refresh_token";

interface AuthContextValue {
  accessToken: string | null;
  usuario: UsuarioActualDTO | null;
  cargandoSesion: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function guardarRefreshToken(valor: string): void {
  try {
    localStorage.setItem(CLAVE_REFRESH_TOKEN, valor);
  } catch {
    // Almacenamiento no disponible (navegación privada, etc.) — la sesión
    // simplemente no sobrevivirá a un F5, no es un error fatal.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioActualDTO | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    // Al cargar la app, intenta recuperar la sesión a partir del refresh
    // token guardado en localStorage (si existe) — así un F5, o volver a
    // abrir la PWA, no obliga a re-loguearse. Guardado en localStorage y no
    // en una cookie httpOnly porque panel y API son subdominios distintos de
    // onrender.com (Public Suffix List): Safari/iOS bloquea por defecto las
    // cookies de terceros y la sesión no sobrevivía en la PWA del móvil —
    // ver memoria de proyecto "auth-localstorage-deuda-tecnica" para cuándo
    // revertir esto a cookie httpOnly.
    const refreshTokenGuardado = localStorage.getItem(CLAVE_REFRESH_TOKEN);
    if (refreshTokenGuardado === null) {
      setCargandoSesion(false);
      return;
    }
    peticionApi<LoginResponseDTO>("/auth/refresh", {
      method: "POST",
      body: { refreshToken: refreshTokenGuardado },
    })
      .then((respuesta) => {
        guardarRefreshToken(respuesta.refreshToken);
        setAccessToken(respuesta.accessToken);
      })
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
    const respuesta = await peticionApi<LoginResponseDTO>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    guardarRefreshToken(respuesta.refreshToken);
    setAccessToken(respuesta.accessToken);
  }

  async function logout(): Promise<void> {
    // No hay nada que invalidar en el servidor (JWT sin estado) — basta con
    // olvidar el refresh token localmente para que ni un F5 recupere sesión.
    try {
      localStorage.removeItem(CLAVE_REFRESH_TOKEN);
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
