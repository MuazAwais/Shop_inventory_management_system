"use client";

import { useState, useEffect } from "react";

interface Branch {
  id: number;
  branchNameEn: string | null;
  branchNameUr: string | null;
  addressEn: string | null;
  addressUr: string | null;
  phone: string | null;
}

export default function BranchesManagement() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    branchNameEn: "",
    branchNameUr: "",
    addressEn: "",
    addressUr: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/branches");
      const data = await response.json();

      if (data.success) {
        setBranches(data.data || []);
      } else {
        setError(data.error || "Failed to fetch branches");
      }
    } catch (err) {
      setError("An error occurred while fetching branches");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBranch(null);
    setFormData({
      branchNameEn: "",
      branchNameUr: "",
      addressEn: "",
      addressUr: "",
      phone: "",
    });
    setShowForm(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      branchNameEn: branch.branchNameEn || "",
      branchNameUr: branch.branchNameUr || "",
      addressEn: branch.addressEn || "",
      addressUr: branch.addressUr || "",
      phone: branch.phone || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = editingBranch
        ? `/api/branches/${editingBranch.id}`
        : "/api/branches";
      const method = editingBranch ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingBranch(null);
        setFormData({
          branchNameEn: "",
          branchNameUr: "",
          addressEn: "",
          addressUr: "",
          phone: "",
        });
        fetchBranches();
      } else {
        setError(data.error || "Failed to save branch");
      }
    } catch (err) {
      setError("An error occurred while saving branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this branch?")) {
      return;
    }

    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchBranches();
      } else {
        setError(data.error || "Failed to delete branch");
      }
    } catch (err) {
      setError("An error occurred while deleting branch");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading branches...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Branches</h1>
          <p className="text-gray-600">Manage shop branches and locations</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Branch
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBranch ? "Edit Branch" : "Create New Branch"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name (English) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.branchNameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, branchNameEn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name (Urdu)
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.branchNameUr}
                  onChange={(e) =>
                    setFormData({ ...formData, branchNameUr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  maxLength={15}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (English)
              </label>
              <textarea
                value={formData.addressEn}
                onChange={(e) =>
                  setFormData({ ...formData, addressEn: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Urdu)
              </label>
              <textarea
                value={formData.addressUr}
                onChange={(e) =>
                  setFormData({ ...formData, addressUr: e.target.value })
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
                  ? editingBranch
                    ? "Updating..."
                    : "Creating..."
                  : editingBranch
                  ? "Update Branch"
                  : "Create Branch"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBranch(null);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No branches found. Create your first branch.
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {branch.branchNameEn || "N/A"}
                        </div>
                        {branch.branchNameUr && (
                          <div className="text-sm text-gray-500">
                            {branch.branchNameUr}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {branch.addressEn || "-"}
                      </div>
                      {branch.addressUr && (
                        <div className="text-sm text-gray-500">
                          {branch.addressUr}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {branch.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
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

