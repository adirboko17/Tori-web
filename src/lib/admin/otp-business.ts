export type OtpBusinessMeta = {
  fromNumber: string;
  credits: number;
};

const DUMMY_SENDERS = /^(sds|test|demo|asd|xxx|tmp|fake|abc)$/i;

function phoneDigits(raw: string) {
  return String(raw ?? "").replace(/\D/g, "");
}

function israeliMobileIdentity(raw: string) {
  const digits = phoneDigits(raw);
  if (/^05\d{8}$/.test(digits)) return digits;
  if (/^9725\d{8}$/.test(digits)) return `0${digits.slice(3)}`;
  if (/^5\d{8}$/.test(digits)) return `0${digits}`;
  return digits;
}

export function isUnreliablePulseemSender(
  fromNumber: string,
  recipientPhone: string,
) {
  const from = String(fromNumber ?? "").trim();
  if (!from || from.length < 3 || DUMMY_SENDERS.test(from)) return true;
  const fromNorm = israeliMobileIdentity(from);
  const toNorm = israeliMobileIdentity(recipientPhone);
  return fromNorm.length >= 9 && fromNorm === toNorm;
}

export function rankOtpBusinesses<T extends { businessId: string }>(
  businesses: T[],
  meta: Map<string, OtpBusinessMeta>,
  recipientPhone: string,
) {
  const scored = businesses.map((business) => {
    const row = meta.get(business.businessId);
    if (!row) {
      return { business, score: -1000, unreliable: true };
    }
    const unreliable = isUnreliablePulseemSender(row.fromNumber, recipientPhone);
    return {
      business,
      score: unreliable ? row.credits - 500 : row.credits,
      unreliable,
    };
  });
  const reliable = scored.filter((row) => !row.unreliable);
  const pool = reliable.length > 0 ? reliable : scored;
  return pool
    .slice()
    .sort((left, right) => right.score - left.score)
    .map((row) => row.business);
}
