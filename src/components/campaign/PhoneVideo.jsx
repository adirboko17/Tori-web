"use client";
import { useEffect, useRef } from "react";

const DEMOS = "/assets/demos/";

/** A phone that loops one demo recording. With `eager` it plays at once;
    otherwise it starts loading only when it scrolls into view and pauses
    when it leaves, so a phone on mobile data downloads just what is seen. */
export default function PhoneVideo({ demo, poster, eager = false, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    // React leaves `muted` out of the server HTML, so the browser would refuse to autoplay
    video.muted = true;
    if (eager) {
      video.play().catch(() => {});
      return;
    }
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    watch.observe(video);
    return () => watch.disconnect();
  }, [eager]);

  return (
    <div className={"lp-phone " + className} aria-hidden="true">
      <div className="lp-phone-screen">
        <video
          ref={ref}
          poster={poster}
          muted
          playsInline
          loop
          preload={eager ? "auto" : "none"}
        >
          <source src={DEMOS + demo + ".webm"} type="video/webm" />
          <source src={DEMOS + demo + ".mp4"} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

/** A phone showing one still screen. */
export function PhoneStill({ src, className = "" }) {
  return (
    <div className={"lp-phone " + className} aria-hidden="true">
      <div className="lp-phone-screen">
        <img src={src} alt="" />
      </div>
    </div>
  );
}
