import type { Metadata } from "next";
import BrandsManagement from "./brands-management";

export const metadata: Metadata = {
  title: "Brands - Shop Management",
  description: "Manage product brands",
};

export default function BrandsPage() {
  return <BrandsManagement />;
}

