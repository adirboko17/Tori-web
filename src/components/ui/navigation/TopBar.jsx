import React from "react";
import { IconButton } from "../core/IconButton.jsx";

/** Screen header. `tone="brand"` paints the gradient behind it for hero screens. */
export function TopBar({
  title,
  subtitle,
  onBack,
  actions,
  tone = "plain",
  sticky = true,
  className = "",
  style,
  children,
  ...rest
}) {
  const brand = tone === "brand";
  const ink = tone === "ink";
  return (
    <header
      className={[ink && "tori-on-ink", className].filter(Boolean).join(" ")}
      style={{
        display: "grid",
        gap: 2,
        position: sticky ? "sticky" : "relative",
        top: 0,
        zIndex: 5,
        background: brand
          ? "var(--gradient-brand)"
          : ink
            ? "var(--surface-ink)"
            : "var(--surface-glass)",
        backdropFilter: tone === "plain" ? "var(--blur-glass)" : undefined,
        WebkitBackdropFilter:
          tone === "plain" ? "var(--blur-glass)" : undefined,
        borderBottom:
          tone === "plain" ? "1px solid var(--line-subtle)" : "none",
        color: ink ? "var(--text-on-ink)" : "var(--ink-900)",
        padding: `10px var(--gutter-screen)`,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-8)",
          minHeight: "var(--hit-min)",
        }}
      >
        {onBack && (
          <IconButton
            icon="chevron-right"
            label="חזור"
            onClick={onBack}
            style={{ marginInlineStart: -10 }}
          />
        )}
        <div style={{ display: "grid", gap: 1, flex: 1, minWidth: 0 }}>
          {title && (
            <span
              style={{
                font: "var(--type-heading)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </span>
          )}
          {subtitle && (
            <span
              style={{
                font: "var(--type-caption)",
                color: ink ? "rgba(255,255,255,.72)" : "var(--text-muted)",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
        {actions && (
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {actions}
          </div>
        )}
      </div>
      {children}
    </header>
  );
}
