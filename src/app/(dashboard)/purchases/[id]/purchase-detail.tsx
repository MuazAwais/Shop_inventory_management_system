"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number | null;
  qty: number | null;
  unitPrice: number | null;
  gstPercent: number | null;
  totalPrice: number | null;
}

interface Purchase {
  id: number;
  branchId: number | null;
  supplierId: number | null;
  invoiceNo: string | null;
  purchaseDate: number | null;
  subtotal: number | null;
  gstAmount: number | null;
  totalAmount: number | null;
  discountAmount: number | null;
  paidAmount: number | null;
  dueAmount: number | null;
  paymentMethod: string | null;
  notes: string | null;
  createdBy: number | null;
  items?: PurchaseItem[];
}

interface Product {
  id: number;
  code: string | null;
  nameEn: string | null;
}

interface Supplier {
  id: number;
  name: string | null;
}

interface Branch {
  id: number;
  branchNameEn: string | null;
}

export default function PurchaseDetail({ purchaseId }: { purchaseId: string }) {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if purchaseId is a valid number
    const id = parseInt(purchaseId);
    if (isNaN(id)) {
      setError("Invalid purchase ID");
      setLoading(false);
      return;
    }
    fetchPurchase();
  }, [purchaseId]);

  const fetchPurchase = async () => {
    try {
      setLoading(true);
      const id = parseInt(purchaseId);
      if (isNaN(id)) {
        setError("Invalid purchase ID");
        return;
      }
      const response = await fetch(`/api/purchases/${id}`);
      const data = await response.json();

      if (data.success) {
        const purchaseData = data.data;
        setPurchase(purchaseData);

        // Fetch related data
        if (purchaseData.supplierId) {
          fetchSupplier(purchaseData.supplierId);
        }
        if (purchaseData.branchId) {
          fetchBranch(purchaseData.branchId);
        }
        if (purchaseData.items) {
          fetchProducts(purchaseData.items);
        }
      } else {
        setError(data.error || "Failed to fetch purchase");
      }
    } catch (err) {
      setError("An error occurred while fetching purchase");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplier = async (supplierId: number) => {
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`);
      const data = await response.json();
      if (data.success) {
        setSupplier(data.data);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchBranch = async (branchId: number) => {
    try {
      const response = await fetch(`/api/branches/${branchId}`);
      const data = await response.json();
      if (data.success) {
        setBranch(data.data);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchProducts = async (items: PurchaseItem[]) => {
    try {
      const productIds = items
        .map((item) => item.productId)
        .filter((id): id is number => id !== null);

      const productPromises = productIds.map((id) =>
        fetch(`/api/products/${id}`).then((res) => res.json())
      );

      const productResults = await Promise.all(productPromises);
      const productsMap: Record<number, Product> = {};

      productResults.forEach((result) => {
        if (result.success && result.data) {
          productsMap[result.data.id] = result.data;
        }
      });

      setProducts(productsMap);
    } catch (err) {
      // Silently fail
    }
  };

  const formatDate = (daysSinceEpoch: number | null) => {
    if (!daysSinceEpoch) return "-";
    const date = new Date(daysSinceEpoch * 86400 * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProductName = (productId: number | null) => {
    if (!productId) return "N/A";
    const product = products[productId];
    return product ? `${product.code || "N/A"} - ${product.nameEn || "N/A"}` : "N/A";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading purchase details...</div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Purchase not found"}
        </div>
        <Link
          href="/purchases"
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Purchases
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Purchase Details</h1>
          <p className="text-gray-600">Invoice: {purchase.invoiceNo || "N/A"}</p>
        </div>
        <Link
          href="/purchases"
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Purchases
        </Link>
      </div>

      {/* Purchase Header Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Purchase Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <p className="text-gray-900">{purchase.invoiceNo || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <p className="text-gray-900">{formatDate(purchase.purchaseDate)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <p className="text-gray-900">{supplier?.name || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <p className="text-gray-900">{branch?.branchNameEn || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <p className="text-gray-900">{purchase.paymentMethod || "N/A"}</p>
          </div>
          {purchase.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <p className="text-gray-900">{purchase.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Items */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchase.items && purchase.items.length > 0 ? (
                purchase.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getProductName(item.productId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.qty || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unitPrice?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.gstPercent?.toFixed(2) || "0.00"}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.totalPrice?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{purchase.subtotal?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST Amount:</span>
            <span className="font-medium">{purchase.gstAmount?.toFixed(2) || "0.00"}</span>
          </div>
          {purchase.discountAmount && purchase.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-red-600">
                -{purchase.discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
            <span className="text-lg font-semibold text-gray-900">
              {purchase.totalAmount?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Paid Amount:</span>
            <span className="font-medium text-green-600">
              {purchase.paidAmount?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-lg font-semibold text-gray-900">Due Amount:</span>
            <span
              className={`text-lg font-semibold ${
                (purchase.dueAmount || 0) > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {purchase.dueAmount?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

