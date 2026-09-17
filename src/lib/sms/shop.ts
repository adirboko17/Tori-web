import { loadSmsPackages } from "@/lib/admin/catalog";
import { loadSmsBalance } from "./balance";
import { payplusConfigured } from "./env";
import { reconcilePendingOrders } from "./orders";
import type { SmsSession } from "./session";

export async function shopPayload(session: SmsSession) {
  try {
    await reconcilePendingOrders(session.businessId);
  } catch (error) {
    console.error("sms reconcile failed", error);
  }
  const balance = await loadSmsBalance(session.businessId);
  return {
    user: {
      name: session.name,
      phone: session.phone,
      businessId: session.businessId,
      businessName: session.businessName,
    },
    balance,
    packages: (await loadSmsPackages()).map((pack) => ({
      id: pack.id,
      smsCredits: pack.smsCredits,
      amountIls: pack.amountIls,
      label: pack.label,
      featured: Boolean(pack.featured),
    })),
    checkoutReady: payplusConfigured(),
  };
}
