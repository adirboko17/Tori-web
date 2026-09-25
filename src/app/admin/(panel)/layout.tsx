import { redirect } from "next/navigation";
import { countOpenCancellations } from "@/lib/admin/cancellations";
import { readAdminSession } from "@/lib/admin/session";
import { countWaitingChats } from "@/lib/admin/summary";
import { AdminProviders } from "../_ui/feedback";
import { AdminShell } from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  const [openRequests, waitingChats] = await Promise.all([
    countOpenCancellations().catch(() => 0),
    countWaitingChats().catch(() => 0),
  ]);
  return (
    <AdminProviders>
      <AdminShell phone={session.phone} openRequests={openRequests} waitingChats={waitingChats}>
        {children}
      </AdminShell>
    </AdminProviders>
  );
}
