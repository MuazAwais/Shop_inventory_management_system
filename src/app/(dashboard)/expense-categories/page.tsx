import type { Metadata } from "next";
import ExpenseCategoriesManagement from "./expense-categories-management";

export const metadata: Metadata = {
  title: "Expense Categories - Shop Management",
  description: "Manage expense categories",
};

export default function ExpenseCategoriesPage() {
  return <ExpenseCategoriesManagement />;
}

