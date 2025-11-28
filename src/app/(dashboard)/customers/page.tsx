import type { Metadata } from "next";
import CustomersManagement from "./customers-management";

export const metadata: Metadata = {
  title: "Customers - Shop Management",
  description: "Manage customers",
};

export default function CustomersPage() {
  return <CustomersManagement />;
}

