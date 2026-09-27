export function getOpeningMessage(name: string) {
  const firstName = name ? name.split(" ")[0] : "";
  const greeting = firstName ? `שלום ${firstName}` : "שלום";
  return `${greeting}, אני אליה מצוות טורי 🙂 ראיתי שהשארת פרטים והתעניינת באפליקציה. מאיזה תחום אתה מגיע?`;
}

export const LEAD_BUSINESS_TYPES = ["סלון ציפורניים", "ספר", "ספרית", "עיצוב גבות"] as const;

const NAIL_ROLE = "את בונת ציפורניים";

export function leadRoleClause(businessType: string | null | undefined) {
  const type = String(businessType || "").trim().replace(/\s+/g, " ");
  if (!type) return NAIL_ROLE;
  const folded = type.toLowerCase();

  if (/גבות|eyebrow|\bbrows?\b/.test(folded)) {
    if (/מעצב(?!ת)/.test(type)) return "אתה מעצב גבות";
    return "את מעצבת גבות";
  }
  if (/ספרית|מעצבת שיער/.test(type)) return "את ספרית";
  if (/מעצב שיער|ברבר|\bbarber\b/.test(folded) || /(^|[\s/])ספר($|[\s/])/.test(type)) {
    return "אתה ספר";
  }
  if (/מספרה|שיער|\bhair\b/.test(folded)) return "יש לך מספרה";
  if (/ציפורנ|\bnails?\b|מניקור|פדיקור/.test(folded)) return NAIL_ROLE;
  return `התחום שלך הוא ${type}`;
}

export function getFirstLeadMessage(messageName: string, businessType?: string | null) {
  const name = String(messageName || "").trim();
  const greeting = name ? `היי ${name}` : "היי";
  return `${greeting} מה שלומך ?\nהבנתי ש${leadRoleClause(businessType)} , זה נכון ?`;
}

export function isDefaultNailLeadMessage(text: string, messageName: string) {
  const name = String(messageName || "").trim();
  return text.trim() === getFirstLeadMessage(name, "סלון ציפורניים").trim();
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
