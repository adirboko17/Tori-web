export function purchaseBuyerLabel(input: {
  businessName?: string | null;
  adminName?: string | null;
  phone?: string | null;
}) {
  const business = String(input.businessName ?? "").trim();
  const admin = String(input.adminName ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const name =
    business && admin && business !== admin
      ? `${business} — ${admin}`
      : business || admin || "לקוח";
  return phone ? `${name}, ${phone}` : name;
}

export function purchaseSmsText(input: { buyer: string; credits: number }) {
  const credits = Math.max(0, Math.floor(Number(input.credits) || 0));
  const buyer = input.buyer.trim() || "לקוח";
  return `${buyer} קנה ${credits} הודעות`;
}

export function newAppSmsText(input: { buyer: string }) {
  const buyer = input.buyer.trim() || "לקוח";
  return `אפליקציה חדשה: ${buyer} נרכשה בהצלחה`;
}
