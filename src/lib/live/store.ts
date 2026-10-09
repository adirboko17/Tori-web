import { getServiceSupabase } from "@/lib/sms/supabase-admin";

const ACTIVE_MS = 2 * 60 * 1000;
const RECENT_MS = 24 * 60 * 60 * 1000;
const CHECKOUT_NOW_MS = 30 * 60 * 1000;

type Stage = "browsing" | "checkout";
type EventKind = "visit" | "checkout" | "purchase";

export type LiveVisitor = {
  id: string;
  label: string;
  place: string;
  stage: Stage;
  seenAt: string;
};

export type LiveActivity = {
  id: string;
  kind: EventKind;
  title: string;
  detail: string;
  at: string;
};

export type LiveLocation = { label: string; count: number };

export type LiveSnapshot = {
  visitorsNow: number;
  checkoutsNow: number;
  purchasesRecent: number;
  sessionsToday: number;
  salesTodayIls: number;
  salesChangePct: number | null;
  sessionsChangePct: number | null;
  ordersToday: number;
  ordersChangePct: number | null;
  behavior: { viewing: number; checkout: number; purchased: number };
  locations: LiveLocation[];
  customers: { fresh: number; returning: number };
  visitors: LiveVisitor[];
  activity: LiveActivity[];
};

const CHECKOUT_PREFIXES = ["/onboarding", "/subscribe", "/sms", "/checkout"];

export function liveStageForPath(path: string): Stage {
  return CHECKOUT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
    ? "checkout"
    : "browsing";
}

export function pageLabel(path: string) {
  if (path === "/") return "דף הבית";
  if (path.startsWith("/onboarding")) return "תהליך הצטרפות";
  if (path.startsWith("/subscribe")) return "תשלום מנוי";
  if (path.startsWith("/sms")) return "חנות SMS";
  if (path.startsWith("/pricing")) return "מחירים";
  if (path.startsWith("/support")) return "תמיכה";
  if (path.startsWith("/privacy")) return "פרטיות";
  return "עמוד באתר";
}

const COUNTRY_LABELS: Record<string, string> = {
  IL: "ישראל",
  US: "ארצות הברית",
  GB: "בריטניה",
  FR: "צרפת",
  DE: "גרמניה",
  RU: "רוסיה",
  UA: "אוקראינה",
};

function placeLabel(country: string | null, city: string | null) {
  const countryName = country ? COUNTRY_LABELS[country] || country : "";
  return [city, countryName].filter(Boolean).join(" · ");
}

function startOfJerusalemDayIso() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const hour = read("hour") === 24 ? 0 : read("hour");
  const asUtc = Date.UTC(read("year"), read("month") - 1, read("day"), hour, read("minute"), read("second"));
  const offset = asUtc - Date.now();
  return new Date(Date.UTC(read("year"), read("month") - 1, read("day")) - offset).toISOString();
}

function money(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return `${Math.round(amount).toLocaleString("he-IL")} ₪`;
}

