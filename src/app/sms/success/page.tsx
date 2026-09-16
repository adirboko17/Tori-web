import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { reconcilePendingOrders } from "@/lib/sms/orders";
import { readSmsSession } from "@/lib/sms/session";
import "../sms.css";

export const metadata: Metadata = { title: "התשלום התקבל" };
export const dynamic = "force-dynamic";

export default async function SmsSuccessPage() {
  try {
    const session = await readSmsSession();
    await reconcilePendingOrders(session?.businessId);
  } catch (error) {
    console.error("success reconcile failed", error);
  }

  return (
    <main className="sms-result">
      <Image
        src="/assets/brand/tori-app-icon.png"
        width={72}
        height={72}
        alt="tori"
      />
      <h1>התשלום התקבל</h1>
      <p>
        ההודעות נוספות ליתרה כהודעות שנקנו, מעל החבילה החודשית, ולא מתאפסות
        ב-1 לחודש.
      </p>
      <Link className="tori-btn tori-btn--secondary" href="/sms">
        חזרה לחנות ההודעות
      </Link>
      <Link className="tori-btn tori-btn--ghost" href="/">
        לדף הבית
      </Link>
    </main>
  );
}
