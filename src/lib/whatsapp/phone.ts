export function normalizePhone(raw: unknown) {
  let phone = String(raw ?? "").replace(/\D/g, "");
  if (!phone) return null;
  if (phone.startsWith("0")) phone = `972${phone.slice(1)}`;
  return phone;
}
