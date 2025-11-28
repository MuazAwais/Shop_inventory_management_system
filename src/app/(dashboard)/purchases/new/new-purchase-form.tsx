"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: number;
  code: string | null;
  nameEn: string | null;
  purchasePrice: number | null;
  gstPercent: number | null;
  brandId: number | null;
  brandNameEn: string | null;
  stockQty: number | null;
}

interface PurchaseItem {
  id: string;
  productId: number;
  code: string | null;
  name: string | null;
  brandName: string | null;
  qty: number;
  unitPrice: number;
  gstPercent: number;
}

interface Supplier {
  id: number;
  name: string | null;
}

interface Branch {
  id: number;
  branchNameEn: string | null;
}

interface Brand {
  id: number;
  nameEn: string | null;
}

interface Category {
  id: number;
  nameEn: string | null;
}

function generateRowId() {
  return Math.random().toString(36).slice(2);
}

export default function NewPurchaseForm() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [formData, setFormData] = useState({
    branchId: "",
    supplierId: "",
    invoiceNo: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    discountAmount: "0",
    paymentMethod: "cash" as "cash" | "bank_transfer" | "jazzcash" | "easypaisa" | "cheque" | "credit",
    paidAmount: "0",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    code: "",
    nameEn: "",
    brandId: "",
    categoryId: "",
    purchasePrice: "",
    sellingPrice: "",
    gstPercent: "17",
    qty: "1",
  });

  useEffect(() => {
    fetchSuppliers();
    fetchBranches();
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
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

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      if (data.success) {
        setBrands(data.data || []);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchAllProducts = async (brandId?: string) => {
    try {
      setSearchLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        let results = data.data || [];
        // Filter by brand if selected
        if (brandId && brandId !== "") {
          results = results.filter((product: Product) => 
            product.brandId === parseInt(brandId)
          );
        }
        setSearchResults(results);
      }
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchProducts = useCallback(async (query: string, brandId?: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`/api/products/search?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        let results = data.data || [];
        // If brand filter is selected, filter results by brand
        if (brandId && brandId !== "") {
          results = results.filter((product: Product) => 
            product.brandId === parseInt(brandId)
          );
        }
        setSearchResults(results);
      }
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      const debounceTimer = setTimeout(() => {
        searchProducts(searchQuery, selectedBrandId);
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else if (searchResults.length > 0 && searchQuery.length === 0) {
      // Clear results if search query is cleared
      setSearchResults([]);
    }
  }, [searchQuery, selectedBrandId, searchProducts]);

  const addProduct = (product: Product) => {
    const existingItem = items.find((item) => item.productId === product.id);
    if (existingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === existingItem.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: generateRowId(),
          productId: product.id,
          code: product.code,
          name: product.nameEn,
          brandName: product.brandNameEn,
          qty: 1,
          unitPrice: product.purchasePrice || 0,
          gstPercent: product.gstPercent || 17,
        },
      ]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleQuickAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickAddSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!quickAddForm.code || !quickAddForm.nameEn || !quickAddForm.purchasePrice || !quickAddForm.sellingPrice) {
        setError("Code, Name, Purchase Price, and Selling Price are required");
        setQuickAddSubmitting(false);
        return;
      }

      // Create product
      const productPayload: any = {
        code: quickAddForm.code,
        nameEn: quickAddForm.nameEn,
        purchasePrice: parseFloat(quickAddForm.purchasePrice),
        sellingPrice: parseFloat(quickAddForm.sellingPrice),
        gstPercent: parseFloat(quickAddForm.gstPercent) || 17,
        stockQty: 0,
        status: "active",
      };

      if (quickAddForm.brandId && quickAddForm.brandId !== "") {
        productPayload.brandId = parseInt(quickAddForm.brandId);
      }
      if (quickAddForm.categoryId && quickAddForm.categoryId !== "") {
        productPayload.categoryId = parseInt(quickAddForm.categoryId);
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to create product");
        setQuickAddSubmitting(false);
        return;
      }

      // Get the created product with brand info
      const createdProduct = data.data;
      const brand = brands.find((b) => b.id === createdProduct.brandId);

      // Add to purchase items
      const qty = parseFloat(quickAddForm.qty) || 1;
      setItems((prev) => [
        ...prev,
        {
          id: generateRowId(),
          productId: createdProduct.id,
          code: createdProduct.code,
          name: createdProduct.nameEn,
          brandName: brand?.nameEn || null,
          qty: qty,
          unitPrice: createdProduct.purchasePrice || 0,
          gstPercent: createdProduct.gstPercent || 17,
        },
      ]);

      // Reset form and close modal
      setQuickAddForm({
        code: "",
        nameEn: "",
        brandId: "",
        categoryId: "",
        purchasePrice: "",
        sellingPrice: "",
        gstPercent: "17",
        qty: "1",
      });
      setShowQuickAddModal(false);
    } catch (err: any) {
      setError("An error occurred while creating product");
    } finally {
      setQuickAddSubmitting(false);
    }
  };

  const updateItem = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "qty" || field === "unitPrice" || field === "gstPercent"
                  ? Number.isNaN(Number(value)) || Number(value) < 0
                    ? 0
                    : Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;

    for (const item of items) {
      const itemSubtotal = item.unitPrice * item.qty;
      const itemGst = itemSubtotal * (item.gstPercent / 100);
      subtotal += itemSubtotal;
      totalGst += itemGst;
    }

    const discountAmount = parseFloat(formData.discountAmount) || 0;
    const totalAmount = subtotal + totalGst;
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const dueAmount = totalAmount - discountAmount - paidAmount;

    return {
      subtotal,
      totalGst,
      totalAmount,
      discountAmount,
      paidAmount,
      dueAmount,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Add at least one item to create a purchase.");
      return;
    }

    if (!formData.branchId) {
      setError("Branch is required.");
      return;
    }

    if (!formData.supplierId) {
      setError("Supplier is required.");
      return;
    }

    if (!formData.invoiceNo) {
      setError("Invoice number is required.");
      return;
    }

    if (totals.totalAmount <= 0) {
      setError("Total amount must be greater than zero.");
      return;
    }

    const body = {
      branchId: parseInt(formData.branchId),
      supplierId: parseInt(formData.supplierId),
      invoiceNo: formData.invoiceNo,
      purchaseDate: new Date(formData.purchaseDate),
      items: items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        gstPercent: item.gstPercent,
      })),
      discountAmount: totals.discountAmount,
      paymentMethod: formData.paymentMethod,
      paidAmount: totals.paidAmount,
      notes: formData.notes || null,
    };

    try {
      setSubmitting(true);
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || data.message || "Failed to create purchase");
        return;
      }

      // Redirect to purchase detail page
      if (data.data?.id) {
        router.push(`/purchases/${data.data.id}`);
      } else {
        router.push("/purchases");
      }
    } catch (err: any) {
      setError("An error occurred while creating purchase");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">New Purchase</h1>
          <p className="text-gray-600">Create a new purchase record</p>
        </div>
        <Link
          href="/purchases"
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Purchases
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Purchase Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Purchase Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch *
              </label>
              <select
                required
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
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
                Supplier *
              </label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNo}
                onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as typeof formData.paymentMethod,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="cheque">Cheque</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountAmount}
                onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Product Search and Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add Items to Purchase</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowQuickAddModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Quick Add Product
              </button>
              <button
                type="button"
                onClick={() => fetchAllProducts(selectedBrandId)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Browse All Products
              </button>
            </div>
          </div>

          {/* Product Search */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Products
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by code or name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-2.5 text-gray-400">Searching...</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Brand
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    // Trigger search again with new brand filter
                    if (searchQuery && searchQuery.trim().length >= 2) {
                      searchProducts(searchQuery, e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id.toString()}>
                      {brand.nameEn || "N/A"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">Search Results</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">
                              {product.code || "N/A"}
                            </div>
                            {product.brandNameEn && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {product.brandNameEn}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {product.nameEn || "N/A"}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Price: <span className="font-medium text-gray-700">{product.purchasePrice?.toFixed(2) || "0.00"}</span></span>
                            <span>GST: <span className="font-medium text-gray-700">{(product.gstPercent || 17).toFixed(1)}%</span></span>
                            {product.stockQty !== null && (
                              <span>Stock: <span className="font-medium text-gray-700">{product.stockQty.toFixed(2)}</span></span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addProduct(product)}
                          className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      GST %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => {
                    const itemSubtotal = item.unitPrice * item.qty;
                    const itemGst = itemSubtotal * (item.gstPercent / 100);
                    const itemTotal = itemSubtotal + itemGst;
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.code || "N/A"}</div>
                          <div className="text-sm text-gray-500">{item.name || "N/A"}</div>
                          {item.brandName && (
                            <div className="text-xs text-gray-400">Brand: {item.brandName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.gstPercent}
                            onChange={(e) => updateItem(item.id, "gstPercent", e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{itemTotal.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST Amount:</span>
              <span className="font-medium">{totals.totalGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">{totals.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-red-600">-{totals.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid Amount:</span>
              <span className="font-medium text-green-600">{totals.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-lg font-semibold text-gray-900">Due Amount:</span>
              <span
                className={`text-lg font-semibold ${
                  totals.dueAmount > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {totals.dueAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Purchase"}
          </button>
          <Link
            href="/purchases"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Quick Add Product Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Quick Add Product</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickAddModal(false);
                    setQuickAddForm({
                      code: "",
                      nameEn: "",
                      brandId: "",
                      categoryId: "",
                      purchasePrice: "",
                      sellingPrice: "",
                      gstPercent: "17",
                      qty: "1",
                    });
                    setError("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleQuickAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={quickAddForm.code}
                      onChange={(e) => setQuickAddForm({ ...quickAddForm, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="Enter product code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={quickAddForm.nameEn}
                      onChange={(e) => setQuickAddForm({ ...quickAddForm, nameEn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <select
                      value={quickAddForm.brandId}
                      onChange={(e) => setQuickAddForm({ ...quickAddForm, brandId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id.toString()}>
                          {brand.nameEn || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={quickAddForm.categoryId}
                      onChange={(e) => setQuickAddForm({ ...quickAddForm, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.nameEn || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={quickAddForm.purchasePrice}
                      onChange={(e) => setQuickAddForm({ ...quickAddForm, purchasePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={quickAddForm.sellingPrice}
                      onChange={(e) => setQuickAddForm({ ...quickAddForm, sellingPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Percent
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={quickAddForm.gstPercent}
                      onChange={(e) => setQuickAddForm({ ...quickAddForm, gstPercent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity to Add
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={quickAddForm.qty}
                      onChange={(e) => setQuickAddForm({ ...quickAddForm, qty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={quickAddSubmitting}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {quickAddSubmitting ? "Creating..." : "Create & Add to Purchase"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickAddModal(false);
                      setQuickAddForm({
                        code: "",
                        nameEn: "",
                        brandId: "",
                        categoryId: "",
                        purchasePrice: "",
                        sellingPrice: "",
                        gstPercent: "17",
                        qty: "1",
                      });
                      setError("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

