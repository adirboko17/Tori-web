"use client";

import { formatNumber } from "./format";
import { StatCard } from "./parts";
import { useAdminData } from "./use-admin-data";

export type MainPulseemBalance = {
  credits: number | null;
  error: string;
  loading: boolean;
};

export function useMainPulseemBalance(): MainPulseemBalance {
  const { data, error, loading } = useAdminData<{ smsCredits: number }>("/api/admin/pulseem/main-balance");
  return { credits: data?.smsCredits ?? null, error, loading };
}

export function MainPulseemStat({ balance }: { balance: MainPulseemBalance }) {
  const failed = Boolean(balance.error) && balance.credits == null;
  return (
    <StatCard
      loading={balance.loading}
      icon="send"
      label="יתרה בחשבון פולסים"
      value={failed ? "—" : formatNumber(balance.credits)}
      hint={failed ? "לא הצלחנו לטעון את היתרה מפולסים" : "הודעות זמינות להעברה ללקוחות"}
    />
  );
}
