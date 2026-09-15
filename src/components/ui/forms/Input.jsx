import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Labelled text field with optional leading icon, hint and error. */
export function Input({
  label,
  hint,
  error,
  icon,
  id,
  className = "",
  style,
  ...rest
}) {
  const fid = id || `f-${label || rest.name || "input"}`;
  return (
    <div
      className={["tori-field", error && "tori-field--invalid", className]
        .filter(Boolean)
        .join(" ")}
      style={{ display: "grid", gap: 6, ...style }}
    >
      {label && (
        <label
          htmlFor={fid}
          style={{ font: "var(--type-label)", color: "var(--text-muted)" }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "grid" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              insetInlineStart: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--icon-muted)",
              pointerEvents: "none",
            }}
          >
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          id={fid}
          className={["tori-input", icon && "tori-input--with-icon"]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={!!error || undefined}
          {...rest}
        />
      </div>
      {(error || hint) && (
        <span
          style={{
            font: "var(--type-caption)",
            color: error ? "var(--text-danger)" : "var(--text-faint)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {error && <Icon name="circle-alert" size={13} />}
          {error || hint}
        </span>
      )}
    </div>
  );
}
