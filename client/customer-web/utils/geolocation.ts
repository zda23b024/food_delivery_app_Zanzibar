import { api, type ReverseGeocodeResponse } from "@/services/api";

export type BrowserLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: ReverseGeocodeResponse;
};

export function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Browser GPS location is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 15000
    });
  });
}

export async function getCurrentGpsLocation(): Promise<BrowserLocation> {
  const position = await getBrowserPosition();
  const latitude = Number(position.coords.latitude.toFixed(6));
  const longitude = Number(position.coords.longitude.toFixed(6));
  let address: ReverseGeocodeResponse | undefined;

  try {
    address = await api.reverseGeocode(latitude, longitude);
  } catch {
    address = undefined;
  }

  return {
    latitude,
    longitude,
    accuracy: position.coords.accuracy,
    address
  };
}
