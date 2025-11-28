"use client";

import { useState, useEffect } from "react";

interface StockAdjustment {
  id: number;
  branchId: number | null;
  productId: number | null;
  qtyChange: number | null;
  reason: string | null;
  notes: string | null;
  adjustedBy: number | null;
  createdAt: number | null;
}

interface Product {
  id: number;
  code: string | null;
  nameEn: string | null;
}

interface Branch {
  id: number;
  branchNameEn: string | null;
}

export default function StockAdjustmentsList() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    branchId: "",
    productId: "",
    startDate: "",
    endDate: "",
  });
  const [formData, setFormData] = useState({
    branchId: "",
    productId: "",
    qtyChange: "",
    reason: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchData();
    fetchBranches();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [filters]);

  const fetchData = async () => {
    await Promise.all([fetchAdjustments(), fetchBranches(), fetchAllProducts()]);
  };

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.branchId) params.append("branchId", filters.branchId);
      if (filters.productId) params.append("productId", filters.productId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      params.append("limit", "100");

      const response = await fetch(`/api/stock-adjustments?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        const adjustmentsData = data.data || [];
        setAdjustments(adjustmentsData);
        
        // Fetch products for adjustments
        const productIds = adjustmentsData
          .map((adj: StockAdjustment) => adj.productId)
          .filter((id: number | null): id is number => id !== null);
        
        fetchProducts(productIds);
      } else {
        setError(data.error || "Failed to fetch stock adjustments");
      }
    } catch (err) {
      setError("An error occurred while fetching stock adjustments");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (productIds: number[]) => {
    try {
      const uniqueIds = [...new Set(productIds)];
      const productPromises = uniqueIds.map((id) =>
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

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/branches");
      const data = await response.json();
      if (data.success) {
        setBranches(data.data || []);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setAllProducts(data.data || []);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      branchId: "",
      productId: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleCreate = () => {
    setFormData({
      branchId: "",
      productId: "",
      qtyChange: "",
      reason: "",
      notes: "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload: any = {
        productId: parseInt(formData.productId),
        qtyChange: parseInt(formData.qtyChange),
        reason: formData.reason,
        notes: formData.notes || null,
      };

      if (formData.branchId) {
        payload.branchId = parseInt(formData.branchId);
      }

      const response = await fetch("/api/stock-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setFormData({
          branchId: "",
          productId: "",
          qtyChange: "",
          reason: "",
          notes: "",
        });
        fetchAdjustments();
      } else {
        setError(data.error || "Failed to create stock adjustment");
      }
    } catch (err) {
      setError("An error occurred while creating stock adjustment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getProductName = (productId: number | null) => {
    if (!productId) return "N/A";
    const product = products[productId];
    return product ? `${product.code || "N/A"} - ${product.nameEn || "N/A"}` : "N/A";
  };

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return "-";
    const branch = branches.find((b) => b.id === branchId);
    return branch?.branchNameEn || "-";
  };

  const reasonLabels: Record<string, string> = {
    damage: "Damage",
    lost: "Lost",
    found: "Found",
    correction: "Correction",
    sample: "Sample",
    gift: "Gift",
  };

  if (loading && adjustments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading stock adjustments...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stock Adjustments</h1>
          <p className="text-gray-600">View and manage stock adjustments</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Adjustment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Stock Adjustment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch (Optional)
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) =>
                    setFormData({ ...formData, branchId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchNameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Product</option>
                  {allProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code || "N/A"} - {product.nameEn || "N/A"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Change *
                </label>
                <input
                  type="number"
                  required
                  value={formData.qtyChange}
                  onChange={(e) =>
                    setFormData({ ...formData, qtyChange: e.target.value })
                  }
                  placeholder="Positive to add, negative to subtract"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use positive number to increase stock, negative to decrease
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <select
                  required
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Reason</option>
                  <option value="damage">Damage</option>
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                  <option value="correction">Correction</option>
                  <option value="sample">Sample</option>
                  <option value="gift">Gift</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Adjustment"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
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
              Product
            </label>
            <select
              value={filters.productId}
              onChange={(e) => handleFilterChange("productId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">All Products</option>
              {allProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.code || "N/A"} - {product.nameEn || "N/A"}
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

      {/* Adjustments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No stock adjustments found.
                  </td>
                </tr>
              ) : (
                adjustments.map((adjustment) => (
                  <tr key={adjustment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(adjustment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getProductName(adjustment.productId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getBranchName(adjustment.branchId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-medium ${
                          (adjustment.qtyChange || 0) > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(adjustment.qtyChange || 0) > 0 ? "+" : ""}
                        {adjustment.qtyChange || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {adjustment.reason
                        ? reasonLabels[adjustment.reason] || adjustment.reason
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {adjustment.notes || "-"}
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

