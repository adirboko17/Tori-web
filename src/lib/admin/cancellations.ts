import { assertStillAdmin, findAdminBusinesses } from "@/lib/sms/admins";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import {
  isCancellationId,
  isCancellationStatus,
  isOpenCancellationStatus,
  parseCancellationInput,
  type CancellationStatus,
} from "./cancellation-parse";

export {
  CANCELLATION_STATUSES,
  cancellationStatusLabel,
  isCancellationStatus,
  isOpenCancellationStatus,
  parseCancellationInput,
  type CancellationStatus,
} from "./cancellation-parse";

export type CancellationRequest = {
  id: string;
  businessId: string;
  businessName: string;
  requestedByUserId: string | null;
  requestedByName: string;
  requestedByPhone: string;
  status: CancellationStatus;
  note: string;
  requestedAt: string;
  effectiveAt: string | null;
  reviewedAt: string | null;
  reviewedByPhone: string | null;
};

export type OpenCancellation = {
  id: string;
  status: CancellationStatus;
  requestedAt: string;
};

const OPEN_STATUSES: CancellationStatus[] = ["requested", "seen"];
const CANCEL_KEY_PREFIX = "app_cancel_";
const PACKAGE_COLUMNS =
  "id, package_key, label, is_active, updated_at";

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export function isMissingCancellationTable(
  error: { code?: string; message?: string } | null | undefined,
) {
  const message = error?.message ?? "";
  return (
    error?.code === "PGRST205" ||
    error?.code === "42P01" ||
    /could not find the table/i.test(message) ||
    /does not exist/i.test(message)
  );
}

function cancelPackageKey(businessId: string) {
  return `${CANCEL_KEY_PREFIX}${businessId}`;
}

function fromPackageRow(row: Record<string, unknown>): CancellationRequest | null {
  try {
    const payload = asRecord(JSON.parse(String(row.label ?? "")));
    const businessId = String(payload.businessId ?? payload.business_id ?? "");
    if (!businessId) return null;
    return toRequest(
      {
        id: String(row.id ?? ""),
        business_id: businessId,
        requested_by_user_id: payload.requestedByUserId ?? payload.requested_by_user_id,
        requested_by_name: payload.requestedByName ?? payload.requested_by_name,
        requested_by_phone: payload.requestedByPhone ?? payload.requested_by_phone,
        status: payload.status,
        note: payload.note,
        requested_at: payload.requestedAt ?? payload.requested_at ?? row.updated_at,
        effective_at: payload.effectiveAt ?? payload.effective_at,
        reviewed_at: payload.reviewedAt ?? payload.reviewed_at,
        reviewed_by_phone: payload.reviewedByPhone ?? payload.reviewed_by_phone,
      },
      "",
    );
  } catch {
    return null;
  }
}

function toPackageLabel(request: Omit<CancellationRequest, "businessName">) {
  return JSON.stringify({
    businessId: request.businessId,
    requestedByUserId: request.requestedByUserId,
    requestedByName: request.requestedByName,
    requestedByPhone: request.requestedByPhone,
    status: request.status,
    note: request.note,
    requestedAt: request.requestedAt,
    effectiveAt: request.effectiveAt,
    reviewedAt: request.reviewedAt,
    reviewedByPhone: request.reviewedByPhone,
  });
}

async function listPackageCancellations(status?: CancellationStatus) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_sms_packages")
    .select(PACKAGE_COLUMNS)
    .like("package_key", `${CANCEL_KEY_PREFIX}%`)
    .order("updated_at", { ascending: false });
  if (error) throw new Error("טעינת בקשות הביטול נכשלה.");
  const rows = (data ?? [])
    .map((row) => fromPackageRow(asRecord(row)))
    .filter((row): row is CancellationRequest => Boolean(row))
    .filter((row) => (status ? row.status === status : true));
  const names = await loadBusinessNames([...new Set(rows.map((row) => row.businessId))]);
  return rows.map((row) => ({
    ...row,
    businessName: names.get(row.businessId) || "עסק",
  }));
}

