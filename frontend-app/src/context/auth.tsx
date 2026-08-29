import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types";
import { api } from "../lib/api";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Restore the existing session when the app starts
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await api.me();
        setUserState(user);
      } catch {
        setUserState(null);
      } finally {
        setReady(true);
      }
    };

    restoreSession();
  }, []);

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      setUser,
    }),
    [user, ready, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
