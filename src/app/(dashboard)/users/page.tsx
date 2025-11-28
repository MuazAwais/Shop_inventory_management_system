import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersManagement from "./users-management";

export default async function UsersPage() {
  try {
    await requireRole("admin");
    return <UsersManagement />;
  } catch (error) {
    redirect("/dashboard");
  }
}

