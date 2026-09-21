import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/guard";

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function guardAdmin() {
  const { session, response } = await requireAdminSession();
  if (!session) return { ok: false as const, response };
  return { ok: true as const, response: null };
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function ok(data: object = {}, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}
