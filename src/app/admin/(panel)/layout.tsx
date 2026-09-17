import { redirect } from "next/navigation";
import { countOpenCancellations } from "@/lib/admin/cancellations";
import { readAdminSession } from "@/lib/admin/session";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  let pendingCancellations = 0;
  try {
    pendingCancellations = await countOpenCancellations();
  } catch {
    pendingCancellations = 0;
  }
  return (
    <div className="admin-shell">
      <AdminNav phone={session.phone} pendingCancellations={pendingCancellations} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
