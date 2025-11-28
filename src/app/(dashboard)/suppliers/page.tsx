import type { Metadata } from "next";
import SuppliersManagement from "./suppliers-management";

export const metadata: Metadata = {
  title: "Suppliers - Shop Management",
  description: "Manage suppliers",
};

export default function SuppliersPage() {
  return <SuppliersManagement />;
}

