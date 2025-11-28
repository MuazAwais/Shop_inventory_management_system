import { redirect } from "next/navigation";

/**
 * Public registration is disabled
 * Only admins can create user accounts through the Users management page
 */
export default function RegisterPage() {
  redirect("/login");
}
