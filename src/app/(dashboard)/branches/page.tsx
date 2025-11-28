import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import BranchesManagement from "./branches-management";

export default async function BranchesPage() {
  try {
    await requireRole("admin");
    return <BranchesManagement />;
  } catch (error) {
    redirect("/dashboard");
  }
}

