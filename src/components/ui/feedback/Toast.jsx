import React from "react";
import { Icon } from "../media/Icon.jsx";

const glyphs = { success: "circle-check", error: "circle-alert", info: "info" };
const colors = {
  success: "var(--green-300)",
  error: "var(--red-500)",
  info: "var(--teal-500)",
};

/** Dark pill confirmation, bottom of the screen. */
export function Toast({
  message,
  tone = "success",
  action,
  onAction,
  className = "",
  style,
  ...rest
}) {
  return (
    <div
      className={["tori-toast", className].filter(Boolean).join(" ")}
      role="status"
      style={style}
      {...rest}
    >
      <Icon
        name={glyphs[tone]}
        size={18}
        color={colors[tone]}
        glow={tone === "success"}
      />
      <span style={{ flex: 1 }}>{message}</span>
      {action && (
        <button
          type="button"
          onClick={onAction}
          style={{
            font: "var(--type-label)",
            color: "var(--green-300)",
            paddingInline: 4,
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
