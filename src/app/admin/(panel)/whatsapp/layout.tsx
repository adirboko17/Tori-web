import { countWaitingChats } from "@/lib/admin/summary";
import { PageHeader, Tabs } from "../../_ui/parts";

export const dynamic = "force-dynamic";

export default async function WhatsappLayout({ children }: { children: React.ReactNode }) {
  const waiting = await countWaitingChats().catch(() => 0);
  return (
    <>
      <PageHeader title="וואטסאפ" description="השיחות של צ׳אט הבוט והלידים שמגיעים ממנו." />
      <Tabs
        label="וואטסאפ"
        items={[
          { href: "/admin/whatsapp", label: "שיחות", icon: "message-circle", count: waiting || undefined, alert: waiting > 0 },
          { href: "/admin/whatsapp/leads", label: "לידים", icon: "users" },
        ]}
      />
      {children}
    </>
  );
}
