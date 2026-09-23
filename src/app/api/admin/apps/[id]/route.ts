import { deleteBusiness } from "@/lib/superadmin/delete-business";
import { fail, guardAdmin, ok, UUID_RE } from "@/lib/superadmin/http";
import { getBusinessDetails } from "@/lib/superadmin/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה עסק לא תקין");
  const details = await getBusinessDetails(id);
  if (!details) return fail("העסק לא נמצא", 404);
  return ok(details);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה עסק לא תקין");
  const result = await deleteBusiness(id);
  return ok(result);
}
