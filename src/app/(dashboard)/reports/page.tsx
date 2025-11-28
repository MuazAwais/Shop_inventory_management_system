import type { Metadata } from "next";
import ReportsDashboard from "./reports-dashboard";

export const metadata: Metadata = {
  title: "Reports - Shop Management",
  description: "View business reports and analytics",
};

export default function ReportsPage() {
  return <ReportsDashboard />;
}

