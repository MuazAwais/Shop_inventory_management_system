import type { Metadata } from "next";
import ReceiptDetail from "./receipt-detail";

export const metadata: Metadata = {
  title: "Receipt - Shop Management",
  description: "View sale receipt",
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Handle both sync and async params (Next.js 13-14 vs 15+)
  const resolvedParams = await Promise.resolve(params);
  return <ReceiptDetail saleId={resolvedParams.id} />;
}

