import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardShell } from "@/components/DashboardShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZanMeal Restaurant Dashboard",
  description: "Restaurant operations dashboard for ZanMeal vendors."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DashboardShell>{children}</DashboardShell>
        </AuthProvider>
      </body>
    </html>
  );
}
