import type { Metadata } from "next";
import Link from "next/link";
import { priceSummary } from "@/lib/booking";
import { loadMonthlyPriceIls } from "@/lib/admin/catalog";
import "./checkout.css";

export const metadata: Metadata = {
  title: "תשלום מאובטח",
  description: "מנוי חודשי ל-Tori. התשלום עצמו מתבצע בדף המאובטח של PayPlus.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let priceLabel = "";
  try {
    const summary = priceSummary(await loadMonthlyPriceIls());
    priceLabel = `${summary.total.toLocaleString("he-IL")} ₪ לחודש, כולל מע״מ`;
  } catch (error) {
    console.error("checkout price failed", error);
  }

  return (
    <main className="checkout-page">
      <div className="checkout-card">
        <Link href="/" className="checkout-back">
          חזרה לאתר
        </Link>
        <p className="checkout-kicker">תשלום מאובטח</p>
        <h1>מנוי חודשי ל־Tori</h1>
        <p className="checkout-lead">
          אפליקציית קביעת תורים במותג העסק, הגשה לחנויות, וממשק ניהול. אין דמי
          הקמה ואין התחייבות.
        </p>

        <div className="checkout-price">
          <span>הוראת קבע חודשית</span>
          <strong>{priceLabel || "המחיר מוצג לפני המעבר לתשלום"}</strong>
        </div>

        <ol className="checkout-steps">
          <li>אימות מספר הנייד ופרטי העסק</li>
          <li>אישור התקנון, כולל מדיניות הביטולים</li>
          <li>הזנת כרטיס האשראי בדף המאובטח של PayPlus</li>
        </ol>

        <a className="checkout-cta" href="/onboarding">
          המשך לתשלום
        </a>

        <p className="checkout-secure">
          האתר פועל בחיבור מוצפן. פרטי הכרטיס אינם נשמרים אצלנו, והם מוזנים רק
          בדף הסליקה של PayPlus.
        </p>
        <p className="checkout-links">
          <Link href="/terms">תקנון ומדיניות ביטולים</Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy">מדיניות פרטיות</Link>
        </p>
      </div>
    </main>
  );
}
