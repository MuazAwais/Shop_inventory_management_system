import type { Metadata } from "next";
import SalesPos from "./sales-pos";

export const metadata: Metadata = {
  title: "Sales POS - Shop Management",
  description: "Point of sale interface for creating sales records",
};

export default function SalesPage() {
  return <SalesPos />;
}
