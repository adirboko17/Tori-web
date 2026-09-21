import { guardAdmin, ok } from "@/lib/superadmin/http";
import { getAllBusinesses, statsFromBusinesses } from "@/lib/superadmin/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const businesses = await getAllBusinesses();
  return ok({ businesses, stats: statsFromBusinesses(businesses) });
}
