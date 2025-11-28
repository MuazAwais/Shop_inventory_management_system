import type { Metadata } from "next";
import CategoriesManagement from "./categories-management";

export const metadata: Metadata = {
  title: "Categories - Shop Management",
  description: "Manage product categories",
};

export default function CategoriesPage() {
  return <CategoriesManagement />;
}

