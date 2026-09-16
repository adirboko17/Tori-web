import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../sms.css";

export const metadata: Metadata = { title: "התשלום לא הושלם" };

export default function SmsFailurePage() {
  return (
    <main className="sms-result">
      <Image
        src="/assets/brand/tori-app-icon.png"
        width={72}
        height={72}
        alt="tori"
      />
      <h1>התשלום לא הושלם</h1>
      <p>לא חויב כלום, או שהעסקה נכשלה. אפשר לחזור לחנות ולנסות שוב.</p>
      <Link className="tori-btn tori-btn--secondary" href="/sms">
        ניסיון נוסף
      </Link>
      <Link className="tori-btn tori-btn--ghost" href="/">
        לדף הבית
      </Link>
    </main>
  );
}
