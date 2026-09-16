import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../sms.css";

export const metadata: Metadata = { title: "התשלום התקבל" };

export default function SmsSuccessPage() {
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
        ההודעות יתווספו ליתרת «נקנו» תוך רגעים. הן נשארות מעל החבילה החודשית
        ולא מתאפסות ב-1 לחודש.
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
