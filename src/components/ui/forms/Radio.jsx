import React from "react";

/** Radio for one-of-many choices. */
export function Radio({ label, description, className = "", style, ...rest }) {
  return (
    <label
      className={["tori-choice", className].filter(Boolean).join(" ")}
      style={style}
    >
      <input type="radio" {...rest} />
      <span className="tori-box tori-box--radio">
        <span
          className="tori-box-mark"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--ink-900)",
          }}
        />
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
