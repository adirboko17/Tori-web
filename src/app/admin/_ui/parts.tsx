"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { contrastText } from "@/lib/superadmin/format";
import { initialOf, type Tone } from "./format";
import { Icon, type IconName } from "./icon";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header>
      {back ? (
        <Link href={back.href} className="ad-back">
          <Icon name="chevron-right" size={16} />
          {back.label}
        </Link>
      ) : null}
      <div className="ad-page-head">
        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="ad-page-actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export type TabItem = {
  href: string;
  label: string;
  icon?: IconName;
  count?: number;
  alert?: boolean;
  current?: boolean;
};

/** Link tabs. Without an explicit `current`, the tab whose href equals the pathname is active. */
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav className="ad-tabs" aria-label={label}>
      {items.map((item) => {
        const current = item.current ?? pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="ad-tab"
            aria-current={current ? "page" : undefined}
            scroll={false}
          >
            {item.icon ? <Icon name={item.icon} size={16} /> : null}
            {item.label}
            {item.count ? (
              <span className={`ad-tab-count ${item.alert ? "is-alert" : ""}`}>{item.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}) {
  return <span className={`ad-badge is-${tone} ${dot ? "has-dot" : ""}`}>{children}</span>;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  highlight = false,
  loading = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: IconName;
  href?: string;
  highlight?: boolean;
  loading?: boolean;
}) {
  const body = (
    <>
      <span className="ad-stat-label">
        {label}
        {icon ? <Icon name={icon} size={18} /> : null}
      </span>
      {loading ? (
        <span className="ad-skel" style={{ width: 96, height: 30 }} />
      ) : (
        <span className="ad-stat-value">{value}</span>
      )}
      {hint ? <span className="ad-stat-hint">{hint}</span> : null}
    </>
  );
  const className = `ad-stat ${highlight ? "is-highlight" : ""}`;
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="ad-empty">
      <div className="ad-empty-icon">
        <Icon name={icon} size={22} />
      </div>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="ad-empty">
      <div className="ad-empty-icon" style={{ background: "var(--red-100)", color: "var(--red-700)" }}>
        <Icon name="circle-alert" size={22} />
      </div>
      <h3>משהו השתבש</h3>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="ad-btn is-secondary is-sm" onClick={onRetry}>
          <Icon name="refresh-cw" size={16} />
          ניסיון נוסף
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonRows({ rows = 5, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="ad-skel-rows" aria-busy="true" aria-label="טוען">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="ad-skel-row">
          {avatar ? <span className="ad-skel" style={{ width: 36, height: 36, borderRadius: 10 }} /> : null}
          <span style={{ flex: 1, display: "grid", gap: 8 }}>
            <span className="ad-skel" style={{ width: `${40 + ((index * 17) % 30)}%`, height: 12 }} />
            <span className="ad-skel" style={{ width: `${20 + ((index * 11) % 20)}%`, height: 10 }} />
          </span>
          <span className="ad-skel" style={{ width: 72, height: 22, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="ad-search">
      <Icon name="search" size={16} />
      <input
        className="ad-input"
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="ad-chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="ad-chip"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count != null ? <span className="ad-chip-count">{option.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  full = false,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`ad-field ${full ? "is-full" : ""}`}>
      <span className="ad-field-label">{label}</span>
      {children}
      {error ? <span className="ad-field-error">{error}</span> : hint ? <span className="ad-field-hint">{hint}</span> : null}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  ariaLabel,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <label className="ad-switch">
      <input
        type="checkbox"
        role="switch"
        aria-label={ariaLabel}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="ad-switch-track">
        <span className="ad-switch-thumb" />
      </span>
      <span>{label}</span>
    </label>
  );
}

export function Avatar({
  name,
  src,
  color,
  size,
  round = false,
}: {
  name: string | null | undefined;
  src?: string | null;
  color?: string | null;
  size?: "sm" | "lg";
  round?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  return (
    <span
      className={`ad-avatar ${size ? `is-${size}` : ""} ${round ? "is-round" : ""}`}
      style={color && !showImage ? { background: color, color: contrastText(color) } : undefined}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- branding icons come from arbitrary storage URLs and need onError fallback
        <img src={src ?? ""} alt="" onError={() => setFailedSrc(src ?? null)} />
      ) : (
        initialOf(name)
      )}
    </span>
  );
}
