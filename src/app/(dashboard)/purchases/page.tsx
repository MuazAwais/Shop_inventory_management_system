import type { Metadata } from "next";
import PurchasesList from "./purchases-list";

export const metadata: Metadata = {
  title: "Purchases - Shop Management",
  description: "View and manage purchases",
};

export default function PurchasesPage() {
  return <PurchasesList />;
}

