import axios, { isAxiosError } from "axios";

export const TOKEN_STORAGE_KEY = "nagrikos.token";

/** Turn an axios/unknown error into a human-readable message for the UI. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (error.response) {
      const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
      if (typeof detail === "string" && detail.trim()) return detail;
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0] as { msg?: string };
        if (first?.msg) return first.msg;
      }
      // Handle array of errors (FastAPI validation errors)
      const errors = (error.response.data as { detail?: { msg: string }[] } | undefined)?.detail;
      if (Array.isArray(errors) && errors.length > 0 && errors[0]?.msg) {
        return errors[0].msg;
      }
      return fallback;
    }
    if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
      return "Cannot reach the server. Please make sure the backend is running.";
    }
    return fallback;
  }
  return fallback;
}

function resolveBaseUrl(): string {
  if (typeof window !== "undefined") {
    // In browser: use VITE_API_BASE_URL env var, or detect from current origin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromEnv = (import.meta as any)?.env as Record<string, string> | undefined;
    if (fromEnv?.VITE_API_BASE_URL && fromEnv.VITE_API_BASE_URL.trim()) {
      return fromEnv.VITE_API_BASE_URL.replace(/\/$/, "");
    }
  }
  // Default to localhost for development
  return "http://localhost:8000";
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
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && !error.response) {
      // Network error — backend might be down
      console.error("Backend unreachable:", error.message);
    }
    return Promise.reject(error);
  },
);
