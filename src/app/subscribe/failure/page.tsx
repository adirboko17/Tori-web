import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../../sms/sms.css";

export const metadata: Metadata = { title: "התשלום לא הושלם" };

export default function SubscribeFailurePage() {
  return (
    <main className="sms-result">
      <Image
        src="/assets/brand/tori-app-icon.png"
        width={72}
        height={72}
        alt="tori"
      />
      <h1>התשלום לא הושלם</h1>
      <p>
        הוראת הקבע לא נקלטה, ולא בוצע חיוב. אפשר לחזור לטופס ולהשלים את התשלום.
      </p>
      <Link className="tori-btn tori-btn--secondary" href="/onboarding">
        חזרה להרשמה
      </Link>
      <Link className="tori-btn tori-btn--ghost" href="/">
        לדף הבית
      </Link>
    </main>
  );
}
