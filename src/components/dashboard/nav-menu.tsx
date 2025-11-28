"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
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

export default function NavMenu({ userRole }: { userRole: string }) {
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
    <NavigationMenu.Root className="relative z-10">
      <NavigationMenu.List className="flex flex-wrap gap-2">
        {Object.entries(groupedItems).map(([category, items]) => (
          <NavigationMenu.Item key={category} className="relative">
            <NavigationMenu.Trigger className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
              {categoryLabels[category] || category}
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg p-2">
              <div className="grid gap-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-accent text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

