import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Native select in tori clothing. */
export function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  id,
  children,
  className = "",
  style,
  ...rest
}) {
  const fid = id || `s-${label || rest.name || "select"}`;
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
        <select
          id={fid}
          className="tori-select"
          aria-invalid={!!error || undefined}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.value;
            const l = typeof o === "string" ? o : o.label;
            return (
              <option key={v} value={v}>
                {l}
              </option>
            );
          })}
        </select>
        <span
          style={{
            position: "absolute",
            insetInlineEnd: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--icon-muted)",
            pointerEvents: "none",
          }}
        >
          <Icon name="chevron-down" size={18} />
        </span>
      </div>
      {(error || hint) && (
        <span
          style={{
            font: "var(--type-caption)",
            color: error ? "var(--text-danger)" : "var(--text-faint)",
          }}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
