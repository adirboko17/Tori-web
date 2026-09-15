import React from "react";
import { ModalFrame } from "./ModalFrame";

/** Bottom sheet — the tori app's main modal pattern. */
export function Sheet({
  open = true,
  title,
  onClose,
  actions,
  children,
  className = "",
  style,
  ...rest
}) {
  if (!open) return null;
  return (
    <ModalFrame onClose={onClose} style={style}>
      <div
        className={["tori-sheet", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        <span className="tori-sheet-grip" />
        {title && (
          <h3
            style={{
              font: "var(--type-heading)",
              color: "var(--text-strong)",
              marginBottom: "var(--space-12)",
            }}
          >
            {title}
          </h3>
        )}
        {children}
        {actions && (
          <div
            style={{
              display: "grid",
              gap: "var(--space-8)",
              marginTop: "var(--space-20)",
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </ModalFrame>
  );
}
