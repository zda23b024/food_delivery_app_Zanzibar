"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/services/api";

type AdminUser = {
  id: string;
  full_name: string;
  role: string;
  phone_number: string;
};

type AuthContextValue = {
  user: AdminUser | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "zanmart-admin-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    setToken(stored);
    if (stored) {
      adminApi.me(stored).then((profile) => setUser(profile as AdminUser)).catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      });
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    async login(phone, password) {
      const tokens = await adminApi.login({ phone_number: phone, password });
      window.localStorage.setItem(TOKEN_KEY, tokens.access_token);
      setToken(tokens.access_token);
      const profile = await adminApi.me(tokens.access_token);
      setUser(profile as AdminUser);
    },
    logout() {
      window.localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
