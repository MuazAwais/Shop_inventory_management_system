import type { Metadata } from "next";
import ExpensesList from "./expenses-list";

export const metadata: Metadata = {
  title: "Expenses - Shop Management",
  description: "View and manage expenses",
};

export default function ExpensesPage() {
  return <ExpensesList />;
}

