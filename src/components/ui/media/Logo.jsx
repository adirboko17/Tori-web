import React from "react";

const base = () => "";

/** The tori logo. Renders the supplied brand artwork — never a redrawn mark. */
export function Logo({
  variant = "lockup",
  size = 40,
  showWordmark,
  style,
  ...rest
}) {
  const root = base();
  const wordmark = showWordmark ?? variant === "lockup";
  if (variant === "tile") {
    return (
      <img
        src={`${root}/assets/brand/tori-app-icon.png`}
        alt="tori"
        style={{
          width: size,
          height: size,
          borderRadius: "var(--radius-squircle)",
          boxShadow: "var(--shadow-brand)",
          ...style,
        }}
        {...rest}
      />
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(size * 0.28),
        ...style,
      }}
      {...rest}
    >
      <img
        src={`${root}/assets/brand/tori-mark.png`}
        alt={wordmark ? "" : "tori"}
        style={{ width: size, height: size }}
      />
      {wordmark && (
        <img
          src={`${root}/assets/brand/tori-wordmark.png`}
          alt="tori"
          style={{ height: size * 0.52, width: "auto" }}
        />
      )}
    </span>
  );
}
