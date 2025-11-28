import type { Metadata } from "next";
import ProductsManagement from "./products-management";

export const metadata: Metadata = {
  title: "Products - Shop Management",
  description: "Manage products",
};

export default function ProductsPage() {
  return <ProductsManagement />;
}

