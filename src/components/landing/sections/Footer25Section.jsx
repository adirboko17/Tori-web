import { CookieSettingsButton } from "@/components/tracking/cookie-settings-button";

export default function Footer25Section() {
  return (
    <footer
      style={{
        background: "var(--white)",
        borderTop: "1px solid var(--line-subtle)",
        color: "var(--ink-600)",
        padding: "36px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "22px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/assets/brand/tori-mark.png"
            alt=""
            style={{ width: "30px", height: "30px" }}
          />
          <span style={{ fontSize: "14px" }}>
            {"tori · העסק שלך, האפליקציה שלך"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            fontSize: "14px",
          }}
        >
          <a className="ths12" href="/terms" style={{ color: "var(--ink-600)" }}>
            {"תנאי שימוש"}
          </a>
          <a className="ths13" href="/privacy" style={{ color: "var(--ink-600)" }}>
            {"מדיניות פרטיות"}
          </a>
          <a href="/cookies" style={{ color: "var(--ink-600)" }}>
            {"עוגיות"}
          </a>
          <CookieSettingsButton />
          <a
            className="ths14"
            href="/accessibility"
            id="accessibility"
            style={{ color: "var(--ink-600)" }}
          >
            {"הצהרת נגישות"}
          </a>
          <a
            href="https://wa.me/972535575303"
            style={{ color: "var(--green-700)", fontWeight: "500" }}
          >
            {"וואטסאפ"}
          </a>
        </div>
        <span style={{ fontSize: "13px", color: "var(--ink-400)" }}>
          {"כל הזכויות שמורות ל־Tori © 2026"}
        </span>
      </div>
    </footer>
  );
}
