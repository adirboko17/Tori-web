import type { Metadata } from "next";
import { reconcilePendingOrders } from "@/lib/sms/orders";
import { readSmsSession } from "@/lib/sms/session";
import { SmsResult } from "../sms-result";

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
    <SmsResult tone="success" title="התשלום התקבל" primaryLabel="חזרה לחנות ההודעות">
      ההודעות נוספות ליתרה כהודעות שנקנו, מעל החבילה החודשית, ולא מתאפסות ב-1 לחודש.
    </SmsResult>
  );
}
