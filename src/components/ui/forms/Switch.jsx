import React from "react";

/** On/off setting. Gradient track when on. */
export function Switch({ label, description, className = "", style, ...rest }) {
  return (
    <label
      className={["tori-switch", className].filter(Boolean).join(" ")}
      style={{ justifyContent: "space-between", width: "100%", ...style }}
    >
      <span style={{ display: "grid", gap: 2 }}>
        {label && <span style={{ font: "var(--type-body)" }}>{label}</span>}
        {description && (
          <span
            style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}
          >
            {description}
          </span>
        )}
      </span>
      <input type="checkbox" role="switch" {...rest} />
      <span className="tori-switch-track">
        <span className="tori-switch-thumb" />
      </span>
    </label>
  );
}
