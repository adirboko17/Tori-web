import { findSiteAdminByPhone, type SiteAdminPhone } from "@/lib/admin/auth";
import {
  CODE_RATE_LIMITED,
  CODE_REJECTED,
  PHONE_REJECTED,
  accessCodeMatches,
} from "@/lib/admin/access-code";
import {
  clearAccessCodeFailures,
  isAccessCodeLocked,
  noteAccessCodeFailure,
} from "@/lib/admin/login-attempts";
import { writeAdminOtpPending } from "@/lib/admin/session";
import { normalizeIsraeliMobile } from "@/lib/sms/phone";

const INVALID_PHONE = "צריך להזין מספר נייד ישראלי תקין.";

type LoginFailure = { ok: false; error: string; status: number };
type StartSuccess = { ok: true; phone: string; otpToken: string };
type VerifySuccess = { ok: true; admin: SiteAdminPhone };

export async function startMobileAccessLogin(rawPhone: string): Promise<StartSuccess | LoginFailure> {
  const phone = normalizeIsraeliMobile(rawPhone);
  if (!phone) return { ok: false, error: INVALID_PHONE, status: 400 };
  if (await isAccessCodeLocked(phone)) {
    return { ok: false, error: CODE_RATE_LIMITED, status: 429 };
  }

  const found = await findSiteAdminByPhone(phone);
  if (!found.ok) {
    return {
      ok: false,
      error: found.error === INVALID_PHONE ? INVALID_PHONE : PHONE_REJECTED,
      status: 400,
    };
  }

  const { token } = await writeAdminOtpPending({
    phone: found.admin.phone,
    businessId: found.admin.otpBusinessId ?? "",
  });
  return { ok: true, phone: found.admin.phone, otpToken: token };
}

export async function verifyMobileAccessCode(input: {
  phone: string;
  code: string;
}): Promise<VerifySuccess | LoginFailure> {
  const phone = normalizeIsraeliMobile(input.phone);
  if (!phone) return { ok: false, error: PHONE_REJECTED, status: 400 };
  if (await isAccessCodeLocked(phone)) {
    return { ok: false, error: CODE_RATE_LIMITED, status: 429 };
  }

  const found = await findSiteAdminByPhone(phone);
  if (!found.ok) return { ok: false, error: PHONE_REJECTED, status: 400 };

  if (!accessCodeMatches(input.code)) {
    const locked = await noteAccessCodeFailure(phone);
    return locked
      ? { ok: false, error: CODE_RATE_LIMITED, status: 429 }
      : { ok: false, error: CODE_REJECTED, status: 400 };
  }

  await clearAccessCodeFailures(phone);
  return { ok: true, admin: found.admin };
}
