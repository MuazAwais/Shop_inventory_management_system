"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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
}

interface Supplier {
  id: number;
  name: string | null;
}

interface Branch {
  id: number;
  branchNameEn: string | null;
}

export default function PurchasesList() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    branchId: "",
    supplierId: "",
    startDate: "",
    endDate: "",
  });

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.branchId) params.append("branchId", filters.branchId);
      if (filters.supplierId) params.append("supplierId", filters.supplierId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      params.append("limit", "100");

      const response = await fetch(`/api/purchases?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPurchases(data.data || []);
      } else {
        setError(data.error || "Failed to fetch purchases");
      }
    } catch {
      setError("An error occurred while fetching purchases");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch("/api/suppliers");
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch {
      // Silently fail for suppliers
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const response = await fetch("/api/branches");
      const data = await response.json();
      if (data.success) {
        setBranches(data.data || []);
      }
    } catch {
      // Silently fail for branches
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([fetchPurchases(), fetchSuppliers(), fetchBranches()]);
    };

    fetchInitialData();
  }, [fetchPurchases, fetchSuppliers, fetchBranches]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      branchId: "",
      supplierId: "",
      startDate: "",
      endDate: "",
    });
  };

  const formatDate = (daysSinceEpoch: number | null) => {
    if (!daysSinceEpoch) return "-";
    // Convert days since epoch to Date
    const date = new Date(daysSinceEpoch * 86400 * 1000);
    return date.toLocaleDateString();
  };

  const getSupplierName = (supplierId: number | null) => {
    if (!supplierId) return "-";
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "-";
  };

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return "-";
    const branch = branches.find((b) => b.id === branchId);
    return branch?.branchNameEn || "-";
  };

  if (loading && purchases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading purchases...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Purchases</h1>
          <p className="text-gray-600">View and manage purchase records</p>
        </div>
        <Link
          href="/purchases/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Purchase
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              value={filters.branchId}
              onChange={(e) => handleFilterChange("branchId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchNameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              value={filters.supplierId}
              onChange={(e) => handleFilterChange("supplierId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No purchases found.
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {purchase.invoiceNo || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(purchase.purchaseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSupplierName(purchase.supplierId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getBranchName(purchase.branchId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {purchase.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.paidAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={
                          (purchase.dueAmount || 0) > 0
                            ? "text-red-600 font-medium"
                            : "text-green-600"
                        }
                      >
                        {purchase.dueAmount?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.paymentMethod || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/purchases/${purchase.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

