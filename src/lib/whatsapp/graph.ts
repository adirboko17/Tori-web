type TemplateOptions = {
  templateName?: string;
  languageCode?: string;
  useNameVar?: boolean;
  name?: string;
  extraBodyParams?: string[];
};

function templateParam(value: string) {
  return String(value || "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim()
    .slice(0, 900);
}

function authHeaders() {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  if (!token) throw new Error("חסר WHATSAPP_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function postWhatsApp(payload: Record<string, unknown>) {
  const phoneNumberId = process.env.PHONE_NUMBER_ID?.trim();
  if (!phoneNumberId) throw new Error("חסר PHONE_NUMBER_ID");
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
  const data = (await response.json().catch(() => ({}))) as {
    error?: { message?: string; error_user_msg?: string; code?: number };
    messages?: unknown[];
  };
  if (!response.ok) {
    const fb = data.error;
    const detail = fb?.error_user_msg || fb?.message || "שגיאת שליחה לוואטסאפ";
    if (fb?.code === 190) {
      throw new Error(`${detail} (הטוקן פג תוקף)`);
    }
    if (fb?.code === 131047 || fb?.code === 63016) {
      throw new Error(`${detail} (חלון 24 השעות סגור, נדרש תבנית מאושרת)`);
    }
    throw new Error(fb?.code ? `${detail} (${fb.code})` : detail);
  }
  return data;
}

export async function sendMessage(to: string, text: string) {
  return postWhatsApp({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  });
}

export async function sendProactiveMessage(to: string, name: string, options: TemplateOptions = {}) {
  const templateName =
    options.templateName || process.env.WHATSAPP_OPENING_TEMPLATE || "hello_world";
  const languageCode =
    options.languageCode || process.env.WHATSAPP_OPENING_TEMPLATE_LANG || "en_US";
  const useNameVar =
    options.useNameVar ?? process.env.WHATSAPP_OPENING_TEMPLATE_HAS_NAME === "true";
  const template: Record<string, unknown> = {
    name: templateName,
    language: { code: languageCode },
  };
  const displayName = String(options.name ?? name ?? "").trim();
  const parameters: { type: "text"; text: string }[] = [];
  if (useNameVar && displayName) parameters.push({ type: "text", text: displayName });
  for (const raw of options.extraBodyParams ?? []) {
    const text = templateParam(raw);
    if (text) parameters.push({ type: "text", text });
  }
  if (parameters.length) {
    template.components = [{ type: "body", parameters }];
  }
  return postWhatsApp({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template,
  });
}
