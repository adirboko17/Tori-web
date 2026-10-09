"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "tori-live-session";

function sessionId() {
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (existing && /^[a-zA-Z0-9_-]{16,64}$/.test(existing)) return existing;
  const created = crypto.randomUUID().replace(/-/g, "");
  sessionStorage.setItem(STORAGE_KEY, created);
  return created;
}

export function LiveBeacon() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    let id = "";
    try {
      id = sessionId();
    } catch {
      return;
    }

    const send = () => {
      void fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, path: pathname }),
        keepalive: true,
      }).catch(() => undefined);
    };

    send();
    const timer = window.setInterval(send, 15_000);
    const onHide = () => {
      if (document.visibilityState === "hidden") send();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [pathname]);

  return null;
}
