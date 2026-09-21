import { supabaseServiceRoleKey, supabaseUrl } from '@/lib/superadmin/env';

export const MSG_PULSEEM_401 =
  'הרשאה נדחתה (401) — בדוק ש-SUPABASE_SERVICE_ROLE_KEY ב-.env.local הוא מפתח service_role של אותו פרויקט כמו ה-URL (לא anon), ושפונקציות ה-Edge פרוסות.';

export const MSG_PULSEEM_SERVER =
  'שגיאת שרת — ודא פריסת פונקציות ה-Edge של פולסים ואת ה-Secrets: PULSEEM_MAIN_API_KEY, PULSEEM_FIELD_ENCRYPTION_KEY.';

export type EdgeFunctionName =
  | 'pulseem-admin-credentials'
  | 'pulseem-provision-subaccount'
  | 'pulseem-credit-transfer'
  | 'pulseem-delete-subaccount';

export interface EdgeResult<T> {
  data: T | null;
  status: number;
}

/**
 * Calls a Supabase Edge Function with the service-role JWT.
 *
 * Both `Authorization` and `apikey` must carry the SAME service-role JWT — with an
 * anon `apikey` the gateway can forward a request the function then rejects with 401.
 */
export async function invokeEdge<T extends object>(
  fn: EdgeFunctionName,
  body: Record<string, unknown>,
): Promise<EdgeResult<T>> {
  let base: string;
  let key: string;
  try {
    base = supabaseUrl();
    key = supabaseServiceRoleKey();
  } catch (e) {
    console.error(`[${fn}] missing env:`, e);
    return { data: null, status: 0 };
  }

  let res: Response;
  try {
    res = await fetch(`${base}/functions/v1/${fn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch (e) {
    console.error(`[${fn}] network error:`, e);
    return { data: null, status: 0 };
  }

  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;

  if (!res.ok) {
    console.error(`[${fn}] HTTP ${res.status}`, data);
    // Keep the body for callers that inspect `errorMessage` on non-2xx (delete-subaccount).
    return { data: res.status === 401 ? null : ((data as T) ?? null), status: res.status };
  }
  if (data && typeof data === 'object' && data.error === 'unauthorized') {
    return { data: null, status: 401 };
  }
  return { data: (data as T) ?? null, status: res.status };
}

/* ------------------------------------------------------------------ *
 * Typed wrappers, one per action used by the dashboard.
 * ------------------------------------------------------------------ */

export interface DirectSmsBalanceResponse {
  ok: boolean;
  directSmsCredits?: string;
  message?: string;
}

export async function fetchDirectSmsBalance(
  businessId: string,
  subAccountName?: string,
): Promise<{ ok: true; directSmsCredits: string } | { ok: false; message: string }> {
  const { data, status } = await invokeEdge<DirectSmsBalanceResponse>('pulseem-admin-credentials', {
    action: 'fetch_direct_sms_balance',
    businessId,
    ...(subAccountName?.trim() ? { subAccountName: subAccountName.trim() } : {}),
  });

  if (!data) {
    return { ok: false, message: status === 401 ? MSG_PULSEEM_401 : MSG_PULSEEM_SERVER };
  }
  if (data.ok && typeof data.directSmsCredits === 'string') {
    return { ok: true, directSmsCredits: data.directSmsCredits };
  }
  return { ok: false, message: data.message || 'לא ניתן לטעון יתרה' };
}

export interface TestConnectionResponse {
  ok: boolean;
  credits?: string;
  message?: string;
  directSmsCredits?: string | null;
  legacyWsCredits?: string | null;
  balanceNote?: string | null;
}

export async function testPulseemConnection(args: {
  businessId: string;
  userId: string;
  password: string;
  subAccountName?: string;
}): Promise<
  | {
      ok: true;
      credits: string;
      directSmsCredits: string | null;
      legacyWsCredits: string | null;
      balanceNote: string | null;
    }
  | { ok: false; message: string }
> {
  const { data, status } = await invokeEdge<TestConnectionResponse>('pulseem-admin-credentials', {
    action: 'test_connection',
    businessId: args.businessId,
    userId: args.userId.trim(),
    password: args.password.trim(),
    ...(args.subAccountName?.trim() ? { subAccountName: args.subAccountName.trim() } : {}),
  });

  if (!data) {
    return {
      ok: false,
      message:
        status === 401
          ? MSG_PULSEEM_401
          : 'בדיקה נכשלה — ודא פריסת pulseem-admin-credentials ומפתח PULSEEM_FIELD_ENCRYPTION_KEY ב-Supabase Secrets.',
    };
  }
  if (data.ok && typeof data.credits === 'string') {
    return {
      ok: true,
      credits: data.credits,
      directSmsCredits: data.directSmsCredits ?? null,
      legacyWsCredits: data.legacyWsCredits ?? null,
      balanceNote: data.balanceNote ?? null,
    };
  }
  return { ok: false, message: data.message || 'בדיקה נכשלה' };
}

export interface SaveCredentialsResponse {
  ok?: boolean;
  errorMessage?: string;
  envPlaintext?: Record<string, string>;
}

export async function savePulseemCredentials(args: {
  businessId: string;
  userId: string;
  password: string;
  fromNumber: string;
}): Promise<{ ok: boolean; errorMessage?: string; envPlaintext?: Record<string, string> }> {
  const { data, status } = await invokeEdge<SaveCredentialsResponse>('pulseem-admin-credentials', {
    action: 'save_credentials',
    businessId: args.businessId,
    userId: args.userId.trim(),
    password: args.password.trim(),
    fromNumber: args.fromNumber.trim(),
  });

  if (!data) {
    return {
      ok: false,
      errorMessage:
        status === 401
          ? MSG_PULSEEM_401
          : 'שמירה נכשלה — ודא פריסת pulseem-admin-credentials ו-PULSEEM_FIELD_ENCRYPTION_KEY ב-Supabase Secrets.',
    };
  }
  if (!data.ok) return { ok: false, errorMessage: data.errorMessage || 'שמירה נכשלה' };
  return { ok: true, envPlaintext: data.envPlaintext };
}

export interface ProvisionResponse {
  ok?: boolean;
  errorMessage?: string;
  loginUserName?: string;
  directSmsCredits?: number;
  envPlaintext?: Record<string, string>;
}

export async function provisionPulseemSubAccount(args: {
  businessId: string;
  subPassword?: string;
  fromNumber?: string;
  directSmsCredits?: number;
  replaceExisting?: boolean;
}): Promise<{
  ok: boolean;
  errorMessage?: string;
  loginUserName?: string;
  directSmsCredits?: number;
  envPlaintext?: Record<string, string>;
}> {
  const { data, status } = await invokeEdge<ProvisionResponse>('pulseem-provision-subaccount', {
    businessId: args.businessId,
    ...(args.subPassword?.trim() ? { subPassword: args.subPassword.trim() } : {}),
    ...(args.fromNumber?.trim() ? { fromNumber: args.fromNumber.trim() } : {}),
    ...(typeof args.directSmsCredits === 'number'
      ? { directSmsCredits: args.directSmsCredits }
      : {}),
    ...(args.replaceExisting ? { replaceExisting: true } : {}),
  });

  if (!data) {
    return {
      ok: false,
      errorMessage:
        status === 401
          ? MSG_PULSEEM_401
          : 'יצירת תת-חשבון נכשלה — פרוס את pulseem-provision-subaccount והגדר ב-Supabase Secrets: PULSEEM_MAIN_API_KEY, PULSEEM_FIELD_ENCRYPTION_KEY.',
    };
  }
  if (!data.ok) return { ok: false, errorMessage: data.errorMessage || 'יצירת תת-חשבון נכשלה' };

  return {
    ok: true,
    loginUserName: data.loginUserName,
    directSmsCredits: data.directSmsCredits,
    envPlaintext: data.envPlaintext,
  };
}

export interface CreditTransferResponse {
  ok?: boolean;
  errorMessage?: string;
  directSmsCreditsAfter?: number;
  smsCreditsAfter?: number;
  emailCreditsAfter?: number;
  directEmailCreditsAfter?: number;
  /** Ledger of purchased extras kept on top of the monthly package (when `asPrepaid`). */
  prepaidSmsCreditsAfter?: number;
}

/**
 * Manual top-ups should use `smsCredits` — that is the «חבילת SMS» pool Pulseem bills
 * SendSms from and the pool the balance endpoints read. `directSmsCredits` is the legacy
 * Direct pool and is effectively invisible. `asPrepaid` (default true for smsCredits in the
 * edge function) records the extra so the monthly refill does not eat it.
 */
export async function transferPulseemCredits(args: {
  businessId: string;
  directSmsCredits?: number;
  smsCredits?: number;
  emailCredits?: number;
  directEmailCredits?: number;
  asPrepaid?: boolean;
}): Promise<CreditTransferResponse & { ok: boolean }> {
  const { data, status } = await invokeEdge<CreditTransferResponse>('pulseem-credit-transfer', {
    businessId: args.businessId,
    ...(typeof args.directSmsCredits === 'number'
      ? { directSmsCredits: args.directSmsCredits }
      : {}),
    ...(typeof args.smsCredits === 'number' ? { smsCredits: args.smsCredits } : {}),
    ...(typeof args.asPrepaid === 'boolean' ? { asPrepaid: args.asPrepaid } : {}),
    ...(typeof args.emailCredits === 'number' ? { emailCredits: args.emailCredits } : {}),
    ...(typeof args.directEmailCredits === 'number'
      ? { directEmailCredits: args.directEmailCredits }
      : {}),
  });

  if (!data) {
    return {
      ok: false,
      errorMessage:
        status === 401
          ? MSG_PULSEEM_401
          : 'העברת קרדיטים נכשלה — פרוס את pulseem-credit-transfer והגדר PULSEEM_MAIN_API_KEY ו-PULSEEM_FIELD_ENCRYPTION_KEY ב-Supabase Secrets.',
    };
  }
  if (!data.ok) return { ok: false, errorMessage: data.errorMessage || 'CreditTransfer נכשל' };
  return { ...data, ok: true };
}

export interface DeleteSubaccountMeta {
  skipped?: boolean;
  deleted?: boolean;
  reason?: string;
  error?: string;
}

/** Best-effort — never blocks the DB delete. Mirrors `deleteBusiness` in the RN app. */
export async function deletePulseemSubAccount(businessId: string): Promise<DeleteSubaccountMeta> {
  const { data, status } = await invokeEdge<{
    ok?: boolean;
    deleted?: boolean;
    skipped?: boolean;
    reason?: string;
    errorMessage?: string;
    error?: string;
  }>('pulseem-delete-subaccount', { businessId });

  if (status === 0) return { skipped: true, reason: 'no_service_role_configured' };
  if (status === 401 || data?.error === 'unauthorized') return { error: MSG_PULSEEM_401 };
  if (data?.ok === true && data?.deleted === true) return { deleted: true };
  if (data?.ok === true && data?.skipped === true) {
    return { skipped: true, reason: String(data.reason ?? '').trim() || undefined };
  }
  if (data?.ok === false) {
    return { error: String(data.errorMessage ?? 'מחיקת תת-חשבון בפולסים נכשלה') };
  }
  if (!data) return { error: `אין תגובה מהשרת (HTTP ${status}) — מחיקת פולסים לא אושרה` };
  return { error: 'תגובה לא צפויה מ-pulseem-delete-subaccount' };
}
