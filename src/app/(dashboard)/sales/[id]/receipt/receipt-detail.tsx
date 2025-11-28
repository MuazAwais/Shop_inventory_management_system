"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  qty: number | null;
  unitPrice: number | null;
  discountPerItem: number | null;
  gstPercent: number | null;
  totalPrice: number | null;
  product: {
    id: number;
    code: string | null;
    nameEn: string | null;
    nameUr: string | null;
    barcode: string | null;
  } | null;
}

interface Sale {
  id: number;
  branchId: number | null;
  customerId: number | null;
  invoiceNo: string | null;
  saleDate: number | null;
  subtotal: number | null;
  discountAmount: number | null;
  gstAmount: number | null;
  furtherTaxAmount: number | null;
  totalAmount: number | null;
  paidAmount: number | null;
  paymentMethod: string | null;
  paymentDetails: unknown;
  isCreditSale: boolean | null;
  fbrInvoiceNumber: number | null;
  createdBy: number | null;
}

interface Customer {
  id: number;
  name: string | null;
  phone: string | null;
  cnic: string | null;
  address: string | null;
}

interface Branch {
  id: number;
  branchNameEn: string | null;
  branchNameUr: string | null;
  addressEn: string | null;
  addressUr: string | null;
  phone: string | null;
}

interface ShopProfile {
  id: number;
  shopNameEn: string | null;
  shopNameUr: string | null;
  ownerName: string | null;
  ntn: string | null;
  strn: string | null;
  phone1: string | null;
  phone2: string | null;
  addressEn: string | null;
  addressUr: string | null;
  fbrPosId: string | null;
  logoUrl: string | null;
}

interface ReceiptData {
  sale: Sale;
  items: SaleItem[];
  customer: Customer | null;
  branch: Branch | null;
  shopProfile: ShopProfile | null;
  user: { id: number; name: string | null; username: string | null } | null;
}

