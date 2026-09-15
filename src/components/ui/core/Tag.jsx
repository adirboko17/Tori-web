import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Tappable chip: filters, selected services, removable choices. */
export function Tag({
  children,
  icon,
  selected,
  onSelect,
  onRemove,
  className = "",
  style,
  ...rest
}) {
  const selectable = !!onSelect;
  const cls = ["tori-tag", selectable && "tori-tag--selectable", className]
    .filter(Boolean)
    .join(" ");
  const Root = selectable ? "button" : "span";
  return (
    <Root
      className={cls}
      style={style}
      {...(selectable
        ? { type: "button", "aria-pressed": !!selected, onClick: onSelect }
        : {})}
      {...rest}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          aria-label="הסרה"
          className="tori-tag-x"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
        >
          <Icon name="x" size={12} />
        </span>
      )}
    </Root>
  );
}
