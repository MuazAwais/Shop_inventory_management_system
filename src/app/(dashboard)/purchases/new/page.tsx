import type { Metadata } from "next";
import NewPurchaseForm from "./new-purchase-form";

export const metadata: Metadata = {
  title: "New Purchase - Shop Management",
  description: "Create a new purchase",
};

export default function NewPurchasePage() {
  return <NewPurchaseForm />;
}

