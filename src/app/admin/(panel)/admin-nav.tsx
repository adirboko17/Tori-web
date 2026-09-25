"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "../_ui/icon";

type Area = { href: string; label: string; icon: IconName; count?: number };

function Brand() {
  return (
    <div className="ad-brand">
      <Image src="/assets/brand/tori-app-icon.png" width={36} height={36} alt="" />
      <div>
        <strong>Tori</strong>
        <span>ממשק ניהול</span>
      </div>
    </div>
  );
}

export function AdminShell({
  phone,
  openRequests,
  waitingChats,
  children,
}: {
  phone: string;
  openRequests: number;
  waitingChats: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const areas: Area[] = [
    { href: "/admin", label: "לוח בקרה", icon: "layout-dashboard" },
    { href: "/admin/businesses", label: "עסקים", icon: "store" },
    { href: "/admin/requests", label: "בקשות", icon: "inbox", count: openRequests },
    { href: "/admin/billing", label: "כספים", icon: "wallet" },
    { href: "/admin/whatsapp", label: "וואטסאפ", icon: "message-circle", count: waitingChats },
    { href: "/admin/content", label: "תוכן לאפליקציות", icon: "megaphone" },
  ];
  const attention = openRequests + waitingChats;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className={`ad-shell ${menuOpen ? "is-menu-open" : ""}`}>
      <header className="ad-topbar">
        <Brand />
        <button
          type="button"
          className="ad-icon-btn"
          aria-label="פתיחת התפריט"
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="menu" size={22} />
          {attention > 0 ? <span className="ad-topbar-count">{attention}</span> : null}
        </button>
      </header>

      <div className="ad-backdrop" onClick={() => setMenuOpen(false)} />

      <aside className="ad-sidebar" id="admin-sidebar">
        <Brand />
        <nav className="ad-nav" aria-label="אזורי הניהול">
          {areas.map((area) => {
            const current =
              area.href === "/admin" ? pathname === "/admin" : pathname.startsWith(area.href);
            return (
              <Link
                key={area.href}
                href={area.href}
                className="ad-nav-link"
                aria-current={current ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name={area.icon} size={19} />
                {area.label}
                {area.count ? <span className="ad-nav-count">{area.count}</span> : null}
              </Link>
            );
          })}
        </nav>
        <div className="ad-sidebar-foot">
          <span className="ad-avatar is-sm is-round" style={{ background: "var(--tori-lime)", color: "var(--ink-900)" }}>
            <Icon name="user" size={16} />
          </span>
          <div className="ad-sidebar-user">
            <strong>מנהל מערכת</strong>
            <span dir="ltr">{phone}</span>
          </div>
          <button
            type="button"
            className="ad-icon-btn"
            onClick={() => void logout()}
            aria-label="יציאה"
            title="יציאה"
          >
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </aside>

      <main className="ad-main">
        <div className="ad-content">{children}</div>
      </main>
    </div>
  );
}
