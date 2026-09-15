import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Square shortcut tile from the app home screen: brand icon block, label under it,
 *  optional count bubble. Sits in a row of three. */
export function ActionTile({
  icon,
  label,
  count,
  tone = "brand",
  onClick,
  className = "",
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "tori-action",
        tone === "ink" && "tori-action--ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rest}
    >
      <span className="tori-action-ico">
        <Icon name={icon} size={24} strokeWidth={2} />
        {count > 0 && <span className="tori-action-count">{count}</span>}
      </span>
      <span className="tori-action-label">{label}</span>
    </button>
  );
}
