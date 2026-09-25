import type { Metadata } from "next";
import { SmsResult } from "../sms-result";

export const metadata: Metadata = { title: "התשלום לא הושלם" };

export default function SmsFailurePage() {
  return (
    <SmsResult tone="failure" title="התשלום לא הושלם" primaryLabel="ניסיון נוסף">
      לא חויב כלום, או שהעסקה נכשלה. אפשר לחזור לחנות ולנסות שוב.
    </SmsResult>
  );
}
