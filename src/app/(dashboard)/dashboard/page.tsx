import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  try {
    const { user } = await requireAuth();

    const isAdmin = user.role === "admin";
    const isManager = user.role === "manager";

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600 text-sm">
              Welcome, {user.username}! You can quickly jump to sales, catalog and setup from here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-100">
              Role: {user.role}
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* Primary actions */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Todays work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/sales"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <p className="text-xs font-semibold text-indigo-600 mb-1">Point of sale</p>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Sales POS</h3>
              <p className="text-gray-600 text-sm">
                Create new sales with barcode search, discounts and payments.
              </p>
            </Link>

            <Link
              href="/products"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <p className="text-xs font-semibold text-indigo-600 mb-1">Catalog</p>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Products</h3>
              <p className="text-gray-600 text-sm">
                View and manage your product list, prices and GST.
              </p>
            </Link>

            <Link
              href="/purchases"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <p className="text-xs font-semibold text-indigo-600 mb-1">Inventory</p>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Purchases</h3>
              <p className="text-gray-600 text-sm">
                Review purchase history and supplier invoices.
              </p>
            </Link>
          </div>
        </section>

        {/* Catalog & stock */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Catalog & stock
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/categories"
              className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <h3 className="text-base font-semibold mb-1 text-gray-900">Categories</h3>
              <p className="text-gray-600 text-sm">Organize products into categories for easier browsing.</p>
            </Link>

            <Link
              href="/brands"
              className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <h3 className="text-base font-semibold mb-1 text-gray-900">Brands</h3>
              <p className="text-gray-600 text-sm">Manage brands and associate them with products.</p>
            </Link>

            <Link
              href="/stock-adjustments"
              className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <h3 className="text-base font-semibold mb-1 text-gray-900">Stock adjustments</h3>
              <p className="text-gray-600 text-sm">Correct damaged, lost or gifted stock quantities.</p>
            </Link>
          </div>
        </section>

        {/* Customers & suppliers */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            People & partners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/customers"
              className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <h3 className="text-base font-semibold mb-1 text-gray-900">Customers</h3>
              <p className="text-gray-600 text-sm">Manage customer details, credit limits and contact info.</p>
            </Link>

            <Link
              href="/suppliers"
              className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <h3 className="text-base font-semibold mb-1 text-gray-900">Suppliers</h3>
              <p className="text-gray-600 text-sm">Keep track of supplier contacts and purchasing history.</p>
            </Link>
          </div>
        </section>

        {/* Shop setup & admin */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Shop setup & administration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/shop-profile"
              className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <h3 className="text-base font-semibold mb-1 text-gray-900">Shop profile</h3>
              <p className="text-gray-600 text-sm">Update shop name, tax details, address and branding.</p>
            </Link>

            <Link
              href="/branches"
              className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
            >
              <h3 className="text-base font-semibold mb-1 text-gray-900">Branches</h3>
              <p className="text-gray-600 text-sm">Configure shop branches and contact information.</p>
            </Link>

            {isAdmin && (
              <Link
                href="/users"
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
              >
                <h3 className="text-base font-semibold mb-1 text-gray-900">Users & roles</h3>
                <p className="text-gray-600 text-sm">Manage user accounts and assign roles and access.</p>
              </Link>
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    redirect("/login");
  }
}

