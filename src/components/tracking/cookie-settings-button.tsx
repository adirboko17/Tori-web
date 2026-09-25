"use client";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("tori-cookie-settings"))}
      style={{
        font: "inherit",
        background: "transparent",
        border: 0,
        padding: 0,
        color: "inherit",
        textDecoration: "underline",
        cursor: "pointer",
      }}
    >
      שינוי בחירת העוגיות
    </button>
  );
}
