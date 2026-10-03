export type RecurringMrrSource = "recurring" | "mixed" | "catalog";

export type RecurringMrr = {
  totalIls: number;
  source: RecurringMrrSource;
  uniformIls: number | null;
  amountsIls: number[];
};

function roundIls(value: number) {
  return Math.round(value * 100) / 100;
}

function knownAmount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? roundIls(value)
    : null;
}

/** Sum standing-order charges. Missing charges fall back to the catalog price. */
export function expectedMonthlyRevenue(
  amounts: Array<number | null | undefined>,
  fallbackUnitIls: number,
): RecurringMrr {
  const fallback = knownAmount(fallbackUnitIls) ?? 0;
  let total = 0;
  let knownCount = 0;
  const knownValues: number[] = [];
  for (const amount of amounts) {
    const known = knownAmount(amount);
    if (known == null) {
      total += fallback;
      continue;
    }
    total += known;
    knownCount += 1;
    knownValues.push(known);
  }
  const source: RecurringMrrSource =
    amounts.length > 0 && knownCount === amounts.length
      ? "recurring"
      : knownCount > 0
        ? "mixed"
        : "catalog";
  const uniform =
    source === "recurring" &&
    knownValues.length > 0 &&
    knownValues.every((amount) => amount === knownValues[0]);
  return {
    totalIls: roundIls(total),
    source,
    uniformIls: uniform ? knownValues[0] : null,
    amountsIls: knownValues,
  };
}
