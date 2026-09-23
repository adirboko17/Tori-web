export function getOpeningMessage(name: string) {
  const firstName = name ? name.split(" ")[0] : "";
  const greeting = firstName ? `שלום ${firstName}` : "שלום";
  return `${greeting}, אני אליה מצוות טורי 🙂 ראיתי שהשארת פרטים והתעניינת באפליקציה. מאיזה תחום אתה מגיע?`;
}

export function getFirstLeadMessage(messageName: string) {
  const name = String(messageName || "").trim();
  const greeting = name ? `היי ${name}` : "היי";
  return `${greeting} מה שלומך ?\nהבנתי שאת בונת ציפורניים , זה נכון ?`;
}

export function firstLeadTemplateOptions() {
  if (process.env.WHATSAPP_FIRST_LEAD_TEMPLATE) {
    return {
      templateName: process.env.WHATSAPP_FIRST_LEAD_TEMPLATE,
      languageCode:
        process.env.WHATSAPP_FIRST_LEAD_TEMPLATE_LANG ||
        process.env.WHATSAPP_OPENING_TEMPLATE_LANG ||
        "he",
      useNameVar: process.env.WHATSAPP_FIRST_LEAD_TEMPLATE_HAS_NAME !== "false",
    };
  }
  return {
    templateName: process.env.WHATSAPP_OPENING_TEMPLATE || "tori_first_contact",
    languageCode: process.env.WHATSAPP_OPENING_TEMPLATE_LANG || "he",
    useNameVar: process.env.WHATSAPP_OPENING_TEMPLATE_HAS_NAME === "true",
  };
}

export const LEAD_STATUSES = [
  "no_contact",
  "message_sent",
  "active_conversation",
  "relevant",
  "not_relevant",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  no_contact: "לא נוצר קשר",
  message_sent: "נשלח הודעה",
  active_conversation: "שיחה פעילה",
  relevant: "רלוונטי",
  not_relevant: "לא רלוונטי",
};

const FIRST_MESSAGE_SOURCES = new Set(["manual", "excel-import"]);

export function canSendFirstMessage(source: string | null | undefined) {
  return FIRST_MESSAGE_SOURCES.has(String(source || ""));
}

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}
