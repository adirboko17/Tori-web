import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../../sms/sms.css";

export const metadata: Metadata = { title: "הוראת הקבע נקלטה" };

export default function SubscribeSuccessPage() {
  return (
    <main className="sms-result">
      <Image
        src="/assets/brand/tori-app-icon.png"
        width={72}
        height={72}
        alt="tori"
      />
      <h1>הוראת הקבע נקלטה</h1>
      <p>
        החיוב החודשי של 299 ₪ + מע״מ נקלט. נחזור אליכם תוך 72 שעות להשלמת
        ההקמה. אפשר להתנתק מתי שרוצים.
      </p>
      <Link className="tori-btn tori-btn--secondary" href="/dashboard">
        לממשק הניהול
      </Link>
      <Link className="tori-btn tori-btn--ghost" href="/">
        לדף הבית
      </Link>
    </main>
  );
}
