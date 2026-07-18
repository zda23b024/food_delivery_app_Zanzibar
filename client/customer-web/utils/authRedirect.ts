export function getRoleDestination(role?: string | null, fallback = "/profile") {
  const normalized = (role || "").toLowerCase();
  if (normalized === "restaurant") {
    return process.env.NEXT_PUBLIC_RESTAURANT_DASHBOARD_URL || "http://localhost:3001";
  }
  if (normalized === "administrator" || normalized === "admin") {
    return process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || "http://localhost:3002";
  }
  if (normalized === "rider") {
    return process.env.NEXT_PUBLIC_RIDER_APP_URL || "/profile?rider_app=true";
  }
  return fallback;
}

export function navigateByRole(role: string | undefined | null, fallback: string, push: (path: string) => void) {
  const destination = getRoleDestination(role, fallback);
  if (destination.startsWith("http")) {
    window.location.href = destination;
    return;
  }
  push(destination);
}
