import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Primary action control. Gradient = the one commit action on a screen. */
export function Button({
  variant = "primary",
  size = "md",
  block = false,
  icon,
  iconEnd,
  disabled = false,
  type = "button",
  children,
  className = "",
  style,
  ...rest
}) {
  const cls = [
    "tori-btn",
    `tori-btn--${variant}`,
    size !== "md" && `tori-btn--${size}`,
    block && "tori-btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const glyph = size === "lg" ? 20 : size === "sm" ? 16 : 18;
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      style={style}
      {...rest}
    >
      {icon && <Icon name={icon} size={glyph} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={glyph} />}
    </button>
  );
}
