import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Checkbox with the gradient checked state. */
export function Checkbox({
  label,
  description,
  className = "",
  style,
  ...rest
}) {
  return (
    <label
      className={["tori-choice", className].filter(Boolean).join(" ")}
      style={style}
    >
      <input type="checkbox" {...rest} />
      <span className="tori-box">
        <span
          className="tori-box-mark"
          style={{ display: "grid", color: "var(--ink-900)" }}
        >
          <Icon name="check" size={14} strokeWidth={3} />
        </span>
      </span>
      <span className="tori-choice-label" style={{ display: "grid", gap: 2 }}>
        <span style={{ font: "var(--type-body)" }}>{label}</span>
        {description && (
          <span
            style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}
          >
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
