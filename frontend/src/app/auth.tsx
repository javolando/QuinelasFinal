import React, { createContext, useContext, useEffect, useState } from "react";
import { api, apiMe, User } from "./api";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const u = await apiMe();
    setUser(u);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email: string, password: string) {
    await api.post("/auth/login", { email, password });
    await refresh();
  }

  async function register(name: string, email: string, password: string) {
    await api.post("/auth/register", { name, email, password });
    await refresh();
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