function amount(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function changePct(current: number, previous: number) {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function paidIn<T extends { paid_at?: string | null }>(rows: T[], start: number, end: number) {
  return rows.filter((row) => {
    const at = Date.parse(String(row.paid_at || ""));
    return at >= start && at < end;
  });
}

export async function recordLiveEvent(kind: EventKind, title: string, detail = "") {
  try {
    const { error } = await getServiceSupabase().from("site_live_events").insert({
      kind,
      title: title.slice(0, 120),
      detail: detail.slice(0, 180),
    });
    if (error) console.error("live event failed", error.message);
  } catch (error) {
    console.error("live event failed", error);
  }
}

export async function touchLiveSession(input: {
  sessionKey: string;
  visitorKey: string | null;
  path: string;
  country: string | null;
  city: string | null;
}) {
  const supabase = getServiceSupabase();
  const stage = liveStageForPath(input.path);
  const now = new Date().toISOString();
  const { data: existing, error: readError } = await supabase
    .from("site_live_sessions")
    .select("session_key, path, stage")
    .eq("session_key", input.sessionKey)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  if (!existing) {
    const { error } = await supabase.from("site_live_sessions").insert({
      session_key: input.sessionKey,
      path: input.path,
      stage,
      country: input.country,
      city: input.city,
      visitor_key: input.visitorKey,
      started_at: now,
      last_seen_at: now,
    });
    if (error) throw new Error(error.message);
    await recordLiveEvent(stage === "checkout" ? "checkout" : "visit", pageLabel(input.path), placeLabel(input.country, input.city));
    return;
  }

  const { error } = await supabase
    .from("site_live_sessions")
    .update({
      path: input.path,
      stage,
      country: input.country,
      city: input.city,
      visitor_key: input.visitorKey,
      last_seen_at: now,
    })
    .eq("session_key", input.sessionKey);
  if (error) throw new Error(error.message);

  const pathChanged = existing.path !== input.path;
  const enteredCheckout = stage === "checkout" && existing.stage !== "checkout";
  if (enteredCheckout || pathChanged) {
    await recordLiveEvent(
      stage === "checkout" ? "checkout" : "visit",
      pageLabel(input.path),
      placeLabel(input.country, input.city),
    );
  }
}

export async function pruneLiveRows() {
  const supabase = getServiceSupabase();
  const sessionsBefore = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const eventsBefore = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("site_live_sessions").delete().lt("last_seen_at", sessionsBefore);
  await supabase.from("site_live_events").delete().lt("created_at", eventsBefore);
}

export async function loadLiveSnapshot(): Promise<LiveSnapshot> {
  const supabase = getServiceSupabase();
  const now = Date.now();
  const activeSince = new Date(now - ACTIVE_MS).toISOString();
  const recentSince = new Date(now - RECENT_MS).toISOString();
  const dayStartIso = startOfJerusalemDayIso();
  const dayStart = Date.parse(dayStartIso);
  const yesterdayStart = dayStart - 24 * 60 * 60 * 1000;
  const yesterdayStartIso = new Date(yesterdayStart).toISOString();

  const [sessions, daySessions, yesterdaySessions, events, smsRows, accountRows, pricing] = await Promise.all([
    supabase
      .from("site_live_sessions")
      .select("session_key, path, stage, country, city, last_seen_at")
      .gte("last_seen_at", activeSince)
      .order("last_seen_at", { ascending: false })
      .limit(40),
    supabase
      .from("site_live_sessions")
      .select("session_key, visitor_key, country, city, started_at")
      .gte("started_at", dayStartIso)
      .limit(1000),
    supabase
      .from("site_live_sessions")
      .select("visitor_key, session_key")
      .gte("started_at", yesterdayStartIso)
      .lt("started_at", dayStartIso)
      .limit(1000),
    supabase
      .from("site_live_events")
      .select("id, kind, title, detail, created_at")
      .gte("created_at", recentSince)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("sms_topup_orders")
      .select("id, sms_credits, amount_ils, status, created_at, paid_at")
      .or(`paid_at.gte.${yesterdayStartIso},created_at.gte.${recentSince}`)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("site_customer_accounts")
      .select("id, business_name, created_at, paid_at")
      .or(`paid_at.gte.${yesterdayStartIso},created_at.gte.${recentSince}`)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase.from("site_pricing").select("monthly_price_ils").eq("id", "default").maybeSingle(),
  ]);

  const failure = [sessions.error, daySessions.error, yesterdaySessions.error, events.error, smsRows.error, accountRows.error, pricing.error].find(Boolean);
  if (failure) throw new Error(failure.message);

  const visitors: LiveVisitor[] = (sessions.data ?? []).map((row) => ({
    id: String(row.session_key),
    label: pageLabel(String(row.path || "/")),
    place: placeLabel(row.country ? String(row.country) : null, row.city ? String(row.city) : null) || "באתר",
    stage: row.stage === "checkout" ? "checkout" : "browsing",
    seenAt: String(row.last_seen_at),
  }));

  const activity: LiveActivity[] = [];
  for (const row of events.data ?? []) {
    const kind = row.kind === "checkout" || row.kind === "purchase" ? row.kind : "visit";
    activity.push({
      id: `e-${row.id}`,
      kind,
      title: String(row.title),
      detail: String(row.detail || ""),
      at: String(row.created_at),
    });
  }
  for (const row of smsRows.data ?? []) {
    const paid = row.status === "paid" || row.status === "fulfilled";
    activity.push({
      id: `sms-${row.id}`,
      kind: paid ? "purchase" : "checkout",
      title: paid ? "רכישת SMS" : "התחילו רכישת SMS",
      detail: [row.sms_credits ? `${Number(row.sms_credits).toLocaleString("he-IL")} הודעות` : "", money(row.amount_ils)]
        .filter(Boolean)
        .join(" · "),
      at: String(row.paid_at || row.created_at),
    });
  }
  for (const row of accountRows.data ?? []) {
    const paid = Boolean(row.paid_at);
    activity.push({
      id: `acc-${row.id}`,
      kind: paid ? "purchase" : "checkout",
      title: paid ? "הצטרפות חדשה" : "התחילו הצטרפות",
      detail: String(row.business_name || ""),
      at: String(row.paid_at || row.created_at),
    });
  }
  activity.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  const checkoutSessions = visitors.filter((visitor) => visitor.stage === "checkout").length;
  const freshOrders = (smsRows.data ?? []).filter(
    (row) => row.status === "pending" && Date.parse(String(row.created_at)) >= now - CHECKOUT_NOW_MS,
  ).length;
  const freshSignups = (accountRows.data ?? []).filter(
    (row) => !row.paid_at && Date.parse(String(row.created_at)) >= now - CHECKOUT_NOW_MS,
  ).length;
  const purchasesRecent =
    (smsRows.data ?? []).filter((row) => row.status === "paid" || row.status === "fulfilled").length +
    (accountRows.data ?? []).filter((row) => row.paid_at && Date.parse(String(row.paid_at)) >= now - RECENT_MS).length;

  const smsPaid = (smsRows.data ?? []).filter((row) => row.status === "paid" || row.status === "fulfilled");
  const accountsPaid = (accountRows.data ?? []).filter((row) => row.paid_at);
  const monthlyPrice = amount(pricing.data?.monthly_price_ils);
  const salesBetween = (start: number, end: number) =>
    paidIn(smsPaid, start, end).reduce((sum, row) => sum + amount(row.amount_ils), 0) +
    paidIn(accountsPaid, start, end).length * monthlyPrice;
  const ordersBetween = (start: number, end: number) =>
    paidIn(smsPaid, start, end).length + paidIn(accountsPaid, start, end).length;

  const todaySessions = daySessions.data ?? [];
  const seenYesterday = new Set(
    (yesterdaySessions.data ?? []).map((row) => String(row.visitor_key || row.session_key)),
  );
  let freshCustomers = 0;
  let returningCustomers = 0;
  const locationCounts = new Map<string, number>();
  for (const row of todaySessions) {
    const key = String(row.visitor_key || row.session_key);
    if (seenYesterday.has(key)) returningCustomers += 1;
    else freshCustomers += 1;
    const label = placeLabel(row.country ? String(row.country) : null, row.city ? String(row.city) : null) || "לא ידוע";
    locationCounts.set(label, (locationCounts.get(label) ?? 0) + 1);
  }
  const purchasedNow =
    paidIn(smsPaid, now - CHECKOUT_NOW_MS, now + 1).length +
    paidIn(accountsPaid, now - CHECKOUT_NOW_MS, now + 1).length;

  return {
    visitorsNow: visitors.length,
    checkoutsNow: checkoutSessions + freshOrders + freshSignups,
    purchasesRecent,
    sessionsToday: todaySessions.length,
    salesTodayIls: salesBetween(dayStart, now + 1),
    salesChangePct: changePct(salesBetween(dayStart, now + 1), salesBetween(yesterdayStart, dayStart)),
    sessionsChangePct: changePct(todaySessions.length, (yesterdaySessions.data ?? []).length),
    ordersToday: ordersBetween(dayStart, now + 1),
    ordersChangePct: changePct(ordersBetween(dayStart, now + 1), ordersBetween(yesterdayStart, dayStart)),
    behavior: {
      viewing: visitors.filter((visitor) => visitor.stage === "browsing").length,
      checkout: visitors.filter((visitor) => visitor.stage === "checkout").length,
      purchased: purchasedNow,
    },
    locations: [...locationCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count })),
    customers: { fresh: freshCustomers, returning: returningCustomers },
    visitors,
    activity: activity.slice(0, 30),
  };
}
