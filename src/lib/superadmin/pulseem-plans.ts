/**
 * כל עסק מתחיל עם 1,000 הודעות.
 * בכל 1 לחודש היתרה המוכללת מושלמת עד 1,000.
 * מעבר לזה אפשר רק להטעין ידנית.
 */

export const INCLUDED_SMS = 1000;
export const STARTING_SMS = 1000;

export type PulseemPlan = "regular";

export const DEFAULT_PULSEEM_PLAN: PulseemPlan = "regular";

export function normalizePulseemPlan(_value?: unknown): PulseemPlan {
  return DEFAULT_PULSEEM_PLAN;
}
