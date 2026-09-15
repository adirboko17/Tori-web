import React from "react";
import { Icon } from "./Icon.jsx";

const sizes = { sm: 32, md: 40, lg: 56, xl: 72 };

/** Round avatar with initials fallback and an optional brand ring. */
export function Avatar({
  name = "",
  src,
  size = "md",
  ring = false,
  badge,
  style,
  ...rest
}) {
  const px = typeof size === "number" ? size : sizes[size] || sizes.md;
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        flex: "0 0 auto",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          width: px,
          height: px,
          borderRadius: "var(--radius-circle)",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          background: src ? "var(--ink-100)" : "var(--gradient-brand-soft)",
          color: "var(--green-900)",
          font: "var(--type-body-strong)",
          fontSize: Math.round(px * 0.36),
          boxShadow: ring
            ? "0 0 0 2px var(--white), 0 0 0 4px var(--green-400)"
            : "var(--shadow-inset-hairline)",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          initials || (
            <Icon
              name="user-round"
              size={Math.round(px * 0.5)}
              color="var(--green-700)"
            />
          )
        )}
      </span>
      {badge && (
        <span
          style={{
            position: "absolute",
            insetInlineEnd: -1,
            bottom: -1,
            width: Math.max(12, px * 0.3),
            height: Math.max(12, px * 0.3),
            borderRadius: "var(--radius-circle)",
            background:
              badge === "away" ? "var(--amber-500)" : "var(--green-500)",
            boxShadow: "0 0 0 2px var(--white)",
          }}
        />
      )}
    </span>
  );
}
