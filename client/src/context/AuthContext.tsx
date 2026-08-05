import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiError, getAuthToken, setAuthToken } from "../lib/api";

interface AuthUser {
  id: number;
  displayName: string;
}

interface LoginResponse extends AuthUser {
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (displayName: string, passcode: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    api
      .get<AuthUser>("/auth/me")
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) setAuthToken(null);
        else console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(displayName: string, passcode: string) {
    const { token, ...loggedInUser } = await api.post<LoginResponse>("/auth/login", { displayName, passcode });
    setAuthToken(token);
    setUser(loggedInUser);
  }

  async function logout() {
    await api.post("/auth/logout");
    setAuthToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
