import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { fetchMainPulseemBalance } from "@/lib/superadmin/pulseem-edge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const result = await fetchMainPulseemBalance();
  return result.ok ? ok({ smsCredits: result.smsCredits }) : fail(result.message, 502);
}
