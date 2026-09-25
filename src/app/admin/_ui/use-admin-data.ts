"use client";

import { useCallback, useEffect, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";

type State<T> = { data: T | null; error: string; version: number };

/**
 * GETs an admin endpoint and keeps the last good response on screen while reloading,
 * so tables don't flash back to skeletons after every action.
 */
export function useAdminData<T>(url: string | null) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<State<T>>({ data: null, error: "", version: -1 });

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    adminJson<T>(url)
      .then((data) => {
        if (!cancelled) setState({ data, error: "", version });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "הטעינה נכשלה";
        setState((current) => ({ ...current, error: message, version }));
      });
    return () => {
      cancelled = true;
    };
  }, [url, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  const mutate = useCallback((update: (current: T) => T) => {
    setState((current) => (current.data ? { ...current, data: update(current.data) } : current));
  }, []);

  return {
    data: state.data,
    error: state.error,
    loading: state.data === null && !state.error,
    refreshing: state.version !== version,
    reload,
    mutate,
  };
}
