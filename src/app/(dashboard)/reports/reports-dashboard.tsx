"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package,
  FileText,
  Calendar
} from "lucide-react";

export default function ReportsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-gray-600 text-sm">
          View business reports and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Reports */}
        <Link
          href="/api/reports/sales"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sales Reports</h3>
          </div>
          <p className="text-gray-600 text-sm">
            View sales by branch, payment method, and daily summaries
          </p>
        </Link>

        {/* Purchase Reports */}
        <Link
          href="/api/reports/purchases"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Purchase Reports</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Analyze purchase history and supplier transactions
          </p>
        </Link>

        {/* Expense Reports */}
        <Link
          href="/api/reports/expenses"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Expense Reports</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Track expenses by category and branch
          </p>
        </Link>

        {/* Stock Reports */}
        <Link
          href="/api/reports/stock"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block border border-gray-100 hover:border-indigo-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Stock Reports</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Monitor inventory levels and stock movements
          </p>
        </Link>
      </div>

      {/* Quick Info Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Information
        </h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            • All reports support date range filtering
          </p>
          <p>
            • Sales and purchase reports can be filtered by branch
          </p>
          <p>
            • Expense reports can be filtered by category or branch
          </p>
          <p>
            • Use query parameters to customize report data
          </p>
        </div>
      </div>
    </div>
  );
}

