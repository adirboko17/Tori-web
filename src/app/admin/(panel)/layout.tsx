import { redirect } from "next/navigation";
import { readAdminSession } from "@/lib/admin/session";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <div className="admin-shell">
      <AdminNav phone={session.phone} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
