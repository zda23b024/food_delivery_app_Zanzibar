"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, type FavoriteResponse } from "@/services/api";

type FavoriteStorage = {
  foodIds: string[];
  restaurantIds: string[];
};

type FavoriteContextValue = {
  favoriteFoodIds: string[];
  favoriteRestaurantIds: string[];
  isFavoriteFood: (foodId: string) => boolean;
  isFavoriteRestaurant: (restaurantId: string) => boolean;
  toggleFoodFavorite: (foodId: string) => void;
  toggleRestaurantFavorite: (restaurantId: string) => void;
};

const FavoriteContext = createContext<FavoriteContextValue | undefined>(undefined);
const STORAGE_KEY = "zanmart-favorites";

function favoriteKey(type: "food" | "restaurant", id: string) {
  return `${type}:${id}`;
}

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>([]);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>([]);
  const [favoriteIdMap, setFavoriteIdMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as FavoriteStorage;
      setFavoriteFoodIds(Array.isArray(parsed.foodIds) ? parsed.foodIds : []);
      setFavoriteRestaurantIds(Array.isArray(parsed.restaurantIds) ? parsed.restaurantIds : []);
    } catch {
      setFavoriteFoodIds([]);
      setFavoriteRestaurantIds([]);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    api
      .getFavorites(accessToken)
      .then((favorites) => {
        const foodIds = new Set(favoriteFoodIds);
        const restaurantIds = new Set(favoriteRestaurantIds);
        const idMap: Record<string, string> = {};

        favorites.forEach((favorite) => {
          if (favorite.food_item_id) {
            foodIds.add(favorite.food_item_id);
            idMap[favoriteKey("food", favorite.food_item_id)] = favorite.id;
          }
          if (favorite.restaurant_id) {
            restaurantIds.add(favorite.restaurant_id);
            idMap[favoriteKey("restaurant", favorite.restaurant_id)] = favorite.id;
          }
        });

        setFavoriteFoodIds(Array.from(foodIds));
        setFavoriteRestaurantIds(Array.from(restaurantIds));
        setFavoriteIdMap(idMap);
      })
      .catch(() => {
        // Ignore failures for favorite sync. Local state remains available.
      });
  }, [accessToken]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ foodIds: favoriteFoodIds, restaurantIds: favoriteRestaurantIds })
    );
  }, [favoriteFoodIds, favoriteRestaurantIds]);

  const value = useMemo<FavoriteContextValue>(() => {
    async function toggleFoodFavorite(foodId: string) {
      const isFavorite = favoriteFoodIds.includes(foodId);
      setFavoriteFoodIds((current) =>
        current.includes(foodId) ? current.filter((id) => id !== foodId) : [...current, foodId]
      );

      if (!accessToken) {
        return;
      }

      const key = favoriteKey("food", foodId);
      if (isFavorite) {
        const favoriteId = favoriteIdMap[key];
        if (favoriteId) {
          await api.removeFavorite(favoriteId, accessToken).catch(() => undefined);
          setFavoriteIdMap((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
        }
      } else {
        const saved = await api.saveFavorite({ food_item_id: foodId }, accessToken).catch(() => undefined);
        if (saved?.id) {
          setFavoriteIdMap((current) => ({ ...current, [key]: saved.id }));
        }
      }
    }

    async function toggleRestaurantFavorite(restaurantId: string) {
      const isFavorite = favoriteRestaurantIds.includes(restaurantId);
      setFavoriteRestaurantIds((current) =>
        current.includes(restaurantId)
          ? current.filter((id) => id !== restaurantId)
          : [...current, restaurantId]
      );

      if (!accessToken) {
        return;
      }

      const key = favoriteKey("restaurant", restaurantId);
      if (isFavorite) {
        const favoriteId = favoriteIdMap[key];
        if (favoriteId) {
          await api.removeFavorite(favoriteId, accessToken).catch(() => undefined);
          setFavoriteIdMap((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
        }
      } else {
        const saved = await api.saveFavorite({ restaurant_id: restaurantId }, accessToken).catch(() => undefined);
        if (saved?.id) {
          setFavoriteIdMap((current) => ({ ...current, [key]: saved.id }));
        }
      }
    }

    return {
      favoriteFoodIds,
      favoriteRestaurantIds,
      isFavoriteFood: (foodId: string) => favoriteFoodIds.includes(foodId),
      isFavoriteRestaurant: (restaurantId: string) => favoriteRestaurantIds.includes(restaurantId),
      toggleFoodFavorite,
      toggleRestaurantFavorite
    };
  }, [accessToken, favoriteFoodIds, favoriteIdMap, favoriteRestaurantIds]);

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoriteProvider");
  }
  return context;
}
