import { queueMainBalanceCheck } from "@/lib/admin/push";
import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { fetchMainPulseemBalance } from "@/lib/superadmin/pulseem-edge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const result = await fetchMainPulseemBalance();
  if (!result.ok) return fail(result.message, 502);
  queueMainBalanceCheck(result.smsCredits);
  return ok({ smsCredits: result.smsCredits });
}
