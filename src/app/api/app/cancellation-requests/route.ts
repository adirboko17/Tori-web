import {
  createCancellationRequest,
  getOpenCancellationForAdmin,
} from "@/lib/admin/cancellations";
import {
  CONFIG_ERRORS,
  smsBackendConfigured,
} from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(request: Request) {
  if (!smsBackendConfigured()) {
    return withCors(jsonError(CONFIG_ERRORS.backend, 503));
  }
  const url = new URL(request.url);
  try {
    const result = await getOpenCancellationForAdmin({
      businessId: url.searchParams.get("businessId") ?? "",
      userId: url.searchParams.get("userId") ?? "",
      phone: url.searchParams.get("phone") ?? "",
    });
    if (!result.ok) return withCors(jsonError(result.error, 400));
    return withCors(jsonOk({ ok: true, request: result.request }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת בקשת הביטול נכשלה.";
    return withCors(jsonError(message, 500));
  }
}

export async function POST(request: Request) {
  if (!smsBackendConfigured()) {
    return withCors(jsonError(CONFIG_ERRORS.backend, 503));
  }
  const body = await readJsonBody(request);
  if (!body) return withCors(jsonError("בקשה לא תקינה."));
  try {
    const result = await createCancellationRequest(body);
    if (!result.ok) return withCors(jsonError(result.error, 400));
    return withCors(
      jsonOk({
        ok: true,
        existing: result.existing,
        request: result.request,
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "שמירת בקשת הביטול נכשלה.";
    return withCors(jsonError(message, 500));
  }
}
