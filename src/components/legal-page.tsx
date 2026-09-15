import Link from "next/link";
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <main style={{ maxWidth: 780, margin: "60px auto", padding: "32px 24px", display: "grid", gap: 24 }}><Link href="/">← חזרה לאתר</Link><h1>{title}</h1><div style={{ display: "grid", gap: 18, padding: 28, borderRadius: 22, background: "white", lineHeight: 1.8 }}>{children}</div></main>;
}
