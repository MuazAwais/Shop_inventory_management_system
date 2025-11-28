import type { Metadata } from "next";
import PurchaseDetail from "./purchase-detail";

export const metadata: Metadata = {
  title: "Purchase Detail - Shop Management",
  description: "View purchase details",
};

export default function PurchaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <PurchaseDetail purchaseId={params.id} />;
}

