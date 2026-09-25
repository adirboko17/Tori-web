"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "לוח בקרה" },
  { href: "/admin/apps", label: "אפליקציות" },
  { href: "/admin/privacy-apps", label: "מדיניות פרטיות" },
  { href: "/admin/videos", label: "סרטונים" },
  { href: "/admin/whatsapp", label: "הודעות וואטסאפ" },
  { href: "/admin/packages", label: "חבילות הודעות" },
  { href: "/admin/pricing", label: "מחיר חודשי" },
  { href: "/admin/customers", label: "לקוחות" },
  { href: "/admin/operational-messages", label: "הודעות תפעוליות" },
  { href: "/admin/purchases", label: "רכישות" },
  { href: "/admin/cancellations", label: "בקשות ביטול" },
  { href: "/admin/account-deletions", label: "מחיקת חשבון" },
];

export function AdminNav({
  phone,
  pendingCancellations = 0,
}: {
  phone: string;
  pendingCancellations?: number;
}) {
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
              {link.href === "/admin/cancellations" && pendingCancellations > 0 ? (
                <span className="admin-nav-count">{pendingCancellations}</span>
              ) : null}
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
