import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import ShopProfileForm from "./shop-profile-form";

export default async function ShopProfilePage() {
  try {
    await requireRole("admin");
    return <ShopProfileForm />;
  } catch (error) {
    redirect("/dashboard");
  }
}

