import type { Metadata, Viewport } from "next";
import "@/styles/design-system.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "תורי — העסק שלך. האפליקציה שלך.", template: "%s | tori" },
  description:
    "אפליקציית תורים ממותגת לעסק שלך. יומן חכם, ניהול לקוחות ותזכורות — בעיצוב ובצבעים שלך.",
  icons: {
    icon: "/assets/brand/tori-app-icon.png",
    apple: "/assets/brand/tori-app-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#BFFF51",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
