"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "tori-live-session";
const VISITOR_KEY = "tori-live-visitor";
const ID_RE = /^[a-zA-Z0-9_-]{16,64}$/;

function storedId(storage: Storage, key: string) {
  const existing = storage.getItem(key);
  if (existing && ID_RE.test(existing)) return existing;
  const created = crypto.randomUUID().replace(/-/g, "");
  storage.setItem(key, created);
  return created;
}

export function LiveBeacon() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    let sessionId = "";
    let visitorId = "";
    try {
      sessionId = storedId(sessionStorage, SESSION_KEY);
      visitorId = storedId(localStorage, VISITOR_KEY);
    } catch {
      return;
    }

    const send = (left = false) => {
      void fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, visitorId, path: pathname, left }),
        keepalive: true,
      }).catch(() => undefined);
    };

    send(false);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") send(false);
    }, 15_000);
    const onHide = () => send(true);
    const onVisibility = () => send(document.visibilityState === "hidden");
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  return null;
}
