"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  payplusReturnDecision,
  readPayplusReturnFields,
} from "@/lib/payplus-return";

const CLAIM_ATTEMPTS = 4;
const CLAIM_RETRY_MS = 2500;

export function SubscribeSuccessFallback() {
  return (
    <main className="sms-result">
      <Image src="/assets/brand/tori-app-icon.png" width={72} height={72} alt="tori" />
      <h1>התשלום נקלט</h1>
      <p>מעבירים אתכם להשלמת שאר הפרטים.</p>
    </main>
  );
}

export function SubscribeSuccess({ monthlyPrice }: { monthlyPrice: number }) {
  const params = useSearchParams();
  const fields = readPayplusReturnFields(Object.fromEntries(params.entries()));
  const decision = payplusReturnDecision(fields);
  const canContinue = decision === "lookup";
  const [phase, setPhase] = useState<"transfer" | "stay">(canContinue ? "transfer" : "stay");

  useEffect(() => {
    if (!canContinue) return;
    let cancelled = false;

    void (async () => {
      for (let attempt = 0; attempt < CLAIM_ATTEMPTS && !cancelled; attempt += 1) {
        if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, CLAIM_RETRY_MS));
        try {
          const response = await fetch("/api/subscribe/return", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              transaction_uid: fields.transactionUid,
              page_request_uid: fields.pageRequestUid,
              more_info: fields.moreInfo,
              status_code: fields.statusCode,
            }),
          });
          const data = (await response.json().catch(() => ({}))) as { ok?: boolean };
          if (response.ok && data.ok) {
            if (!cancelled) window.location.replace("/account?paid=1");
            return;
          }
        } catch {
          // Retried below; the payment may still be settling at PayPlus.
        }
      }
      if (!cancelled) setPhase("stay");
    })();

    return () => {
      cancelled = true;
    };
  }, [
    canContinue,
    fields.moreInfo,
    fields.pageRequestUid,
    fields.statusCode,
    fields.transactionUid,
  ]);

  if (phase === "transfer") return <SubscribeSuccessFallback />;

  if (decision === "declined") {
    return (
      <main className="sms-result">
        <Image src="/assets/brand/tori-app-icon.png" width={72} height={72} alt="tori" />
        <h1>התשלום לא הושלם</h1>
        <p>החיוב לא עבר. אפשר לנסות שוב מהאזור האישי עם אותו מספר נייד.</p>
        <Link className="tori-btn tori-btn--secondary" href="/account">
          חזרה לתשלום
        </Link>
        <Link className="tori-btn tori-btn--ghost" href="/">
          לדף הבית
        </Link>
      </main>
    );
  }

  return (
    <main className="sms-result">
      <Image src="/assets/brand/tori-app-icon.png" width={72} height={72} alt="tori" />
      <h1>הוראת הקבע נקלטה</h1>
      <p>
        {`החיוב החודשי של ${monthlyPrice} ₪ + מע״מ נקלט. באזור האישי מתחברים עם הנייד שאיתו שילמתם, ומקבלים קוד ב-SMS.`}
      </p>
      <Link className="tori-btn tori-btn--secondary" href="/account">
        להשלמת הפרטים
      </Link>
      <Link className="tori-btn tori-btn--ghost" href="/">
        לדף הבית
      </Link>
    </main>
  );
}
