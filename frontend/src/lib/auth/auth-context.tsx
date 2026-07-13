import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setStoredToken, getStoredToken } from "@/lib/api/client";
import type { User } from "@/types";

const USER_STORAGE_KEY = "nagrikos.user";

interface BackendUser {
  id: number;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  created_at: string;
}

interface AuthResponsePayload {
  user: BackendUser;
  access_token: string;
  token_type: string;
}

function mapUser(u: BackendUser): User {
  return {
    id: String(u.id),
    email: u.email,
    fullName: u.full_name ?? "",
    createdAt: u.created_at,
    is_active: u.is_active,
  };
}

interface AuthValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const token = getStoredToken();
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    // Show the cached user immediately for a snappy refresh...
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        setUser(null);
      }
    }
    // ...then validate the token against the backend and refresh the user.
    api
      .get<BackendUser>("/auth/me")
      .then(({ data }) => {
        const mapped = mapUser(data);
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mapped));
        setUser(mapped);
      })
      .catch(() => {
        // Invalid/expired token: clear stored auth so protected routes redirect.
        setStoredToken(null);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((payload: AuthResponsePayload) => {
    const mapped = mapUser(payload.user);
    setStoredToken(payload.access_token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mapped));
    }
    setUser(mapped);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const { data } = await api.post<AuthResponsePayload>("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      persist(data);
    },
    [persist],
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { data } = await api.post<AuthResponsePayload>("/auth/register", {
        email,
        password,
        full_name: fullName,
      });
      persist(data);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    setStoredToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, isAuthenticated: !!user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
