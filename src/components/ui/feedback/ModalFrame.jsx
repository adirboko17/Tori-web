"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Keep dialogs outside the scrolling screen; return focus to their trigger. */
export function ModalFrame({ onClose, children, style }) {
  const [host, setHost] = useState(null);
  const overlay = useRef(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => { setHost(document.querySelector(".tori-app-screen") || document.body); }, []);
  useEffect(() => {
    if (!host || !overlay.current) return;
    const previous = document.activeElement;
    const container = overlay.current;
    const focusable = () => Array.from(container.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select, textarea, [tabindex="0"]')).filter((element) => element.getClientRects().length);
    (focusable()[0] || container).focus();
    function onKey(event) {
      if (event.key === "Escape") { event.preventDefault(); close.current?.(); }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    container.addEventListener("keydown", onKey);
    return () => { container.removeEventListener("keydown", onKey); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [host]);
  if (!host) return null;
  return createPortal(<div ref={overlay} tabIndex={-1} className="tori-overlay" role="presentation" onClick={onClose} style={{ zIndex: 70, ...style }}>{children}</div>, host);
}
