import React from "react";
import { Icon } from "../media/Icon.jsx";

/** Bottom navigation for the tori app. 3–5 destinations.
 *  variant="floating" is the shipped app nav: a white pill over the content with a
 *  raised brand circle on the active destination and no labels. */
export function TabBar({
  items = [],
  value,
  onChange,
  variant = "bar",
  safeArea = true,
  className = "",
  style,
  ...rest
}) {
  const floating = variant === "floating";
  const cls = ["tori-tabbar", floating && "tori-tabbar--floating", className]
    .filter(Boolean)
    .join(" ");

  const buttons = items.map((it) => {
    const active = value === it.value;
    const raised = floating && active;
    return (
      <button
        key={it.value}
        type="button"
        className="tori-tabbar-item"
        aria-current={active ? "page" : undefined}
        aria-label={floating ? it.label : undefined}
        onClick={() => onChange && onChange(it.value)}
      >
        <span
          className={raised ? "tori-tabbar-raised" : undefined}
          style={{
            position: "relative",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon
            name={it.icon}
            size={raised ? 25 : 23}
            strokeWidth={active ? 2.25 : 2}
            glow={active && !floating}
          />
          {it.count > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                insetInlineEnd: -8,
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                borderRadius: "var(--radius-pill)",
                background: "var(--red-500)",
                color: "var(--white)",
                font: "var(--type-caption)",
                fontSize: 10,
                display: "grid",
                placeItems: "center",
              }}
            >
              {it.count}
            </span>
          )}
        </span>
        {floating ? null : <span>{it.label}</span>}
      </button>
    );
  });

  if (floating) {
    return (
      <nav
        className={cls}
        style={{ paddingBottom: safeArea ? 22 : 14, ...style }}
        {...rest}
      >
        <div className="tori-tabbar-pill">{buttons}</div>
      </nav>
    );
  }
  return (
    <nav
      className={cls}
      style={{
        paddingBottom: safeArea ? 8 : 0,
        height: safeArea
          ? "calc(var(--tabbar-height) + 8px)"
          : "var(--tabbar-height)",
        ...style,
      }}
      {...rest}
    >
      {buttons}
    </nav>
  );
}
