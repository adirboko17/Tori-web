import React from "react";

/** Surface container. Everything in tori sits on a 20px-radius white card. */
export function Card({
  elevation = "raised",
  interactive = false,
  padding = "md",
  as = "div",
  children,
  className = "",
  style,
  ...rest
}) {
  const pad =
    padding === "none"
      ? 0
      : padding === "lg"
        ? "var(--pad-card-lg)"
        : padding === "sm"
          ? "var(--space-12)"
          : "var(--pad-card)";
  const cls = [
    "tori-card",
    `tori-card--${elevation}`,
    interactive && "tori-card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const Root = as;
  return (
    <Root className={cls} style={{ padding: pad, ...style }} {...rest}>
      {children}
    </Root>
  );
}