async function upsertPackageCancellation(
  request: Omit<CancellationRequest, "businessName">,
) {
  const supabase = getServiceSupabase();
  const { data: existing } = await supabase
    .from("site_sms_packages")
    .select("id")
    .eq("package_key", cancelPackageKey(request.businessId))
    .maybeSingle();
  const patch = {
    package_key: cancelPackageKey(request.businessId),
    label: toPackageLabel(request),
    sms_credits: 1,
    amount_ils: 1,
    featured: false,
    sort_order: 999999,
    is_active: isOpenCancellationStatus(request.status),
    updated_at: new Date().toISOString(),
  };
  const query = existing
    ? supabase.from("site_sms_packages").update(patch).eq("id", existing.id)
    : supabase.from("site_sms_packages").insert(patch);
  const { data, error } = await query.select(PACKAGE_COLUMNS).single();
  if (error || !data) {
    console.error("cancellation package upsert failed", error);
    throw new Error("שמירת בקשת הביטול נכשלה.");
  }
  const mapped = fromPackageRow(asRecord(data));
  if (!mapped) throw new Error("שמירת בקשת הביטול נכשלה.");
  const names = await loadBusinessNames([mapped.businessId]);
  return {
    ...mapped,
    businessName: names.get(mapped.businessId) || "עסק",
  };
}

function toRequest(
  record: Record<string, unknown>,
  businessName: string,
): CancellationRequest {
  const status = isCancellationStatus(record.status)
    ? record.status
    : "requested";
  return {
    id: String(record.id ?? ""),
    businessId: String(record.business_id ?? ""),
    businessName,
    requestedByUserId: record.requested_by_user_id
      ? String(record.requested_by_user_id)
      : null,
    requestedByName: String(record.requested_by_name ?? "").trim() || "מנהל עסק",
    requestedByPhone: String(record.requested_by_phone ?? ""),
    status,
    note: String(record.note ?? ""),
    requestedAt: String(record.requested_at ?? record.created_at ?? ""),
    effectiveAt: record.effective_at ? String(record.effective_at) : null,
    reviewedAt: record.reviewed_at ? String(record.reviewed_at) : null,
    reviewedByPhone: record.reviewed_by_phone
      ? String(record.reviewed_by_phone)
      : null,
  };
}

async function loadBusinessNames(ids: string[]) {
  const names = new Map<string, string>();
  if (ids.length === 0) return names;
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("business_profile")
    .select("id, display_name")
    .in("id", ids);
  for (const row of data ?? []) {
    const record = asRecord(row);
    const id = String(record.id ?? "");
    if (!id) continue;
    names.set(id, String(record.display_name ?? "").trim() || "עסק");
  }
  return names;
}

async function verifyBusinessAdmin(input: {
  businessId: string;
  userId: string | null;
  phone: string;
}) {
  if (input.userId) {
    const admin = await assertStillAdmin(input.userId, input.businessId, input.phone);
    if (!admin) {
      return { ok: false as const, error: "רק מנהל העסק יכול לבקש ביטול." };
    }
    return {
      ok: true as const,
      userId: admin.userId,
      name: admin.name || "מנהל עסק",
    };
  }

  const found = await findAdminBusinesses(input.phone);
  if (!found.ok) return { ok: false as const, error: found.error };
  const admin = found.admins.find((row) => row.businessId === input.businessId);
  if (!admin) {
    return { ok: false as const, error: "רק מנהל העסק יכול לבקש ביטול." };
  }
  return {
    ok: true as const,
    userId: admin.userId,
    name: admin.name || "מנהל עסק",
  };
}

export async function listCancellationRequests(status?: CancellationStatus) {
  const supabase = getServiceSupabase();
  let query = supabase
    .from("site_cancellation_requests")
    .select(
      "id, business_id, requested_by_user_id, requested_by_name, requested_by_phone, status, note, requested_at, effective_at, reviewed_at, reviewed_by_phone, created_at",
    )
    .order("requested_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) {
    if (isMissingCancellationTable(error)) {
      return listPackageCancellations(status);
    }
    throw new Error("טעינת בקשות הביטול נכשלה.");
  }
  const rows = (data ?? []).map((row) => asRecord(row));
  const names = await loadBusinessNames(
    [...new Set(rows.map((row) => String(row.business_id ?? "")).filter(Boolean))],
  );
  return rows.map((row) =>
    toRequest(row, names.get(String(row.business_id ?? "")) || "עסק"),
  );
}

