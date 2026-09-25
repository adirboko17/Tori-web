import { PageHeader, Tabs } from "../../_ui/parts";

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="כספים" description="רכישות הודעות מהאפליקציות, המחיר החודשי וחבילות ה-SMS שנמכרות באתר." />
      <Tabs
        label="אזורי הכספים"
        items={[
          { href: "/admin/billing", label: "רכישות", icon: "receipt" },
          { href: "/admin/billing/pricing", label: "מחירון", icon: "tag" },
        ]}
      />
      {children}
    </>
  );
}
