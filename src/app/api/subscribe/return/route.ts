import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeAccountSession } from "@/lib/account/session";
import { claimPaidSubscriptionReturn } from "@/lib/claim-subscription-return";
import {
  payplusReturnDecision,
  readPayplusReturnFields,
  SUBSCRIBE_TRACK_COOKIE,
  type PayplusReturnFields,
} from "@/lib/payplus-return";
import { jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

function wantsJson(request: Request) {
  return (request.headers.get("accept") || "").includes("application/json");
}

async function fieldsFromRequest(request: Request) {
  const url = new URL(request.url);
  const fromQuery = Object.fromEntries(url.searchParams.entries());
  if (request.method === "GET") return readPayplusReturnFields(fromQuery);

  const contentType = request.headers.get("content-type") || "";
  let body: Record<string, unknown> = {};
  if (contentType.includes("application/json")) {
    body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  } else if (contentType.includes("form")) {
    const form = await request.formData().catch(() => null);
    if (form) body = Object.fromEntries(form.entries());
  } else {
    const text = await request.text().catch(() => "");
    if (text.trim().startsWith("{")) {
      try {
        body = JSON.parse(text) as Record<string, unknown>;
      } catch {
        body = {};
      }
    } else if (text.includes("=")) {
      body = Object.fromEntries(new URLSearchParams(text).entries());
    }
  }
  return readPayplusReturnFields({ ...fromQuery, ...body });
}

function successPageLocation(request: Request, fields: PayplusReturnFields) {
  const url = new URL("/subscribe/success", request.url);
  if (fields.transactionUid) url.searchParams.set("transaction_uid", fields.transactionUid);
  if (fields.pageRequestUid) url.searchParams.set("page_request_uid", fields.pageRequestUid);
  if (fields.moreInfo) url.searchParams.set("more_info", fields.moreInfo);
  if (fields.statusCode) url.searchParams.set("status_code", fields.statusCode);
  return url;
}

async function finish(request: Request, fields: PayplusReturnFields) {
  // Browsers drop cookies set while returning from the cross-site PayPlus page,
  // so the session is written by the same-origin request from /subscribe/success.
  if (!wantsJson(request)) {
    return NextResponse.redirect(successPageLocation(request, fields), 303);
  }
  if (payplusReturnDecision(fields) !== "lookup") {
    return NextResponse.json({ ok: false }, { status: 409 });
  }

  try {
    const claimed = await claimPaidSubscriptionReturn(fields);
    if (!claimed.ok || !claimed.account.userId || !claimed.account.businessId) {
      return NextResponse.json({ ok: false }, { status: 409 });
    }

    await writeAccountSession({
      accountId: claimed.account.id,
      userId: claimed.account.userId,
      businessId: claimed.account.businessId,
      phone: claimed.account.phone,
      name: claimed.account.fullName,
      businessName: claimed.account.businessName,
    });
    const store = await cookies();
    store.set(SUBSCRIBE_TRACK_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 30,
    });

    return jsonOk({ ok: true, next: "/account?paid=1" });
  } catch (error) {
    console.error("subscription return failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return finish(request, await fieldsFromRequest(request));
}

export async function POST(request: Request) {
  return finish(request, await fieldsFromRequest(request));
}
