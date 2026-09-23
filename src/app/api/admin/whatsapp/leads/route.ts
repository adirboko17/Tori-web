import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { addManualLead } from "@/lib/whatsapp/actions";
import { dbErrorMessage } from "@/lib/whatsapp/client";
import { getLeads } from "@/lib/whatsapp/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  try {
    const leads = await getLeads();
    return ok({ leads });
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}

export async function POST(request: Request) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => ({}))) as {
    business?: string;
    phone?: string;
    business_type?: string;
    name?: string;
    notes?: string;
  };
  try {
    const lead = await addManualLead(body);
    return ok({ lead });
  } catch (err) {
    return fail(dbErrorMessage(err), 400);
  }
}
