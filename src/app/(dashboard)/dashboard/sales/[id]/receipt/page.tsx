import { redirect } from "next/navigation";

/**
 * Redirect from /dashboard/sales/[id]/receipt to /sales/[id]/receipt
 * Route groups like (dashboard) don't appear in URLs
 */
export default async function ReceiptRedirect({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  redirect(`/sales/${resolvedParams.id}/receipt`);
}

