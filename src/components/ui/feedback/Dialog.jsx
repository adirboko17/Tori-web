import React from "react";
import { IconButton } from "../core/IconButton.jsx";
import { ModalFrame } from "./ModalFrame";

/** Centred modal. Positioned absolutely inside its container, so it works in a phone frame. */
export function Dialog({
  open = true,
  title,
  description,
  icon,
  actions,
  onClose,
  children,
  className = "",
  style,
  ...rest
}) {
  if (!open) return null;
  return (
    <ModalFrame onClose={onClose} style={style}>
      <div
        className={["tori-dialog", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-12)",
          }}
        >
          {icon}
          <div style={{ display: "grid", gap: 6, flex: 1 }}>
            {title && (
              <h3
                style={{
                  font: "var(--type-heading)",
                  color: "var(--text-strong)",
                }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                style={{ font: "var(--type-body)", color: "var(--text-muted)" }}
              >
                {description}
              </p>
            )}
          </div>
          {onClose && (
            <IconButton
              icon="x"
              label="סגירה"
              size="sm"
              onClick={onClose}
              style={{ marginTop: -6, marginInlineEnd: -8 }}
            />
          )}
        </div>
        {children && (
          <div style={{ marginTop: "var(--space-16)" }}>{children}</div>
        )}
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
