import axios from "axios";

export const TOKEN_STORAGE_KEY = "nagrikos.token";

function resolveBaseUrl(): string {
  const fromEnv =
    typeof import.meta !== "undefined"
      ? (import.meta.env?.VITE_API_BASE_URL as string | undefined)
      : undefined;
  return (fromEnv ?? "http://localhost:8000").replace(/\/$/, "");
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export const api = axios.create({
  baseURL: `${resolveBaseUrl()}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
