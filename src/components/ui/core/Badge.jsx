import React from "react";

const tones = {
  neutral: { background: "var(--ink-100)", color: "var(--ink-700)" },
  brand: { background: "var(--green-100)", color: "var(--green-900)" },
  lime: { background: "var(--lime-100)", color: "var(--lime-900)" },
  amber: {
    background: "var(--status-pending-bg)",
    color: "var(--status-pending-fg)",
  },
  red: {
    background: "var(--status-cancelled-bg)",
    color: "var(--status-cancelled-fg)",
  },
  teal: { background: "var(--status-info-bg)", color: "var(--status-info-fg)" },
  ink: { background: "var(--ink-900)", color: "var(--white)" },
  gradient: { background: "var(--gradient-brand)", color: "var(--ink-900)" },
};

/** Small non-interactive label: counts, statuses, "חדש", "3 בהמתנה". */
export function Badge({
  tone = "neutral",
  dot = false,
  children,
  style,
  ...rest
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: "var(--radius-pill)",
        padding: "4px 10px",
        font: "var(--type-caption)",
        fontWeight: "var(--weight-medium)",
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "currentColor",
          }}
        />
      )}
      {children}
    </span>
  );
}
