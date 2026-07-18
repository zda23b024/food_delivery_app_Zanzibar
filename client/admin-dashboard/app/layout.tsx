import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zanmart Admin Dashboard",
  description: "Platform operations dashboard for Zanmart administrators."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AdminShell>{children}</AdminShell>
        </AuthProvider>
      </body>
    </html>
  );
}
