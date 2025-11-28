"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  TrendingUp,
  DollarSign,
  Box,
  UserCog,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: TrendingUp, category: "main" },
  {
    href: "/shop-profile",
    label: "Shop Profile",
    icon: Settings,
    category: "settings",
    roles: ["admin", "manager"],
  },
  {
    href: "/branches",
    label: "Branches",
    icon: Box,
    category: "settings",
    roles: ["admin", "manager"],
  },
  {
    href: "/categories",
    label: "Categories",
    icon: Package,
    category: "catalog",
  },
  {
    href: "/brands",
    label: "Brands",
    icon: ShoppingBag,
    category: "catalog",
  },
  {
    href: "/products",
    label: "Products",
    icon: Package,
    category: "catalog",
  },
  {
    href: "/suppliers",
    label: "Suppliers",
    icon: Users,
    category: "parties",
  },
  {
    href: "/customers",
    label: "Customers",
    icon: Users,
    category: "parties",
  },
  {
    href: "/sales",
    label: "Sales POS",
    icon: ShoppingCart,
    category: "transactions",
  },
  {
    href: "/purchases",
    label: "Purchases",
    icon: DollarSign,
    category: "transactions",
  },
  {
    href: "/stock-adjustments",
    label: "Stock Adjustments",
    icon: Box,
    category: "inventory",
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: FileText,
    category: "transactions",
  },
  {
    href: "/expense-categories",
    label: "Expense Categories",
    icon: Settings,
    category: "settings",
    roles: ["admin"],
  },
  {
    href: "/users",
    label: "Users",
    icon: UserCog,
    category: "settings",
    roles: ["admin"],
  },
];

const categoryLabels: Record<string, string> = {
  main: "Main",
  catalog: "Catalog",
  parties: "Parties",
  transactions: "Transactions",
  inventory: "Inventory",
  settings: "Settings",
};

export default function DashboardNav({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  // Filter items based on user role
  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  // Group items by category
  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      const category = item.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, NavItem[]>
  );

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {Object.entries(groupedItems).map(([category, items]) => {
        // If category has only one item (main), render as direct link
        if (items.length === 1 && category === "main") {
          const item = items[0];
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        }

        // Render as dropdown for categories with multiple items
        return (
          <DropdownMenu.Root key={category}>
            <DropdownMenu.Trigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                  "data-[state=open]:bg-accent data-[state=open]:text-foreground"
                )}
              >
                {categoryLabels[category] || category}
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-popover border border-border rounded-lg shadow-lg p-2 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                sideOffset={5}
              >
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <DropdownMenu.Item key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer outline-none",
                          isActive
                            ? "bg-accent text-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenu.Item>
                  );
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        );
      })}
    </nav>
  );
}
