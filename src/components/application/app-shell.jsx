"use client";
import React from "react";
import * as DS from "../ui";
const { Icon, Logo, Avatar, Badge } = DS;

/* ActionTile ships in the design system; this only covers the first render after it was
   added, before the bundle recompiles. Delete once the bundle carries it. */
const ActionTile =
  DS.ActionTile ||
  function ActionTileFallback({
    icon,
    label,
    count,
    tone = "brand",
    onClick,
    style,
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={["tori-action", tone === "ink" && "tori-action--ink"]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        <span className="tori-action-ico">
          <Icon name={icon} size={24} />
          {count > 0 ? (
            <span className="tori-action-count">{count}</span>
          ) : null}
        </span>
        <span className="tori-action-label">{label}</span>
      </button>
    );
  };

const IMG = "/assets/imagery/";
const WORK = [1, 2, 3, 4, 5, 6].map((n) => `${IMG}work-${n}.jpg`);

const phoneShell = {
  frame: {
    width: 390,
    background: "var(--ink-900)",
    borderRadius: 46,
    padding: 11,
    boxShadow: "var(--shadow-xl)",
    flex: "0 0 auto",
  },
  screen: {
    position: "relative",
    height: 780,
    background: "var(--surface-card)",
    borderRadius: 36,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  status: {
    height: 42,
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 26px",
    font: "var(--type-label)",
    color: "var(--text-strong)",
    fontFeatureSettings: "var(--numeric-tabular)",
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
};

function StatusBar({ onPhoto }) {
  const c = onPhoto ? "#fff" : "var(--text-strong)";
  return (
    <div
      style={{
        ...phoneShell.status,
        color: c,
        background: "transparent",
        position: onPhoto ? "absolute" : "relative",
        insetInline: onPhoto ? 0 : undefined,
        top: onPhoto ? 0 : undefined,
        zIndex: 5,
        textShadow: onPhoto ? "0 1px 6px rgba(0,0,0,.4)" : undefined,
      }}
    >
      <span>15:46</span>
      <span style={{ display: "flex", gap: 5, alignItems: "flex-end" }}>
        <span style={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
          {[5, 7, 9].map((h) => (
            <span
              key={h}
              style={{ width: 2.5, height: h, borderRadius: 1, background: c }}
            ></span>
          ))}
        </span>
        <span
          style={{
            width: 20,
            height: 10,
            border: `1.5px solid ${c}`,
            borderRadius: 3,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 1.5,
              insetInlineEnd: 6,
              background: c,
              borderRadius: 1,
            }}
          ></span>
        </span>
      </span>
    </div>
  );
}

function PhoneFrame({ children, footer, bar, onPhoto, label }) {
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <div className="tori-app-frame" style={phoneShell.frame}>
        <div className="tori-app-screen" style={phoneShell.screen}>
          <StatusBar onPhoto={onPhoto} />
          <div
            className="tori-phone-body"
            style={{ ...phoneShell.body, position: "relative" }}
          >
            {children}
          </div>
          {bar || footer ? (
            <div
              style={{
                flex: "0 0 auto",
                position: "absolute",
                insetInline: 0,
                bottom: 0,
                zIndex: 4,
              }}
            >
              {bar}
              {footer}
            </div>
          ) : null}
        </div>
      </div>
      {label ? (
        <span style={{ font: "var(--type-label)", color: "var(--text-muted)" }}>
          {label}
        </span>
      ) : null}
    </div>
  );
}

/** Full-bleed work-photo mosaic with the business mark over it — the app's signature header. */
function PhotoHeader({ name, height = 330 }) {
  return (
    <div style={{ position: "relative", height, flex: "0 0 auto" }}>
      <img
        src={`${IMG}work-mosaic.jpg`}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(20,18,18,.4) 0%,rgba(20,18,18,.04) 38%,rgba(20,18,18,0) 100%)",
        }}
      ></span>
      <span
        style={{
          position: "absolute",
          top: 54,
          insetInline: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 34,
            lineHeight: 1.12,
            color: "var(--white)",
            maxWidth: 280,
            textAlign: "center",
            background: "rgba(23,22,22,.6)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: 20,
            padding: "8px 20px 10px",
          }}
        >
          {name}
        </span>
      </span>
    </div>
  );
}

