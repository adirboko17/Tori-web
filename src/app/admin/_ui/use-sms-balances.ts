"use client";

import { useEffect, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";

export type SmsBalance = { credits: number | null; message?: string };

type BalancesResponse = {
  balances: Record<string, { credits: string | number | null; message?: string }>;
};

const BATCH = 50;

function toCredits(raw: string | number | null) {
  if (raw == null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Live Pulseem balances, fetched in batches after the page renders. Missing key = still loading. */
export function useSmsBalances(businessIds: string[]) {
  const key = businessIds.join(",");
  const [balances, setBalances] = useState<Record<string, SmsBalance>>({});

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    const ids = key.split(",");
    for (let start = 0; start < ids.length; start += BATCH) {
      const chunk = ids.slice(start, start + BATCH);
      adminJson<BalancesResponse>("/api/admin/pulseem/balances", {
        method: "POST",
        body: JSON.stringify({ businessIds: chunk }),
      })
        .then((data) => {
          if (cancelled) return;
          const parsed = Object.fromEntries(
            Object.entries(data.balances ?? {}).map(([id, value]) => [
              id,
              { credits: toCredits(value.credits), message: value.message },
            ]),
          );
          setBalances((current) => ({ ...current, ...parsed }));
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          const message = error instanceof Error ? error.message : "טעינת היתרה נכשלה";
          setBalances((current) => ({
            ...current,
            ...Object.fromEntries(chunk.map((id) => [id, { credits: null, message }])),
          }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [key]);

  return balances;
}
