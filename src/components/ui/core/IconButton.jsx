import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Square-tap icon-only control. Always give it an aria-label. */
export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  glow = false,
  disabled = false,
  className = "",
  ...rest
}) {
  const cls = [
    "tori-iconbtn",
    `tori-iconbtn--${variant}`,
    size !== "md" && `tori-iconbtn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const glyph = size === "lg" ? 24 : size === "sm" ? 18 : 20;
  return (
    <button
      type="button"
      className={cls}
      aria-label={label}
      title={label}
      disabled={disabled}
      {...rest}
    >
      <Icon name={icon} size={glyph} glow={glow} />
    </button>
  );
}
