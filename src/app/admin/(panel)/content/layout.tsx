import { PageHeader, Tabs } from "../../_ui/parts";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader
        title="תוכן לאפליקציות"
        description="הודעות שקופצות באפליקציות, סרטוני מרכז העזרה ורשימת האפליקציות במדיניות הפרטיות."
      />
      <Tabs
        label="סוגי תוכן"
        items={[
          { href: "/admin/content", label: "הודעות תפעוליות", icon: "megaphone" },
          { href: "/admin/content/videos", label: "סרטוני עזרה", icon: "video" },
          { href: "/admin/content/privacy", label: "מדיניות פרטיות", icon: "shield" },
        ]}
      />
      {children}
    </>
  );
}