export async function countOpenCancellations() {
  const supabase = getServiceSupabase();
  const { count, error } = await supabase
    .from("site_cancellation_requests")
    .select("id", { count: "exact", head: true })
    .in("status", OPEN_STATUSES);
  if (error) {
    if (isMissingCancellationTable(error)) {
      const rows = await listPackageCancellations();
      return rows.filter((row) => isOpenCancellationStatus(row.status)).length;
    }
    throw new Error("טעינת בקשות הביטול נכשלה.");
  }
  return count ?? 0;
}

export async function loadOpenCancellationsByBusiness(businessIds: string[]) {
  const open = new Map<string, OpenCancellation>();
  if (businessIds.length === 0) return open;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_cancellation_requests")
    .select("id, business_id, status, requested_at")
    .in("business_id", businessIds)
    .in("status", OPEN_STATUSES);
  if (error) {
    if (isMissingCancellationTable(error)) {
      const rows = await listPackageCancellations();
      for (const row of rows) {
        if (!businessIds.includes(row.businessId)) continue;
        if (!isOpenCancellationStatus(row.status)) continue;
        open.set(row.businessId, {
          id: row.id,
          status: row.status,
          requestedAt: row.requestedAt,
        });
      }
      return open;
    }
    throw new Error("טעינת בקשות הביטול נכשלה.");
  }
  for (const row of data ?? []) {
    const record = asRecord(row);
    const businessId = String(record.business_id ?? "");
    const status = isCancellationStatus(record.status)
      ? record.status
      : "requested";
    if (!businessId || !isOpenCancellationStatus(status)) continue;
    const current = open.get(businessId);
    const requestedAt = String(record.requested_at ?? "");
    if (!current || requestedAt > current.requestedAt) {
      open.set(businessId, {
        id: String(record.id ?? ""),
        status,
        requestedAt,
      });
    }
  }
  return open;
}

export async function getOpenCancellationForAdmin(input: Record<string, unknown>) {
  const parsed = parseCancellationInput(input);
  if (!parsed.ok) return parsed;
  const admin = await verifyBusinessAdmin({
    businessId: parsed.businessId,
    userId: parsed.userId,
    phone: parsed.phone,
  });
  if (!admin.ok) return admin;
  const open = await loadOpenCancellationsByBusiness([parsed.businessId]);
  return {
    ok: true as const,
    request: open.get(parsed.businessId) ?? null,
  };
}

