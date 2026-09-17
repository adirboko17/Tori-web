import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "ניהול האתר",
  description: "ממשק ניהול תורי",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-page">{children}</div>;
}
