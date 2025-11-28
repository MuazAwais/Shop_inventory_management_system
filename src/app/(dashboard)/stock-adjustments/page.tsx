import type { Metadata } from "next";
import StockAdjustmentsList from "./stock-adjustments-list";

export const metadata: Metadata = {
  title: "Stock Adjustments - Shop Management",
  description: "View and manage stock adjustments",
};

export default function StockAdjustmentsPage() {
  return <StockAdjustmentsList />;
}

