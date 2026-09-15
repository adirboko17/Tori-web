import type { Metadata } from "next";
import ToriApp from "@/components/application/app-root";

export const metadata: Metadata = { title: "האפליקציה — הדגמה" };
export default function DemoPage() {
  return (
    <main className="demo-page">
      <ToriApp />
    </main>
  );
}
