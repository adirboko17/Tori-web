import Link from "next/link";
import { Icon, Logo } from "@/components/ui";
import "./sms.css";

export function SmsResult({ tone, title, children, primaryLabel }) {
  return (
    <div className="sms-page">
      <main className="sms-result">
        <div className="sms-result-card">
          <Link href="/" aria-label="תורי, לדף הבית" className="sms-result-logo">
            <Logo size={30} />
          </Link>
          <span className={`sms-result-icon is-${tone}`} aria-hidden="true">
            <Icon name={tone === "success" ? "check" : "x"} size={38} strokeWidth={2.6} />
          </span>
          <h1>{title}</h1>
          <p>{children}</p>
          <div className="sms-result-actions">
            <Link className="tori-btn tori-btn--secondary tori-btn--lg tori-btn--block" href="/sms">
              {primaryLabel}
            </Link>
            <Link className="tori-btn tori-btn--ghost tori-btn--block" href="/">
              לדף הבית
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
