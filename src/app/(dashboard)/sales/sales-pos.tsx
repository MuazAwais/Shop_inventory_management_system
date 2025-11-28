"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@/types";

interface PosProduct {
  id: number;
  code: string | null;
  barcode: string | null;
  nameEn: string | null;
  sellingPrice: number | null;
  gstPercent: number | null;
  stockQty: number | null;
}

interface SaleItemRow {
  id: string; // local row id
  productId: number;
  code: string | null;
  name: string | null;
  qty: number;
  unitPrice: number;
  discountPerItem: number;
  gstPercent: number;
}

interface PaymentPart {
  id: string;
  method: Exclude<PaymentMethod, "credit" | "mixed" | "cheque" | "jazzcash" | "easypaisa">;
  amount: number;
}

function generateRowId() {
  return Math.random().toString(36).slice(2);
}

function generateInvoiceNo() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `POS-${datePart}-${timePart}`;
}

export default function SalesPos() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [items, setItems] = useState<SaleItemRow[]>([]);
  const [invoiceNo, setInvoiceNo] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentParts, setPaymentParts] = useState<PaymentPart[]>([
    { id: generateRowId(), method: "cash", amount: 0 },
  ]);
  const [cardReference, setCardReference] = useState("");
  const [transferReference, setTransferReference] = useState("");
  const [fbrInvoiceNumber, setFbrInvoiceNumber] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>(""); // optional, can be wired later
  const [customerName, setCustomerName] = useState<string>(""); // optional customer name for receipt
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Generate invoice number only on the client to avoid SSR/client mismatches
  useEffect(() => {
    setInvoiceNo(generateInvoiceNo());
  }, []);

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;

    for (const item of items) {
      const lineSubtotal = item.unitPrice * item.qty;
      const lineDiscount = item.discountPerItem * item.qty;
      const taxable = lineSubtotal - lineDiscount;
      const lineGst = taxable * (item.gstPercent / 100);

      subtotal += lineSubtotal;
      totalDiscount += lineDiscount;
      totalGst += lineGst;
    }

    const grandTotal = subtotal - totalDiscount + totalGst;

    return {
      subtotal,
      totalDiscount,
      totalGst,
      grandTotal,
    };
  }, [items]);

  const mixedPaidTotal = useMemo(
    () => paymentParts.reduce((sum, part) => sum + (part.amount || 0), 0),
    [paymentParts],
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setError("");

      const params = new URLSearchParams({ query: searchQuery.trim() });
      const response = await fetch(`/api/products/search?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || data.message || "Failed to search products");
        setSearchResults([]);
        return;
      }

      setSearchResults(data.data || []);
    } catch (err) {
      setError("An error occurred while searching products");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddProduct = (product: PosProduct) => {
    if (!product.id) return;

    setItems((prev) => {
      const existing = prev.find((row) => row.productId === product.id);
      if (existing) {
        return prev.map((row) =>
          row.productId === product.id
            ? { ...row, qty: row.qty + 1 }
            : row,
        );
      }

      const unitPrice = product.sellingPrice || 0;
      const gstPercent = product.gstPercent ?? 17;

      return [
        ...prev,
        {
          id: generateRowId(),
          productId: product.id,
          code: product.code,
          name: product.nameEn,
          qty: 1,
          unitPrice,
          discountPerItem: 0,
          gstPercent,
        },
      ];
    });

    setSearchResults([]);
    setSearchQuery("");
  };

  const updateItem = useCallback(
    (id: string, field: keyof Pick<SaleItemRow, "qty" | "unitPrice" | "discountPerItem" | "gstPercent">, value: number) => {
      setItems((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                [field]: Number.isNaN(value) || value < 0 ? 0 : value,
              }
            : row,
        ),
      );
    },
    [],
  );

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((row) => row.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setError("");
    setSuccessMessage("");
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setError("");

    if (method === "mixed") {
      setPaymentParts([
        { id: generateRowId(), method: "cash", amount: totals.grandTotal },
      ]);
    } else {
      setPaymentParts([{ id: generateRowId(), method: "cash", amount: totals.grandTotal }]);
    }
  };

  const updatePaymentPart = (id: string, field: "method" | "amount", value: string | number) => {
    setPaymentParts((prev) =>
      prev.map((part) =>
        part.id === id
          ? {
              ...part,
              [field]:
                field === "amount"
                  ? Number.isNaN(Number(value)) || Number(value) < 0
                    ? 0
                    : Number(value)
                  : value,
            }
          : part,
      ),
    );
  };

  const addPaymentPart = () => {
    setPaymentParts((prev) => [
      ...prev,
      { id: generateRowId(), method: "cash", amount: 0 },
    ]);
  };

  const removePaymentPart = (id: string) => {
    setPaymentParts((prev) => prev.filter((part) => part.id !== id));
  };

  const buildPaymentDetails = () => {
    if (paymentMethod === "mixed") {
      return {
        method: "mixed",
        total: totals.grandTotal,
        parts: paymentParts.map((part) => ({
          method: part.method,
          amount: part.amount,
        })),
      };
    }

    if (paymentMethod === "cash") {
      return {
        method: "cash",
        cashAmount: totals.grandTotal,
      };
    }

    if (paymentMethod === "card") {
      return {
        method: "card",
        amount: totals.grandTotal,
        reference: cardReference || undefined,
      };
    }

    if (paymentMethod === "bank_transfer") {
      return {
        method: "bank_transfer",
        amount: totals.grandTotal,
        reference: transferReference || undefined,
      };
    }

    if (paymentMethod === "credit") {
      return {
        method: "credit",
        amount: totals.grandTotal,
      };
    }

    return null;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    if (items.length === 0) {
      setError("Add at least one item to create a sale.");
      return;
    }

    if (totals.grandTotal <= 0) {
      setError("Total amount must be greater than zero.");
      return;
    }

    if (paymentMethod === "mixed") {
      const diff = Math.abs(totals.grandTotal - mixedPaidTotal);
      if (diff > 0.01) {
        setError("For mixed payments, the sum of parts must equal the total amount.");
        return;
      }
    }

    const paymentDetails = buildPaymentDetails();

    const parsedFbrInvoiceNumber = fbrInvoiceNumber
      ? Number(fbrInvoiceNumber)
      : undefined;

    const body = {
      // Branch will be inferred from authenticated user in the API; provide a placeholder
      branchId: 1,
      customerId: customerId ? Number(customerId) : undefined,
      customerName: customerName && customerName.trim() ? customerName.trim() : undefined,
      invoiceNo,
      items: items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        discountPerItem: item.discountPerItem,
        gstPercent: item.gstPercent,
      })),
      paymentMethod,
      paymentDetails,
      isCreditSale: paymentMethod === "credit",
      fbrInvoiceNumber:
        typeof parsedFbrInvoiceNumber === "number" && !Number.isNaN(parsedFbrInvoiceNumber)
          ? parsedFbrInvoiceNumber
          : undefined,
    };

    try {
      setSubmitting(true);
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || data.message || "Failed to create sale");
        return;
      }

      // Redirect to receipt page after successful sale
      if (data.data?.id) {
        router.push(`/sales/${data.data.id}/receipt`);
      } else {
        setSuccessMessage("Sale created successfully.");
        setItems([]);
        setSearchResults([]);
        setSearchQuery("");
        setInvoiceNo(generateInvoiceNo());
        setPaymentMethod("cash");
        setPaymentParts([
          { id: generateRowId(), method: "cash", amount: 0 },
        ]);
        setCardReference("");
        setTransferReference("");
        setFbrInvoiceNumber("");
        setCustomerId("");
      }
    } catch (err) {
      setError("An error occurred while creating the sale.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Point of Sale</h1>
          <p className="text-gray-600 text-sm">
            Create sales with product search, per-item discounts, GST, and flexible payments.
          </p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div className="font-semibold">Invoice</div>
          <div>{invoiceNo ?? "Generating..."}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Top bar: search + quick links */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product search (code / barcode / name)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Scan barcode or type to search..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-2 md:mt-6">
          <Link href="/products" className="text-indigo-600 hover:text-indigo-800">
            Manage Products →
          </Link>
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">Search results</h2>
            <button
              type="button"
              onClick={() => setSearchResults([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {searchResults.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleAddProduct(product)}
                className="w-full text-left px-2 py-2 hover:bg-indigo-50 flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {product.nameEn || "Unnamed product"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.code && <span className="mr-2">Code: {product.code}</span>}
                    {product.barcode && <span>Barcode: {product.barcode}</span>}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-600">
                  <div>Price: {formatCurrency(product.sellingPrice || 0)}</div>
                  <div>GST: {(product.gstPercent ?? 17).toFixed(1)}%</div>
                  <div>Stock: {product.stockQty ?? 0}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Items</h2>
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Product</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500">Qty</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500">Price</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500">Disc / item</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500">GST %</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">Line total</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-500 text-sm"
                    >
                      No items added. Search for a product to start a sale.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const lineSubtotal = item.unitPrice * item.qty;
                    const lineDiscount = item.discountPerItem * item.qty;
                    const taxable = lineSubtotal - lineDiscount;
                    const lineGst = taxable * (item.gstPercent / 100);
                    const lineTotal = taxable + lineGst;

                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-900">
                            {item.name || "Product"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.code && <span>Code: {item.code}</span>}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) =>
                              updateItem(item.id, "qty", Number(e.target.value))
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "unitPrice",
                                Number(e.target.value),
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.discountPerItem}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "discountPerItem",
                                Number(e.target.value),
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            value={item.gstPercent}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "gstPercent",
                                Number(e.target.value),
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary & payment */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <h2 className="text-lg font-semibold mb-1">Summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-green-700">
                -{formatCurrency(totals.totalDiscount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST</span>
              <span className="font-medium text-orange-700">
                {formatCurrency(totals.totalGst)}
              </span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="credit">Customer credit</option>
                <option value="mixed">Mixed (cash / card / transfer)</option>
              </select>
            </div>

            {paymentMethod === "card" && (
              <div className="space-y-2 text-sm">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card reference (optional)
                </label>
                <input
                  type="text"
                  value={cardReference}
                  onChange={(e) => setCardReference(e.target.value)}
                  placeholder="Last 4 digits / transaction reference"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="space-y-2 text-sm">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer reference (optional)
                </label>
                <input
                  type="text"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="Bank / reference number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            )}

            {paymentMethod === "mixed" && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Payment breakdown</span>
                  <button
                    type="button"
                    onClick={addPaymentPart}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    + Add part
                  </button>
                </div>
                <div className="space-y-2">
                  {paymentParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center gap-2"
                    >
                      <select
                        value={part.method}
                        onChange={(e) =>
                          updatePaymentPart(part.id, "method", e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Transfer</option>
                      </select>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={part.amount}
                        onChange={(e) =>
                          updatePaymentPart(
                            part.id,
                            "amount",
                            Number(e.target.value),
                          )
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removePaymentPart(part.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Paid total</span>
                  <span>{formatCurrency(mixedPaidTotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Difference</span>
                  <span
                    className={
                      Math.abs(totals.grandTotal - mixedPaidTotal) < 0.01
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatCurrency(totals.grandTotal - mixedPaidTotal)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                FBR Invoice Number (optional)
              </label>
              <input
                type="number"
                min={0}
                value={fbrInvoiceNumber}
                onChange={(e) => setFbrInvoiceNumber(e.target.value)}
                placeholder="Enter FBR invoice number if applicable"
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name (optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name for receipt"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Or enter Customer ID below if customer exists in system
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer ID (optional)
              </label>
              <input
                type="number"
                min={1}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter customer ID if applicable"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || items.length === 0 || totals.grandTotal <= 0}
              className="w-full mt-2 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving sale..." : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
