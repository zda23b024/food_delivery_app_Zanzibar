"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type UserResponse } from "@/services/api";

type RegisterInput = {
  full_name: string;
  email?: string;
  phone_number: string;
  preferred_language: string;
  password: string;
  role: "customer" | "restaurant" | "rider";
  location?: {
    street_address?: string;
    area?: string;
    city?: string;
    island?: string;
    landmark?: string;
    delivery_notes?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  verification?: {
    document?: File | null;
    document_type?: string;
    business_name?: string;
    certificate_number?: string;
    tax_id?: string;
    business_address?: string;
    service_area?: string;
    vehicle_type?: string;
    vehicle_plate_number?: string;
    license_number?: string;
    national_id_number?: string;
    notes?: string;
  };
};

type AuthContextValue = {
  user: UserResponse | null;
  accessToken: string | null;
  loading: boolean;
  login: (phoneNumber: string, password: string) => Promise<UserResponse>;
  register: (input: RegisterInput) => Promise<UserResponse>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ACCESS_TOKEN_KEY = "zanmart-access-token";
const REFRESH_TOKEN_KEY = "zanmart-refresh-token";

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

    if (!storedAccessToken && !storedRefreshToken) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        if (storedAccessToken) {
          const profile = await api.me(storedAccessToken);
          setUser(profile);
          setLoading(false);
          return;
        }

        throw new Error("No access token");
      } catch {
        if (!storedRefreshToken) {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
          window.localStorage.removeItem(REFRESH_TOKEN_KEY);
          setAccessToken(null);
          setRefreshToken(null);
          setLoading(false);
          return;
        }

        try {
          const refreshed = await api.refresh(storedRefreshToken);
          storeTokens(refreshed.access_token, refreshed.refresh_token);
          const profile = await api.me(refreshed.access_token);
          setUser(profile);
        } catch {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
          window.localStorage.removeItem(REFRESH_TOKEN_KEY);
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
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
        return profile;
      },
      async register(input) {
        await api.register(input);
        const tokens = await api.login({ phone_number: input.phone_number, password: input.password });
        storeTokens(tokens.access_token, tokens.refresh_token);
        const profile = await api.me(tokens.access_token);
        setUser(profile);

        if (input.location && (input.location.street_address || input.location.area)) {
          try {
            await api.createAddress(
              {
                street_address: input.location.street_address,
                area: input.location.area,
                city: input.location.city ?? "Zanzibar",
                island: input.location.island ?? "Unguja",
                landmark: input.location.landmark,
                delivery_notes: input.location.delivery_notes,
                latitude: input.location.latitude,
                longitude: input.location.longitude,
                is_default: true
              },
              tokens.access_token
            );
          } catch {
            // Location details are optional and should not block registration.
          }
        }
        if (input.verification?.document && input.role !== "customer") {
          const formData = new FormData();
          formData.append("role", input.role);
          formData.append("document_type", input.verification.document_type || (input.role === "restaurant" ? "business_certificate" : "rider_identity"));
          formData.append("document", input.verification.document);
          Object.entries(input.verification).forEach(([key, value]) => {
            if (key !== "document" && value) {
              formData.append(key, String(value));
            }
          });
          await api.uploadVerificationDocument(formData, tokens.access_token);
        }
        return profile;
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