export default function ReceiptDetail({ saleId }: { saleId: string }) {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReceipt();
  }, [saleId]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales/${saleId}/receipt`);
      const data = await response.json();

      if (data.success) {
        setReceiptData(data.data);
      } else {
        setError(data.error || "Failed to fetch receipt");
      }
    } catch (err) {
      setError("An error occurred while fetching receipt");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "0.00";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receiptData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link
            href="/sales"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sales
          </Link>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">
            {error || "Receipt not found"}
          </p>
        </div>
      </div>
    );
  }

  const { sale, items, customer, branch, shopProfile, user } = receiptData;

  return (
    <div className="space-y-6">
      {/* Action buttons - hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
          <Link
            href="/sales"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sales
          </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      </div>

      {/* Receipt Content */}
      <div className="max-w-2xl mx-auto bg-white border rounded-lg shadow-sm p-8 print:shadow-none print:border-0 print:max-w-[80mm] print:mx-0 receipt-80mm">
        {/* Shop Header */}
        <div className="text-center mb-6 border-b pb-4">
          {shopProfile?.logoUrl && (
            <img
              src={shopProfile.logoUrl}
              alt="Shop Logo"
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold">
            {shopProfile?.shopNameEn || "Shop Name"}
          </h1>
          {shopProfile?.shopNameUr && (
            <p className="text-lg text-muted-foreground mt-1">
              {shopProfile.shopNameUr}
            </p>
          )}
          {shopProfile?.addressEn && (
            <p className="text-sm text-muted-foreground mt-2">
              {shopProfile.addressEn}
            </p>
          )}
          <div className="flex justify-center gap-4 mt-2 text-sm text-muted-foreground">
            {shopProfile?.phone1 && <span>Tel: {shopProfile.phone1}</span>}
            {shopProfile?.phone2 && <span>Tel: {shopProfile.phone2}</span>}
          </div>
          {(shopProfile?.ntn || shopProfile?.strn) && (
            <div className="flex justify-center gap-4 mt-1 text-xs text-muted-foreground">
              {shopProfile.ntn && <span>NTN: {shopProfile.ntn}</span>}
              {shopProfile.strn && <span>STRN: {shopProfile.strn}</span>}
            </div>
          )}
        </div>

        {/* Branch Info */}
        {branch && (
          <div className="text-center mb-4 text-sm">
            <p className="font-semibold">
              {branch.branchNameEn || "Branch"}
            </p>
            {branch.addressEn && (
              <p className="text-muted-foreground">{branch.addressEn}</p>
            )}
            {branch.phone && (
              <p className="text-muted-foreground">Tel: {branch.phone}</p>
            )}
          </div>
        )}

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-muted-foreground">Invoice No:</p>
            <p className="font-semibold">{sale.invoiceNo || "N/A"}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Date:</p>
            <p className="font-semibold">{formatDate(sale.saleDate)}</p>
          </div>
          {sale.fbrInvoiceNumber && (
            <div>
              <p className="text-muted-foreground">FBR Invoice:</p>
              <p className="font-semibold">{sale.fbrInvoiceNumber}</p>
            </div>
          )}
          {user && (
            <div className="text-right">
              <p className="text-muted-foreground">Cashier:</p>
              <p className="font-semibold">{user.name || user.username}</p>
            </div>
          )}
        </div>

        {/* Customer Info */}
        {customer && (
          <div className="mb-6 p-3 bg-muted rounded-md text-sm">
            <p className="font-semibold mb-2">Customer Details:</p>
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              {customer.name || "N/A"}
            </p>
            {customer.phone && (
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {customer.phone}
              </p>
            )}
            {customer.cnic && (
              <p>
                <span className="text-muted-foreground">CNIC:</span>{" "}
                {customer.cnic}
              </p>
            )}
            {customer.address && (
              <p>
                <span className="text-muted-foreground">Address:</span>{" "}
                {customer.address}
              </p>
            )}
          </div>
        )}

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 px-1">Item</th>
                <th className="text-right py-1 px-1">Qty</th>
                <th className="text-right py-1 px-1">Price</th>
                <th className="text-right py-1 px-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="py-1 px-1">
                    <div>
                      <p className="font-medium text-xs">
                        {item.product?.nameEn || `Product #${item.productId}`}
                      </p>
                      {item.product?.code && (
                        <p className="text-xs text-muted-foreground">
                          {item.product.code}
                        </p>
                      )}
                      {(item.discountPerItem && item.discountPerItem > 0) && (
                        <p className="text-xs text-muted-foreground">
                          Disc: {formatCurrency((item.discountPerItem || 0) * (item.qty || 0))} | GST: {item.gstPercent?.toFixed(0) || "0"}%
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-1 px-1 text-xs">
                    {item.qty?.toFixed(2) || "0.00"}
                  </td>
                  <td className="text-right py-1 px-1 text-xs">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="text-right py-1 px-1 font-semibold text-xs">
                    {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-semibold">
              {formatCurrency(sale.subtotal)}
            </span>
          </div>
          {sale.discountAmount && sale.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount:</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(sale.discountAmount)}
              </span>
            </div>
          )}
          {sale.gstAmount && sale.gstAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST:</span>
              <span className="font-semibold">
                {formatCurrency(sale.gstAmount)}
              </span>
            </div>
          )}
          {sale.furtherTaxAmount && sale.furtherTaxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Further Tax:</span>
              <span className="font-semibold">
                {formatCurrency(sale.furtherTaxAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Total Amount:</span>
            <span>{formatCurrency(sale.totalAmount)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-6 p-3 bg-muted rounded-md text-sm">
          <p className="font-semibold mb-2">Payment Information:</p>
          <div className="space-y-1">
            <p>
              <span className="text-muted-foreground">Method:</span>{" "}
              <span className="font-semibold capitalize">
                {sale.paymentMethod?.replace("_", " ") || "N/A"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Paid Amount:</span>{" "}
              <span className="font-semibold">
                {formatCurrency(sale.paidAmount)}
              </span>
            </p>
            {sale.isCreditSale && (
              <p className="text-orange-600 font-semibold">
                Credit Sale - Balance:{" "}
                {formatCurrency(
                  (sale.totalAmount || 0) - (sale.paidAmount || 0)
                )}
              </p>
            )}
            {sale.paymentMethod === "mixed" &&
              sale.paymentDetails &&
              typeof sale.paymentDetails === "object" &&
              "parts" in sale.paymentDetails &&
              Array.isArray((sale.paymentDetails as { parts: unknown[] }).parts) ? (
                <div className="mt-2">
                  <p className="text-muted-foreground mb-1">
                    Payment Breakdown:
                  </p>
                  {((sale.paymentDetails as { parts: Array<{ method: string; amount: number }> }).parts).map(
                    (part, idx) => (
                      <p key={idx} className="text-xs">
                        {part.method}: {formatCurrency(part.amount)}
                      </p>
                    )
                  )}
                </div>
              ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground border-t pt-4 mt-6">
          <p>Thank you for your business!</p>
          <p className="mt-2">
            For inquiries, please contact us at{" "}
            {shopProfile?.phone1 || branch?.phone || "N/A"}
          </p>
          {shopProfile?.fbrPosId && (
            <p className="mt-1">FBR POS ID: {shopProfile.fbrPosId}</p>
          )}
        </div>
      </div>
    </div>
  );
}

