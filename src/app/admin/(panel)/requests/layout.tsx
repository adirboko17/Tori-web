import { countRecentAccountDeletionRequests } from "@/lib/account-deletions";
import { countOpenCancellations } from "@/lib/admin/cancellations";
import { PageHeader, Tabs } from "../../_ui/parts";

export const dynamic = "force-dynamic";

export default async function RequestsLayout({ children }: { children: React.ReactNode }) {
  const [openCancellations, recentDeletions] = await Promise.all([
    countOpenCancellations().catch(() => 0),
    countRecentAccountDeletionRequests(30).catch(() => 0),
  ]);

  return (
    <>
      <PageHeader
        title="בקשות"
        description="בקשות שמגיעות מהעסקים ומהמשתמשים באפליקציות ומחכות לטיפול שלכם."
      />
      <Tabs
        label="סוגי בקשות"
        items={[
          { href: "/admin/requests", label: "ביטולי מנוי", icon: "user-x", count: openCancellations, alert: true },
          { href: "/admin/requests/deletions", label: "מחיקת חשבון", icon: "trash-2", count: recentDeletions },
        ]}
      />
      {children}
    </>
  );
}
