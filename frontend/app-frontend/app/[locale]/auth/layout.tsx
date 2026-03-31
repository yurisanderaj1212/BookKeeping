import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chill Numbers",
  description: "Inicia sesión o crea tu cuenta de Chill Numbers.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Language switcher is now embedded inside each auth page
  // to avoid absolute positioning that creates dead space on mobile
  return <>{children}</>
}
