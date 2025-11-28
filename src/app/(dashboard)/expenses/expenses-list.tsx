"use client";

import { useState, useEffect } from "react";

interface Expense {
  id: number;
  branchId: number | null;
  categoryId: number | null;
  amount: number | null;
  description: string | null;
  expenseDate: number | null;
  paidTo: string | null;
  createdBy: number | null;
}

interface ExpenseCategory {
  id: number;
  name: string | null;
}

interface Branch {
  id: number;
  branchNameEn: string | null;
}

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    branchId: "",
    categoryId: "",
    startDate: "",
    endDate: "",
  });
  const [formData, setFormData] = useState({
    branchId: "",
    categoryId: "",
    amount: "",
    description: "",
    expenseDate: "",
    paidTo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchData = async () => {
    await Promise.all([fetchExpenses(), fetchCategories(), fetchBranches()]);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.branchId) params.append("branchId", filters.branchId);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      params.append("limit", "100");

      const response = await fetch(`/api/expenses?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setExpenses(data.data || []);
      } else {
        setError(data.error || "Failed to fetch expenses");
      }
    } catch (err) {
      setError("An error occurred while fetching expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/expense-categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
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

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      branchId: "",
      categoryId: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setFormData({
      branchId: "",
      categoryId: "",
      amount: "",
      description: "",
      expenseDate: new Date().toISOString().split("T")[0],
      paidTo: "",
    });
    setShowForm(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      branchId: expense.branchId?.toString() || "",
      categoryId: expense.categoryId?.toString() || "",
      amount: expense.amount?.toString() || "",
      description: expense.description || "",
      expenseDate: expense.expenseDate
        ? new Date(expense.expenseDate * 86400 * 1000).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      paidTo: expense.paidTo || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = editingExpense
        ? `/api/expenses/${editingExpense.id}`
        : "/api/expenses";
      const method = editingExpense ? "PATCH" : "POST";

      const payload: any = {
        branchId: parseInt(formData.branchId),
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        expenseDate: formData.expenseDate,
        paidTo: formData.paidTo || null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingExpense(null);
        setFormData({
          branchId: "",
          categoryId: "",
          amount: "",
          description: "",
          expenseDate: new Date().toISOString().split("T")[0],
          paidTo: "",
        });
        fetchExpenses();
      } else {
        setError(data.error || "Failed to save expense");
      }
    } catch (err) {
      setError("An error occurred while saving expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchExpenses();
      } else {
        setError(data.error || "Failed to delete expense");
      }
    } catch (err) {
      setError("An error occurred while deleting expense");
    }
  };

  const formatDate = (daysSinceEpoch: number | null) => {
    if (!daysSinceEpoch) return "-";
    const date = new Date(daysSinceEpoch * 86400 * 1000);
    return date.toLocaleDateString();
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "-";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "-";
  };

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return "-";
    const branch = branches.find((b) => b.id === branchId);
    return branch?.branchNameEn || "-";
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Expenses</h1>
          <p className="text-gray-600">View and manage expenses</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Expense
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingExpense ? "Edit Expense" : "Create New Expense"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch *
                </label>
                <select
                  required
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
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expenseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expenseDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid To
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={formData.paidTo}
                  onChange={(e) =>
                    setFormData({ ...formData, paidTo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
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
                {submitting
                  ? editingExpense
                    ? "Updating..."
                    : "Creating..."
                  : editingExpense
                  ? "Update Expense"
                  : "Create Expense"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingExpense(null);
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
              Category
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange("categoryId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
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

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getBranchName(expense.branchId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(expense.categoryId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.paidTo || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {expense.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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

