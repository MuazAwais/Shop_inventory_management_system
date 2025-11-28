"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface Product {
  id: number;
  code: string | null;
  barcode: string | null;
  nameEn: string | null;
  nameUr: string | null;
  brandId: number | null;
  categoryId: number | null;
  modelCompatibility: string | null;
  purchasePrice: number | null;
  sellingPrice: number | null;
  wholesalePrice: number | null;
  gstPercent: number | null;
  stockQty: number | null;
  minStockLevel: number | null;
  status: string | null;
  notes: string | null;
}

interface Category {
  id: number;
  nameEn: string | null;
}

interface Brand {
  id: number;
  nameEn: string | null;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    barcode: "",
    nameEn: "",
    nameUr: "",
    brandId: "",
    categoryId: "",
    modelCompatibility: "",
    purchasePrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    gstPercent: "17",
    stockQty: "0",
    minStockLevel: "5",
    status: "active",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();

      if (productsData.success) {
        setProducts(productsData.data || []);
      }
      if (categoriesData.success) {
        setCategories(categoriesData.data || []);
      }
      if (brandsData.success) {
        setBrands(brandsData.data || []);
      }
    } catch (err) {
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      code: "",
      barcode: "",
      nameEn: "",
      nameUr: "",
      brandId: "",
      categoryId: "",
      modelCompatibility: "",
      purchasePrice: "",
      sellingPrice: "",
      wholesalePrice: "",
      gstPercent: "17",
      stockQty: "0",
      minStockLevel: "5",
      status: "active",
      notes: "",
    });
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code || "",
      barcode: product.barcode || "",
      nameEn: product.nameEn || "",
      nameUr: product.nameUr || "",
      brandId: product.brandId?.toString() || "",
      categoryId: product.categoryId?.toString() || "",
      modelCompatibility: product.modelCompatibility || "",
      purchasePrice: product.purchasePrice?.toString() || "",
      sellingPrice: product.sellingPrice?.toString() || "",
      wholesalePrice: product.wholesalePrice?.toString() || "",
      gstPercent: product.gstPercent?.toString() || "17",
      stockQty: product.stockQty?.toString() || "0",
      minStockLevel: product.minStockLevel?.toString() || "5",
      status: product.status || "active",
      notes: product.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const payload: any = {
        code: formData.code,
        barcode: formData.barcode || null,
        nameEn: formData.nameEn,
        nameUr: formData.nameUr || null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        modelCompatibility: formData.modelCompatibility || null,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : null,
        gstPercent: parseFloat(formData.gstPercent),
        stockQty: parseFloat(formData.stockQty),
        minStockLevel: parseInt(formData.minStockLevel),
        status: formData.status,
        notes: formData.notes || null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingProduct(null);
        fetchData();
      } else {
        setError(data.error || "Failed to save product");
      }
    } catch (err) {
      setError("An error occurred while saving product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const response = await fetch(`/api/products/${id}/toggle-status`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (data.success) {
        fetchData();
      } else {
        setError(data.error || "Failed to toggle product status");
      }
    } catch (err) {
      setError("An error occurred while toggling product status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchData();
      } else {
        setError(data.error || "Failed to delete product");
      }
    } catch (err) {
      setError("An error occurred while deleting product");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Manage product catalog</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4"
        >
          {error}
        </motion.div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card p-6 rounded-lg shadow-lg border border-border mb-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            {editingProduct ? "Edit Product" : "Create New Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name (Urdu)
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={formData.nameUr}
                  onChange={(e) =>
                    setFormData({ ...formData, nameUr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Category
                </label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nameEn || "N/A"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Brand
                </label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, brandId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.nameEn || "N/A"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
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
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wholesale Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.wholesalePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, wholesalePrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
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
                  value={formData.gstPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, gstPercent: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.stockQty}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQty: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Stock Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, minStockLevel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Compatibility
                </label>
                <input
                  type="text"
                  maxLength={255}
                  value={formData.modelCompatibility}
                  onChange={(e) =>
                    setFormData({ ...formData, modelCompatibility: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                />
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
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting
                  ? editingProduct
                    ? "Updating..."
                    : "Creating..."
                  : editingProduct
                  ? "Update Product"
                  : "Create Product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card rounded-lg shadow-lg border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Purchase Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                    No products found. Create your first product.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {product.code || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {product.nameEn || "N/A"}
                      </div>
                      {product.nameUr && (
                        <div className="text-sm text-muted-foreground">{product.nameUr}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {product.purchasePrice?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {product.sellingPrice?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {product.stockQty?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {product.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            product.id,
                            product.status || "active"
                          )
                        }
                        className={`transition-colors ${
                          product.status === "active"
                            ? "text-yellow-600 hover:text-yellow-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {product.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

