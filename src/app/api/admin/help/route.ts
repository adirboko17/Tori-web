import { HelpCenterError, getHelpCenter } from "@/lib/superadmin/help-center";
import { fail, guardAdmin, ok } from "@/lib/superadmin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  try {
    return ok({ categories: await getHelpCenter() });
  } catch (error) {
    if (error instanceof HelpCenterError) return fail(error.message);
    console.error("[help]", error);
    return fail("טעינת מרכז העזרה נכשלה", 500);
  }
}
