import {
  listAccountDeletionRequests,
  type AccountDeletionRequest,
} from "@/lib/account-deletions";
import { getWhatsappSupabase } from "@/lib/whatsapp/client";
import { listAdminBusinesses, PAID_ORDER_STATUSES, type AdminBusiness } from "./businesses";
import {
  isOpenCancellationStatus,
  listCancellationRequests,
  type CancellationRequest,
} from "./cancellations";
import { loadMonthlyPriceIls } from "./catalog";
import { listPurchases, type AdminPurchase } from "./customers";

export type ActivityItem = {
  id: string;
  kind: "business" | "purchase" | "cancellation" | "deletion";
  title: string;
  detail: string;
  at: string;
  href: string;
};

export type WaitingChat = {
  phone: string;
  name: string;
  lastMessageAt: string | null;
};

export type AdminSummary = {
  monthlyPriceIls: number;
  businesses: number;
  newBusinessesThisMonth: number;
  clients: number;
  activeSubscriptions: number;
  expectedMrrIls: number;
  smsRevenueThisMonthIls: number;
  smsPurchasesThisMonth: number;
  openCancellations: CancellationRequest[];
  recentDeletions: AccountDeletionRequest[];
  failedPurchases: AdminPurchase[];
  waitingChats: WaitingChat[] | null;
  smsBusinesses: { id: string; name: string }[];
  activity: ActivityItem[];
  errors: string[];
};

const RECENT_DELETION_DAYS = 7;
const FAILED_PURCHASE_DAYS = 30;

const monthFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "2-digit",
});

function monthKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "" : monthFormat.format(date);
}

function daysAgo(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

async function settle<T>(label: string, errors: string[], promise: Promise<T>, fallback: T) {
  try {
    return await promise;
  } catch (error) {
    console.error(`admin summary: ${label}`, error);
    errors.push(label);
    return fallback;
  }
}

export async function countWaitingChats() {
  const { count, error } = await getWhatsappSupabase()
    .from("wa_conversations")
    .select("phone", { count: "exact", head: true })
    .eq("status", "human");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function loadWaitingChats(): Promise<WaitingChat[]> {
  const { data, error } = await getWhatsappSupabase()
    .from("wa_conversations")
    .select("phone, name, last_message_at")
    .eq("status", "human")
    .order("last_message_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    phone: String(row.phone ?? ""),
    name: String(row.name ?? ""),
    lastMessageAt: row.last_message_at ? String(row.last_message_at) : null,
  }));
}

function buildActivity(
  businesses: AdminBusiness[],
  purchases: AdminPurchase[],
  cancellations: CancellationRequest[],
  deletions: AccountDeletionRequest[],
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...businesses.map((business) => ({
      id: `b-${business.id}`,
      kind: "business" as const,
      title: `עסק חדש: ${business.name}`,
      detail: business.clientName ? `אפליקציה ${business.clientName}` : "נוצר בממשק",
      at: business.createdAt,
      href: `/admin/businesses/${business.id}`,
    })),
    ...purchases
      .filter((purchase) => PAID_ORDER_STATUSES.includes(purchase.status))
      .map((purchase) => ({
        id: `p-${purchase.id}`,
        kind: "purchase" as const,
        title: `${purchase.businessName} רכשו ${purchase.smsCredits.toLocaleString("he-IL")} הודעות`,
        detail: `₪${purchase.amountIls.toLocaleString("he-IL")}`,
        at: purchase.paidAt || purchase.createdAt,
        href: `/admin/businesses/${purchase.businessId}?tab=billing`,
      })),
    ...cancellations.map((request) => ({
      id: `c-${request.id}`,
      kind: "cancellation" as const,
      title: `${request.businessName} ביקשו לבטל את המנוי`,
      detail: request.requestedByName,
      at: request.requestedAt,
      href: "/admin/requests",
    })),
    ...deletions.map((request) => ({
      id: `d-${request.id}`,
      kind: "deletion" as const,
      title: `בקשת מחיקת חשבון: ${request.fullName || "משתמש"}`,
      detail: request.appName || "אפליקציה לא ידועה",
      at: request.createdAt,
      href: "/admin/requests/deletions",
    })),
  ];
  return items
    .filter((item) => item.at)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);
}

export async function loadAdminSummary(): Promise<AdminSummary> {
  const errors: string[] = [];
  const [businesses, purchases, cancellations, deletions, waitingChats, monthlyPriceIls] =
    await Promise.all([
      settle("עסקים", errors, listAdminBusinesses(), [] as AdminBusiness[]),
      settle("רכישות", errors, listPurchases(), [] as AdminPurchase[]),
      settle("בקשות ביטול", errors, listCancellationRequests(), [] as CancellationRequest[]),
      settle("בקשות מחיקה", errors, listAccountDeletionRequests(), [] as AccountDeletionRequest[]),
      loadWaitingChats().catch(() => null),
      loadMonthlyPriceIls(),
    ]);

  const thisMonth = monthKey(new Date());
  const paidThisMonth = purchases.filter(
    (purchase) =>
      PAID_ORDER_STATUSES.includes(purchase.status) &&
      monthKey(purchase.paidAt || purchase.createdAt) === thisMonth,
  );
  const activeSubscriptions = businesses.filter(
    (business) => business.subscription === "active",
  ).length;

  return {
    monthlyPriceIls,
    businesses: businesses.length,
    newBusinessesThisMonth: businesses.filter(
      (business) => monthKey(business.createdAt) === thisMonth,
    ).length,
    clients: businesses.reduce((sum, business) => sum + business.clientCount, 0),
    activeSubscriptions,
    expectedMrrIls: activeSubscriptions * monthlyPriceIls,
    smsRevenueThisMonthIls: paidThisMonth.reduce((sum, purchase) => sum + purchase.amountIls, 0),
    smsPurchasesThisMonth: paidThisMonth.length,
    openCancellations: cancellations.filter((request) =>
      isOpenCancellationStatus(request.status),
    ),
    recentDeletions: deletions.filter(
      (request) => new Date(request.createdAt).getTime() >= daysAgo(RECENT_DELETION_DAYS),
    ),
    failedPurchases: purchases.filter(
      (purchase) =>
        purchase.status === "failed" &&
        new Date(purchase.createdAt).getTime() >= daysAgo(FAILED_PURCHASE_DAYS),
    ),
    waitingChats,
    smsBusinesses: businesses
      .filter((business) => business.hasPulseem)
      .map((business) => ({ id: business.id, name: business.name })),
    activity: buildActivity(businesses, purchases, cancellations, deletions),
    errors,
  };
}
