"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { restaurantApi } from "@/services/api";

type RestaurantUser = {
  id: string;
  full_name: string;
  phone_number: string;
  role: string;
  preferred_language: string;
};

type AuthContextValue = {
  user: RestaurantUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "zanmeal-restaurant-access-token";
const REFRESH_KEY = "zanmeal-restaurant-refresh-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RestaurantUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    setAccessToken(token);
    if (!token) {
      setLoading(false);
      return;
    }
    restaurantApi
      .me(token)
      .then((profile) => setUser(profile as RestaurantUser))
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_KEY);
        setAccessToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      async login(phoneNumber, password) {
        const tokens = await restaurantApi.login({ phone_number: phoneNumber, password });
        window.localStorage.setItem(TOKEN_KEY, tokens.access_token);
        window.localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
        setAccessToken(tokens.access_token);
        const profile = await restaurantApi.me(tokens.access_token);
        setUser(profile as RestaurantUser);
      },
      logout() {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_KEY);
        setAccessToken(null);
        setUser(null);
      }
    }),
    [accessToken, loading, user]
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
