import type { Metadata } from "next";
import AuthLayoutWrapper from "./auth-layout-wrapper";

export const metadata: Metadata = {
  title: "Authentication - Shop Management",
  description: "Login and authentication pages",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10">
      <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
    </div>
  );
}

