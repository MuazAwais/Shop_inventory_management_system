import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./dashboard/logout-button";
import DashboardNav from "@/components/dashboard/dashboard-nav";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - Shop Management",
  description: "Shop management dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    const auth = await requireAuth();
    user = auth.user;
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
              >
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span>Shop Management</span>
              </Link>
              <div className="hidden lg:block">
                <DashboardNav userRole={user.role || "cashier"} />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {user.username} ({user.role})
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