/** The sheet that rides up over the photo header. Everything below the mosaic lives in one. */
function HomeSheet({ children }) {
  return (
    <div
      style={{
        position: "relative",
        marginTop: -26,
        background: "var(--surface-page)",
        borderStartStartRadius: 28,
        borderStartEndRadius: 28,
        padding: "12px 16px 110px",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr)",
        gap: 12,
        minHeight: 420,
      }}
    >
      <span
        style={{
          width: 42,
          height: 4,
          borderRadius: 99,
          background: "rgba(23,22,22,.16)",
          justifySelf: "center",
          marginBottom: 2,
        }}
      ></span>
      {children}
    </div>
  );
}

/** Brand-filled date card: weekday + date on the lead edge, appointment count in a disc. */
function DateCard({ weekday, date, count }) {
  return (
    <div
      style={{
        borderRadius: 20,
        background: "var(--gradient-brand)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-brand)",
        color: "var(--text-on-brand)",
      }}
    >
      <span style={{ display: "grid", gap: 1 }}>
        <span
          style={{ font: "var(--type-caption)", fontWeight: 500, opacity: 0.8 }}
        >
          {weekday}
        </span>
        <span style={{ font: "var(--type-title)", fontSize: 22 }}>{date}</span>
      </span>
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(255,255,255,.92)",
          display: "grid",
          placeItems: "center",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span style={{ display: "grid", justifyItems: "center" }}>
          <span
            style={{
              font: "var(--type-heading)",
              fontSize: 20,
              color: "var(--ink-900)",
              lineHeight: 1,
            }}
          >
            {count}
          </span>
          <span
            style={{
              font: "var(--type-caption)",
              fontSize: 9,
              color: "var(--ink-500)",
            }}
          >
            תורים
          </span>
        </span>
      </span>
    </div>
  );
}

/** White card with a tinted icon block, a title, an optional trailing control, and a body row. */
function PanelCard({ icon, title, action, children }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: "var(--surface-brand-tint)",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
          }}
        >
          <Icon
            name={icon}
            size={18}
            style={{ color: "var(--icon-brand)" }}
            glow
          />
        </span>
        <span
          style={{
            font: "var(--type-body-strong)",
            color: "var(--text-strong)",
            flex: 1,
          }}
        >
          {title}
        </span>
        {action}
      </div>
      {children ? (
        <div style={{ borderTop: "1px solid var(--line-subtle)" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function QuietRow({ icon, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "16px 14px",
        color: "var(--text-faint)",
      }}
    >
      <Icon name={icon} size={17} />
      <span style={{ font: "var(--type-body)" }}>{children}</span>
    </div>
  );
}

function SectionLabel({ children, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "0 4px",
        marginBottom: 10,
      }}
    >
      <span style={{ font: "var(--type-label)", color: "var(--text-muted)" }}>
        {children}
      </span>
      {action}
    </div>
  );
}

const STATUS_LABEL = {
  confirmed: "אושר",
  pending: "בהמתנה",
  cancelled: "בוטל",
  done: "בוצע",
};
function StatusPill({ status }) {
  return (
    <span
      style={{
        font: "var(--type-caption)",
        fontWeight: 500,
        borderRadius: "var(--radius-chip)",
        padding: "4px 9px",
        background: `var(--status-${status}-bg)`,
        color: `var(--status-${status}-fg)`,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function AppointmentRow({ time, name, service, status, price, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-card)",
        padding: "var(--pad-card)",
        boxSizing: "border-box",
        width: "100%",
        boxShadow: "var(--shadow-sm)",
        transition: "var(--transition-surface)",
      }}
    >
      <span style={{ display: "grid", gap: 2, minWidth: 52 }}>
        <span
          dir="ltr"
          style={{
            font: "var(--type-body-strong)",
            color: "var(--text-strong)",
            fontFeatureSettings: "var(--numeric-tabular)",
          }}
        >
          {time}
        </span>
        <span
          style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}
        >
          {price}
        </span>
      </span>
      <span
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "var(--line-subtle)",
        }}
      ></span>
      <span style={{ display: "grid", gap: 3, flex: 1, minWidth: 0 }}>
        <span
          style={{
            font: "var(--type-body-strong)",
            color: "var(--text-strong)",
          }}
        >
          {name}
        </span>
        <span
          style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}
        >
          {service}
        </span>
      </span>
      <StatusPill status={status} />
    </button>
  );
}

export {
  ActionTile,
  PhoneFrame,
  StatusBar,
  PhotoHeader,
  HomeSheet,
  DateCard,
  PanelCard,
  QuietRow,
  SectionLabel,
  StatusPill,
  AppointmentRow,
  phoneShell,
  IMG,
  WORK,
};
