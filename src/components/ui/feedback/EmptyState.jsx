import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Empty / zero state: soft brand circle, glowing glyph, one line of copy, one action. */
export function EmptyState({
  icon = "calendar-days",
  title,
  description,
  action,
  className = "",
  style,
  ...rest
}) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        justifyItems: "center",
        gap: "var(--space-8)",
        textAlign: "center",
        padding: "var(--space-32) var(--space-20)",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          width: 76,
          height: 76,
          borderRadius: "var(--radius-circle)",
          display: "grid",
          placeItems: "center",
          background: "var(--gradient-brand-soft)",
          boxShadow: "var(--glow-ring)",
          marginBottom: "var(--space-8)",
        }}
      >
        <Icon
          name={icon}
          size={32}
          strokeWidth={1.75}
          color="var(--green-600)"
          glow
        />
      </span>
      {title && (
        <h4
          style={{
            font: "var(--type-subheading)",
            color: "var(--text-strong)",
          }}
        >
          {title}
        </h4>
      )}
      {description && (
        <p
          style={{
            font: "var(--type-body)",
            color: "var(--text-muted)",
            maxWidth: "32ch",
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: "var(--space-8)" }}>{action}</div>}
    </div>
  );
}
