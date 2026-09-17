export function resolveSmsRemaining(live: number | null, prepaidCredits: number) {
  if (live != null) return live;
  return prepaidCredits > 0 ? prepaidCredits : null;
}
