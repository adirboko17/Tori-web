import React from "react";
import { iconPaths, iconNames } from "./icon-paths.js";

/** Stroke icon. Lucide geometry at tori's stroke weight, recoloured via currentColor. */
export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color,
  glow = false,
  title,
  style,
  className = "",
  ...rest
}) {
  const markup = iconPaths[name];
  if (!markup) {
    if (typeof console !== "undefined")
      console.warn(`[tori] unknown icon "${name}"`);
    return null;
  }
  const filter =
    glow === "strong"
      ? "drop-shadow(0 0 8px rgba(12,255,190,.65))"
      : glow
        ? "drop-shadow(0 0 6px rgba(12,255,190,.5))"
        : undefined;
  return (
    <svg
      className={`tori-icon ${className}`.trim()}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      style={{
        color: color || "currentColor",
        flex: "0 0 auto",
        filter,
        ...style,
      }}
      dangerouslySetInnerHTML={{
        __html: (title ? `<title>${title}</title>` : "") + markup,
      }}
      {...rest}
    />
  );
}

export const availableIcons = iconNames;
