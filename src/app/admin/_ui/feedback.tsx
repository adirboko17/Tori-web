"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "./icon";

/* ------------------------------------------------------------------ *
 * Toasts
 * ------------------------------------------------------------------ */

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; text: string };
type ToastApi = {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const TOAST_ICON: Record<ToastKind, IconName> = {
  success: "circle-check",
  error: "circle-alert",
  info: "info",
};

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, text: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, kind, text }]);
      window.setTimeout(() => dismiss(id), kind === "error" ? 8000 : 4500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (text) => push("success", text),
      error: (text) => push("error", text),
      info: (text) => push("info", text),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="ad-toasts" aria-live="polite" role="status">
        {toasts.map((toast) => (
          <div key={toast.id} className={`ad-toast is-${toast.kind}`}>
            <Icon name={TOAST_ICON[toast.kind]} />
            <span>{toast.text}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="סגירת ההודעה">
              <Icon name="x" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <AdminProviders>");
  return api;
}

/* ------------------------------------------------------------------ *
 * Confirm dialog
 * ------------------------------------------------------------------ */

export type ConfirmOptions = {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  /** When set, the confirm button stays disabled until this exact text is typed. */
  typeToConfirm?: string;
};

type ConfirmRequest = ConfirmOptions & { resolve: (value: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

function ConfirmDialog({ request, onClose }: { request: ConfirmRequest; onClose: (value: boolean) => void }) {
  const [typed, setTyped] = useState("");
  const titleId = useId();
  const bodyId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const danger = request.tone === "danger";
  const blocked = Boolean(request.typeToConfirm) && typed.trim() !== request.typeToConfirm?.trim();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    (request.typeToConfirm ? inputRef.current : confirmRef.current)?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose, request.typeToConfirm]);

  return (
    <>
      <div className="ad-overlay ad-dialog-backdrop" onClick={() => onClose(false)} />
      <div
        className="ad-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={request.body ? bodyId : undefined}
      >
        <div className={`ad-dialog-icon ${danger ? "is-danger" : ""}`}>
          <Icon name={danger ? "triangle-alert" : "info"} size={22} />
        </div>
        <div>
          <h2 id={titleId}>{request.title}</h2>
          {request.body ? <p id={bodyId}>{request.body}</p> : null}
        </div>
        {request.typeToConfirm ? (
          <label className="ad-field">
            <span className="ad-field-label">
              להמשך יש להקליד: <b>{request.typeToConfirm}</b>
            </span>
            <input
              ref={inputRef}
              className="ad-input"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !blocked) onClose(true);
              }}
            />
          </label>
        ) : null}
        <div className="ad-dialog-actions">
          <button
            ref={confirmRef}
            type="button"
            className={`ad-btn ${danger ? "is-danger" : "is-primary"}`}
            disabled={blocked}
            onClick={() => onClose(true)}
          >
            {request.confirmLabel ?? "אישור"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={() => onClose(false)}>
            {request.cancelLabel ?? "ביטול"}
          </button>
        </div>
      </div>
    </>
  );
}

function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setRequest({ ...options, resolve });
      }),
    [],
  );

  const close = useCallback(
    (value: boolean) => {
      request?.resolve(value);
      setRequest(null);
    },
    [request],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request ? <ConfirmDialog request={request} onClose={close} /> : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used inside <AdminProviders>");
  return confirm;
}

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
