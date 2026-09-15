import type { Metadata } from "next";
import ToriApp from "@/components/application/app-root";

export const metadata: Metadata = { title: "ניהול העסק — הדגמה" };
export default function DashboardPage() {
  return (
    <main className="demo-page">
      <ToriApp initialRole="business" />
    </main>
  );
}
