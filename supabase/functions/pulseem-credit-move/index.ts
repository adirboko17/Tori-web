// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  return new Response(
    JSON.stringify({
      ok: false,
      errorMessage:
        "החזרת קרדיטים לחשבון הראשי מושבתת: פולסים מוריד מהלקוח ולא מזכה את החשבון הראשי.",
    }),
    { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
  );
});
