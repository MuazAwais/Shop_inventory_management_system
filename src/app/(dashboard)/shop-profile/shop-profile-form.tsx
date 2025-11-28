"use client";

import { useState, useEffect } from "react";

interface ShopProfile {
  id: number;
  shopNameEn: string | null;
  shopNameUr: string | null;
  ownerName: string | null;
  ntn: string | null;
  strn: string | null;
  cnic: string | null;
  phone1: string | null;
  phone2: string | null;
  addressEn: string | null;
  addressUr: string | null;
  fbrPosId: string | null;
  logoUrl: string | null;
}

export default function ShopProfileForm() {
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    shopNameEn: "",
    shopNameUr: "",
    ownerName: "",
    ntn: "",
    strn: "",
    cnic: "",
    phone1: "",
    phone2: "",
    addressEn: "",
    addressUr: "",
    fbrPosId: "",
    logoUrl: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shop-profile");
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        setFormData({
          shopNameEn: data.data.shopNameEn || "",
          shopNameUr: data.data.shopNameUr || "",
          ownerName: data.data.ownerName || "",
          ntn: data.data.ntn || "",
          strn: data.data.strn || "",
          cnic: data.data.cnic || "",
          phone1: data.data.phone1 || "",
          phone2: data.data.phone2 || "",
          addressEn: data.data.addressEn || "",
          addressUr: data.data.addressUr || "",
          fbrPosId: data.data.fbrPosId || "",
          logoUrl: data.data.logoUrl || "",
        });
      } else {
        setError(data.error || "Failed to load shop profile");
      }
    } catch (err) {
      setError("An error occurred while loading shop profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/shop-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Shop profile updated successfully!");
        setProfile(data.data);
      } else {
        setError(data.error || "Failed to update shop profile");
      }
    } catch (err) {
      setError("An error occurred while updating shop profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading shop profile...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Shop Profile</h1>
        <p className="text-gray-600">Manage your shop information and settings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name (English) *
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={formData.shopNameEn}
              onChange={(e) =>
                setFormData({ ...formData, shopNameEn: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name (Urdu)
            </label>
            <input
              type="text"
              maxLength={150}
              value={formData.shopNameUr}
              onChange={(e) =>
                setFormData({ ...formData, shopNameUr: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              maxLength={100}
              value={formData.ownerName}
              onChange={(e) =>
                setFormData({ ...formData, ownerName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNIC
            </label>
            <input
              type="text"
              maxLength={15}
              value={formData.cnic}
              onChange={(e) =>
                setFormData({ ...formData, cnic: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NTN
            </label>
            <input
              type="text"
              maxLength={20}
              value={formData.ntn}
              onChange={(e) =>
                setFormData({ ...formData, ntn: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              STRN
            </label>
            <input
              type="text"
              maxLength={20}
              value={formData.strn}
              onChange={(e) =>
                setFormData({ ...formData, strn: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone 1
            </label>
            <input
              type="tel"
              maxLength={15}
              value={formData.phone1}
              onChange={(e) =>
                setFormData({ ...formData, phone1: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone 2
            </label>
            <input
              type="tel"
              maxLength={15}
              value={formData.phone2}
              onChange={(e) =>
                setFormData({ ...formData, phone2: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FBR POS ID
            </label>
            <input
              type="text"
              maxLength={50}
              value={formData.fbrPosId}
              onChange={(e) =>
                setFormData({ ...formData, fbrPosId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              maxLength={255}
              value={formData.logoUrl}
              onChange={(e) =>
                setFormData({ ...formData, logoUrl: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={fetchProfile}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

