"use client";

import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Icon } from "./icon";

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  onSubmit,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Renders the drawer as a form so footer submit buttons and Enter work. */
  onSubmit?: () => void;
  wide?: boolean;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      ".ad-drawer-body input, .ad-drawer-body select, .ad-drawer-body textarea, .ad-drawer-body button",
    );
    (focusable ?? panelRef.current)?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const content = (
    <>
      <div className="ad-drawer-head">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <button type="button" className="ad-icon-btn" onClick={onClose} aria-label="סגירה">
          <Icon name="x" />
        </button>
      </div>
      <div className="ad-drawer-body">{children}</div>
      {footer ? <div className="ad-drawer-foot">{footer}</div> : null}
    </>
  );

  return (
    <>
      <div className="ad-overlay" onClick={onClose} />
      {onSubmit ? (
        <form
          ref={panelRef as RefObject<HTMLFormElement | null>}
          className={`ad-drawer ${wide ? "is-wide" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {content}
        </form>
      ) : (
        <aside
          ref={panelRef}
          className={`ad-drawer ${wide ? "is-wide" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          {content}
        </aside>
      )}
    </>
  );
}
