"use client";

import { useEffect, useRef, useState } from "react";
import "./tori3d.css";

const LOADER_DONE = "tori:loader-done";

/** Tori in 3D. `cast` picks who's around him ("sms" bubbles, the app's
    "features", or the "chat" launcher's bubble); `mood` is a held state
    (idle / look / busy); `cue` is a one-off reaction ({ type: "happy" | "hop" |
    "error", id }). With `afterLoader`, the scene builds while the page loader is
    up and makes its entrance once the loader is gone. The flat mark shows only
    when WebGL isn't available. */
export function Tori3D({ cast = "sms", mood = "idle", cue, formSide = 1, afterLoader = false, className = "" }) {
  const hostRef = useRef(null);
  const moodRef = useRef(mood);
  const apiRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    if (cue?.type) apiRef.current?.cue(cue.type);
  }, [cue]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let api = null;
    let cancelled = false;
    let loaderGone = !afterLoader || Boolean(window.__toriLoaderDone);
    let timer = 0;
    const tryEnter = () => {
      if (!api || !loaderGone) return;
      // a beat after the loader starts fading, so the entrance is seen
      timer = window.setTimeout(() => api?.enter(), afterLoader ? 260 : 0);
    };
    const onLoaderDone = () => {
      loaderGone = true;
      tryEnter();
    };
    window.addEventListener(LOADER_DONE, onLoaderDone);
    import("./engine")
      .then(({ createToriScene }) => createToriScene(host, { cast, mood: () => moodRef.current, formSide }))
      .then((built) => {
        if (cancelled) {
          built.dispose();
          return;
        }
        api = built;
        apiRef.current = built;
        setStatus("ready");
        tryEnter();
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener(LOADER_DONE, onLoaderDone);
      apiRef.current = null;
      api?.dispose();
    };
  }, [cast, formSide, afterLoader]);

  return (
    <div
      ref={hostRef}
      className={`tori3d is-${cast} is-${status} ${className}`}
      onPointerDown={(event) => apiRef.current?.aim(event)}
      onClick={() => apiRef.current?.poke()}
      aria-hidden="true"
    >
      {status === "failed" ? (
        <img className="tori3d-fallback" src="/assets/brand/tori-mark.png" alt="" decoding="async" />
      ) : null}
    </div>
  );
}
