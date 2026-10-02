import type { Metadata } from "next";
import { priceSummary } from "@/lib/booking";
import { loadMonthlyPriceIls } from "@/lib/admin/catalog";
import { readSignupPhone } from "@/lib/account/phone-ticket";
import { clearAccountSession, readAccountSession } from "@/lib/account/session";
import { loadPortal } from "@/lib/account/store";
import { AccountPortal, type AccountPortalInitial } from "./account-portal";
import "./account.css";

export const metadata: Metadata = {
  title: "התחברות או הרשמה",
  description: "נכנסים עם קוד לנייד, או נרשמים ומשלמים ואז משלימים את פרטי העסק.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await readAccountSession();
  let initial: AccountPortalInitial | null = null;
  if (session) {
    try {
      const portal = await loadPortal(session.accountId, session.userId);
      if (
        portal &&
        portal.businessId === session.businessId &&
        portal.phone === session.phone
      ) {
        initial = {
          fullName: portal.fullName,
          phone: portal.phone,
          businessName: portal.businessName,
          email: portal.email,
          appNameEn: portal.appNameEn,
          address: portal.address,
          idNumber: portal.idNumber,
          receiptName: portal.receiptName,
          receiptVat: portal.receiptVat,
          language: portal.language,
          brandColor: portal.brandColor,
          services: portal.services,
        };
      } else {
        await clearAccountSession();
      }
    } catch (error) {
      console.error("account page failed", error);
    }
  }

  let priceLabel = "";
  try {
    const summary = priceSummary(await loadMonthlyPriceIls());
    priceLabel = `${summary.total.toLocaleString("he-IL")} ₪ לחודש, כולל מע״מ`;
  } catch (error) {
    console.error("account price failed", error);
  }

  const signupPhone = initial ? null : await readSignupPhone();
  return (
    <AccountPortal initial={initial} signupPhone={signupPhone} priceLabel={priceLabel} />
  );
}
