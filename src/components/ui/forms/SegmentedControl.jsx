import React from "react";

/** Two-to-four exclusive options in one pill row. */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  tone = "default",
  block = false,
  className = "",
  style,
  ...rest
}) {
  const cls = ["tori-seg", tone === "brand" && "tori-seg--brand", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={cls}
      role="tablist"
      style={{ width: block ? "100%" : undefined, ...style }}
      {...rest}
    >
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={value === v}
            className="tori-seg-item"
            onClick={() => onChange && onChange(v)}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
