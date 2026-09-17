import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readAdminSession } from "@/lib/admin/session";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = { title: "כניסה לניהול" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await readAdminSession()) redirect("/admin");
  return <AdminLoginForm />;
}
