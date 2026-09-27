import { allowSiteChat, parseChatMessages, siteChatIp } from "@/lib/chat/messages";
import { completeSiteChat } from "@/lib/chat/openrouter";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

const UNAVAILABLE =
  "הצ׳אט עדיין לא מחובר. אפשר לדבר איתנו בוואטסאפ 053-5575303.";
const FAILED =
  "לא הצלחתי לענות כרגע. אפשר לדבר איתנו בוואטסאפ 053-5575303.";

export async function POST(request: Request) {
  if (!allowSiteChat(siteChatIp(request))) {
    return jsonError(
      "רגע, קיבלתי הרבה הודעות. נסו שוב בעוד כמה דקות, או דברו איתנו בוואטסאפ.",
      429,
    );
  }

  const body = await readJsonBody(request);
  const messages = parseChatMessages(body?.messages);
  if (!messages) return jsonError("בקשה לא תקינה.");

  try {
    const reply = await completeSiteChat(messages);
    return jsonOk({ reply });
  } catch (error) {
    if (error instanceof Error && error.name === "SiteChatConfigError") {
      return jsonError(UNAVAILABLE, 503);
    }
    console.error("site chat failed");
    return jsonError(FAILED, 502);
  }
}
