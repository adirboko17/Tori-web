"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "לוח בקרה" },
  { href: "/admin/packages", label: "חבילות הודעות" },
  { href: "/admin/pricing", label: "מחיר חודשי" },
  { href: "/admin/customers", label: "לקוחות" },
  { href: "/admin/purchases", label: "רכישות" },
];

export function AdminNav({ phone }: { phone: string }) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  return (
    <aside className="admin-nav">
      <div className="admin-nav-brand">
        <img src="/assets/brand/tori-app-icon.png" width={32} height={32} alt="" />
        <strong>ניהול תורי</strong>
        <span className="admin-nav-email" dir="ltr">{phone}</span>
      </div>
      <nav className="admin-nav-links">
        {LINKS.map((link) => {
          const current =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => void logout()}>
          יציאה
        </button>
      </nav>
    </aside>
  );
}
