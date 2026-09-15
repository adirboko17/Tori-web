import React from "react";

/** Hover/focus tooltip. Desktop surfaces only. */
export function Tooltip({
  label,
  placement = "top",
  children,
  style,
  ...rest
}) {
  const [show, setShow] = React.useState(false);
  const pos =
    placement === "bottom"
      ? { top: "calc(100% + 8px)" }
      : { bottom: "calc(100% + 8px)" };
  return (
    <span
      style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      {...rest}
    >
      {children}
      {show && (
        <span
          className="tori-tooltip"
          role="tooltip"
          style={{
            position: "absolute",
            insetInlineStart: "50%",
            transform: "translateX(50%)",
            zIndex: 20,
            ...pos,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
