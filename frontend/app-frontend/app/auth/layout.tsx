import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Chill Numbers",
  description: "Sign in or create your Chill Numbers account to start managing your finances with ease.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}