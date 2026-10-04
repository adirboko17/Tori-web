import type { Metadata } from "next";
import { Suspense } from "react";
import { loadMonthlyPriceIls } from "@/lib/admin/catalog";
import "../../sms/sms.css";
import { SubscribeSuccess, SubscribeSuccessFallback } from "./continue";

export const metadata: Metadata = { title: "הוראת הקבע נקלטה" };

export default async function SubscribeSuccessPage() {
  const monthlyPrice = await loadMonthlyPriceIls();
  return (
    <Suspense fallback={<SubscribeSuccessFallback />}>
      <SubscribeSuccess monthlyPrice={monthlyPrice} />
    </Suspense>
  );
}
