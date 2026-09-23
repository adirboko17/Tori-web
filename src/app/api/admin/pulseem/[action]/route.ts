import { fail, guardAdmin, ok, UUID_RE } from "@/lib/superadmin/http";
import {
  fetchDirectSmsBalance,
  provisionPulseemSubAccount,
  savePulseemCredentials,
  testPulseemConnection,
  transferPulseemCredits,
} from "@/lib/superadmin/pulseem-edge";
import { getPulseemEditorState } from "@/lib/superadmin/queries";
import { syncPulseemEnvToBrandingStorage } from "@/lib/superadmin/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

type Action = "state" | "balance" | "provision" | "transfer" | "test" | "save";
const ACTIONS: Action[] = ["state", "balance", "provision", "transfer", "test", "save"];

type RouteContext = { params: Promise<{ action: string }> };

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { action } = await context.params;
  if (!ACTIONS.includes(action as Action)) return fail("פעולה לא מוכרת", 404);

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const businessId = str(body.businessId);
    if (!UUID_RE.test(businessId)) return fail("מזהה עסק לא תקין");

    if (action === "state") {
      const state = await getPulseemEditorState(businessId);
      if (!state) return fail("העסק לא נמצא", 404);
      return ok({ state });
    }

    if (action === "balance") {
      const result = await fetchDirectSmsBalance(businessId, str(body.subAccountName) || undefined);
      return result.ok
        ? ok({ directSmsCredits: result.directSmsCredits })
        : fail(result.message);
    }

    if (action === "provision") {
      const result = await provisionPulseemSubAccount({
        businessId,
        subPassword: str(body.subPassword) || undefined,
        fromNumber: str(body.fromNumber) || undefined,
        directSmsCredits: typeof body.directSmsCredits === "number" ? body.directSmsCredits : undefined,
        replaceExisting: body.replaceExisting === true,
      });
      if (!result.ok) return fail(result.errorMessage || "יצירת תת-חשבון נכשלה");
      const envSynced = result.envPlaintext
        ? await syncPulseemEnvToBrandingStorage(businessId, result.envPlaintext)
        : false;
      return ok({
        envSynced,
        loginUserName: result.loginUserName ?? null,
        directSmsCredits: result.directSmsCredits ?? null,
      });
    }

    if (action === "transfer") {
      // Accept both names; the UI historically sent `directSmsCredits`.
      const amount = Number(body.smsCredits ?? body.directSmsCredits);
      if (!Number.isFinite(amount) || amount <= 0) return fail("יש להזין כמות קרדיטים חיובית");
      if (amount > 10_000) return fail("מקסימום 10,000 קרדיטים בהעברה אחת");
      // SendSms is billed from the «חבילת SMS» pool (`smsCredits`) — the same pool the
      // balance endpoint reads and the monthly refill tops up. `directSmsCredits` lands in
      // the legacy Direct pool, which is neither displayed nor billed.
      const result = await transferPulseemCredits({
        businessId,
        smsCredits: Math.floor(amount),
        asPrepaid: true,
      });
      return result.ok
        ? ok({
            smsCreditsAfter: result.smsCreditsAfter ?? null,
            prepaidSmsCreditsAfter: result.prepaidSmsCreditsAfter ?? null,
          })
        : fail(result.errorMessage || "העברת קרדיטים נכשלה");
    }

    if (action === "test") {
      const userId = str(body.userId);
      const password = str(body.password);
      if (!userId || !password) return fail("יש להזין מזהה משתמש וסיסמה");
      const result = await testPulseemConnection({
        businessId,
        userId,
        password,
        subAccountName: str(body.subAccountName) || undefined,
      });
      return result.ok
        ? ok({
            credits: result.credits,
            directSmsCredits: result.directSmsCredits,
            legacyWsCredits: result.legacyWsCredits,
            balanceNote: result.balanceNote,
          })
        : fail(result.message);
    }

    const userId = str(body.userId);
    const fromNumber = str(body.fromNumber);
    if (!userId) return fail("חסר מזהה משתמש פולסים");
    if (!fromNumber) return fail("חסר מספר שולח (מאיזה מספר נשלח ה-SMS)");
    const result = await savePulseemCredentials({
      businessId,
      userId,
      password: str(body.password),
      fromNumber,
    });
    if (!result.ok) return fail(result.errorMessage || "שמירה נכשלה");
    const envSynced = result.envPlaintext
      ? await syncPulseemEnvToBrandingStorage(businessId, result.envPlaintext)
      : false;
    return ok({ envSynced });
  } catch (error) {
    const message = error instanceof Error ? error.message : "פעולת פולסים נכשלה";
    console.error("[pulseem]", error);
    return fail(message, 500);
  }
}
