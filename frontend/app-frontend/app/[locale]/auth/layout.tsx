import type { Metadata } from "next";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export const metadata: Metadata = {
  title: "Chill Numbers",
  description: "Inicia sesión o crea tu cuenta de Chill Numbers.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout relative">
      {/* Language switcher — top-right corner, visible on all auth pages */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher variant="compact" />
      </div>
      {children}
    </div>
  );
}