export async function createCancellationRequest(input: Record<string, unknown>) {
  const parsed = parseCancellationInput(input);
  if (!parsed.ok) return parsed;

  const admin = await verifyBusinessAdmin({
    businessId: parsed.businessId,
    userId: parsed.userId,
    phone: parsed.phone,
  });
  if (!admin.ok) return admin;

  const supabase = getServiceSupabase();
  const { data: existing, error: existingError } = await supabase
    .from("site_cancellation_requests")
    .select(
      "id, business_id, requested_by_user_id, requested_by_name, requested_by_phone, status, note, requested_at, effective_at, reviewed_at, reviewed_by_phone, created_at",
    )
    .eq("business_id", parsed.businessId)
    .in("status", OPEN_STATUSES)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError && !isMissingCancellationTable(existingError)) {
    throw new Error("בדיקת בקשת הביטול נכשלה.");
  }
  if (existingError && isMissingCancellationTable(existingError)) {
    const current = (await listPackageCancellations()).find(
      (row) =>
        row.businessId === parsed.businessId &&
        isOpenCancellationStatus(row.status),
    );
    if (current) {
      return { ok: true as const, existing: true, request: current };
    }
    const now = new Date().toISOString();
    const request = await upsertPackageCancellation({
      id: "",
      businessId: parsed.businessId,
      requestedByUserId: admin.userId,
      requestedByName: parsed.name === "מנהל עסק" ? admin.name : parsed.name,
      requestedByPhone: parsed.phone,
      status: "requested",
      note: parsed.note,
      requestedAt: now,
      effectiveAt: parsed.effectiveAt,
      reviewedAt: null,
      reviewedByPhone: null,
    });
    return { ok: true as const, existing: false, request };
  }
  const names = await loadBusinessNames([parsed.businessId]);
  const businessName = names.get(parsed.businessId) || "עסק";
  if (existing) {
    return {
      ok: true as const,
      existing: true,
      request: toRequest(asRecord(existing), businessName),
    };
  }

  const { data, error } = await supabase
    .from("site_cancellation_requests")
    .insert({
      business_id: parsed.businessId,
      requested_by_user_id: admin.userId,
      requested_by_name: parsed.name === "מנהל עסק" ? admin.name : parsed.name,
      requested_by_phone: parsed.phone,
      status: "requested",
      note: parsed.note,
      effective_at: parsed.effectiveAt,
    })
    .select(
      "id, business_id, requested_by_user_id, requested_by_name, requested_by_phone, status, note, requested_at, effective_at, reviewed_at, reviewed_by_phone, created_at",
    )
    .single();
  if (error || !data) {
    if (isMissingCancellationTable(error)) {
      const now = new Date().toISOString();
      const request = await upsertPackageCancellation({
        id: "",
        businessId: parsed.businessId,
        requestedByUserId: admin.userId,
        requestedByName: parsed.name === "מנהל עסק" ? admin.name : parsed.name,
        requestedByPhone: parsed.phone,
        status: "requested",
        note: parsed.note,
        requestedAt: now,
        effectiveAt: parsed.effectiveAt,
        reviewedAt: null,
        reviewedByPhone: null,
      });
      return { ok: true as const, existing: false, request };
    }
    if (error?.code === "23505") {
      const { data: again } = await supabase
        .from("site_cancellation_requests")
        .select(
          "id, business_id, requested_by_user_id, requested_by_name, requested_by_phone, status, note, requested_at, effective_at, reviewed_at, reviewed_by_phone, created_at",
        )
        .eq("business_id", parsed.businessId)
        .in("status", OPEN_STATUSES)
        .maybeSingle();
      if (again) {
        return {
          ok: true as const,
          existing: true,
          request: toRequest(asRecord(again), businessName),
        };
      }
    }
    throw new Error("שמירת בקשת הביטול נכשלה.");
  }

  return {
    ok: true as const,
    existing: false,
    request: toRequest(asRecord(data), businessName),
  };
}

export async function updateCancellationRequest(
  id: string,
  status: CancellationStatus,
  reviewedByPhone: string,
) {
  if (!isCancellationId(id)) {
    return { ok: false as const, error: "מזהה הבקשה אינו תקין." };
  }
  if (!isCancellationStatus(status)) {
    return { ok: false as const, error: "סטטוס הביטול אינו תקין." };
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_cancellation_requests")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by_phone: reviewedByPhone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      "id, business_id, requested_by_user_id, requested_by_name, requested_by_phone, status, note, requested_at, effective_at, reviewed_at, reviewed_by_phone, created_at",
    )
    .maybeSingle();
  if (error) {
    if (isMissingCancellationTable(error)) {
      const current = (await listPackageCancellations()).find((row) => row.id === id);
      if (!current) return { ok: false as const, error: "הבקשה לא נמצאה." };
      const request = await upsertPackageCancellation({
        ...current,
        status,
        reviewedAt: new Date().toISOString(),
        reviewedByPhone,
      });
      return { ok: true as const, request };
    }
    throw new Error("עדכון בקשת הביטול נכשל.");
  }
  if (!data) return { ok: false as const, error: "הבקשה לא נמצאה." };
  const names = await loadBusinessNames([String(asRecord(data).business_id ?? "")]);
  return {
    ok: true as const,
    request: toRequest(
      asRecord(data),
      names.get(String(asRecord(data).business_id ?? "")) || "עסק",
    ),
  };
}
