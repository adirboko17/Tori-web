import React from "react";
import { Badge } from "../core/Badge.jsx";

/** Underline tabs with a gradient indicator. */
export function Tabs({
  items = [],
  value,
  onChange,
  className = "",
  style,
  ...rest
}) {
  return (
    <div
      className={["tori-tabs", className].filter(Boolean).join(" ")}
      role="tablist"
      style={style}
      {...rest}
    >
      {items.map((it) => {
        const v = typeof it === "string" ? it : it.value;
        const l = typeof it === "string" ? it : it.label;
        const count = typeof it === "object" ? it.count : undefined;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={value === v}
            className="tori-tab"
            onClick={() => onChange && onChange(v)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {l}
            {count != null && (
              <Badge tone={value === v ? "brand" : "neutral"}>{count}</Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
