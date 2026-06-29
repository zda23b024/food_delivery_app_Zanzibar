"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type UserResponse } from "@/services/api";

type RegisterInput = {
  full_name: string;
  email?: string;
  phone_number: string;
  preferred_language: string;
  password: string;
};

type AuthContextValue = {
  user: UserResponse | null;
  accessToken: string | null;
  loading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ACCESS_TOKEN_KEY = "zanmeal-access-token";
const REFRESH_TOKEN_KEY = "zanmeal-refresh-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
    setAccessToken(storedAccessToken);
    setRefreshToken(storedRefreshToken);

    if (!storedAccessToken) {
      setLoading(false);
      return;
    }

    api
      .me(storedAccessToken)
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        setAccessToken(null);
        setRefreshToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function storeTokens(access: string, refresh: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      async login(phoneNumber, password) {
        const tokens = await api.login({ phone_number: phoneNumber, password });
        storeTokens(tokens.access_token, tokens.refresh_token);
        const profile = await api.me(tokens.access_token);
        setUser(profile);
      },
      async register(input) {
        await api.register({ ...input, role: "customer" });
        const tokens = await api.login({ phone_number: input.phone_number, password: input.password });
        storeTokens(tokens.access_token, tokens.refresh_token);
        const profile = await api.me(tokens.access_token);
        setUser(profile);
      },
      async logout() {
        if (refreshToken) {
          await api.logout(refreshToken).catch(() => undefined);
        }
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      }
    }),
    [accessToken, loading, refreshToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
