"use client";
import { useEffect, useRef, useState } from "react";
import FeatureIcon from "./FeatureIcon";
import { SIDES, featuresOf } from "./features-data";

/* The capabilities page. Desktop: an index beside a pinned phone that plays
   the chosen demo, moving on to the next when it ends. Phone: the index is an
   accordion, and the open row shows its explanation with the demo inside it. */

const MOBILE = "(max-width: 900px)";
const DEMOS = "/assets/demos/";

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(MOBILE);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return mobile;
}

function Demo({ feature, side, loop, onEnded, onProgress }) {
  const videoRef = useRef(null);
  // React leaves `muted` out of the server HTML, so the browser would refuse to autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, [feature.id]);
  return (
    <div className="tf-phone" aria-hidden="true">
      <div className="tori-device tori-brand-device" style={{ "--tilt": "0deg" }}>
        <div className="ha-screen tf-screen">
          {feature.demo ? (
            <video
              key={feature.id}
              ref={videoRef}
              className="tf-video"
              poster={DEMOS + feature.demo + ".jpg"}
              autoPlay
              muted
              playsInline
              loop={loop}
              onEnded={onEnded}
              onTimeUpdate={(e) => onProgress?.(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
            >
              <source src={DEMOS + feature.demo + ".webm"} type="video/webm" />
              <source src={DEMOS + feature.demo + ".mp4"} type="video/mp4" />
            </video>
          ) : (
            <div key={feature.id} className={`tf-soon is-${side}`}>
              <span className="tf-soon-ico">
                <FeatureIcon name={feature.icon} size={34} />
              </span>
              <b>{feature.title}</b>
              <small>סרטון הדגמה בקרוב</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** The side switch: the two sides as big words; the chosen one carries the highlighter. */
function Switch({ side, onSide }) {
  return (
    <div className="tf-tabs" role="tablist" aria-label="איזה צד באפליקציה">
      {Object.entries(SIDES).map(([key, { label }]) => (
        <button key={key} type="button" role="tab" aria-selected={side === key} onClick={() => onSide(key)}>
          <span className="tf-tab-word">{label}</span>
          <small>{featuresOf(key).length}</small>
        </button>
      ))}
    </div>
  );
}

/** Finds the side and feature named in the address (#feature-id). */
function fromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  for (const side of Object.keys(SIDES)) {
    if (featuresOf(side).some((f) => f.id === id)) return { side, id };
  }
  return null;
}

export default function FeatureStudio() {
  const mobile = useMobile();
  const [side, setSide] = useState("customer");
  const list = featuresOf(side);
  const [activeId, setActiveId] = useState(list[0].id);
  const activeRef = useRef(null);
  const at = list.findIndex((f) => f.id === activeId);
  const feature = list[at] ?? list[0];

  useEffect(() => {
    const found = fromHash();
    if (!found) return;
    setSide(found.side);
    setActiveId(found.id);
  }, []);

  function pick(id, nextSide = side) {
    setSide(nextSide);
    setActiveId(id);
    if (id) window.history.replaceState(null, "", "#" + id);
  }
  function tap(id) {
    // on the phone a row opens and closes like a question in an FAQ
    pick(mobile && id === activeId ? null : id);
  }
  function switchSide(nextSide) {
    if (nextSide !== side) pick(featuresOf(nextSide)[0].id, nextSide);
  }
  function step(by) {
    const from = Math.max(0, at);
    pick(list[(from + by + list.length) % list.length].id);
  }
  function progress(p) {
    if (activeRef.current) activeRef.current.style.setProperty("--p", p.toFixed(3));
  }

  return (
    <section className="tf" data-side={side}>
      <header className="tf-hero">
        <h1>
          {"כל היכולות "}
          <span className="tori-word">{"של תורי"}</span>
        </h1>
        <p>{"לוחצים על יכולת ורואים אותה עובדת באפליקציה."}</p>
      </header>

      <div className="tf-studio">
        {!mobile && (
          <aside className="tf-stage">
            <div className="tf-flip" key={side}>
              <Demo feature={feature} side={side} onEnded={() => step(1)} onProgress={progress} />
            </div>
            <div className="tf-now" key={feature.id} aria-live="polite">
              <span className="tf-now-group">{feature.group}</span>
              <strong className="tf-now-title">{feature.title}</strong>
              <span className="tf-now-text">{feature.text}</span>
            </div>
          </aside>
        )}

        <nav className="tf-index" aria-label="היכולות">
          <Switch side={side} onSide={switchSide} />
          {SIDES[side].groups.map((group) => (
            <div key={group.title} className="tf-group">
              <span className="tf-group-title">
                {group.title}
                <small>{group.items.length}</small>
              </span>
              <ul>
                {group.items.map((f) => {
                  const on = f.id === activeId;
                  return (
                    <li key={f.id} ref={on ? activeRef : undefined} className={on ? "is-on" : undefined}>
                      <button
                        type="button"
                        aria-current={on && !mobile ? "true" : undefined}
                        aria-expanded={mobile ? on : undefined}
                        onClick={() => tap(f.id)}
                      >
                        <span className="tf-row-ico">
                          <FeatureIcon name={f.icon} />
                        </span>
                        <span className="tf-row-title">{f.title}</span>
                        {mobile && <span className="tf-row-plus" aria-hidden="true" />}
                      </button>
                      {mobile && (
                        <div className="tf-panel">
                          <div className="tf-panel-inner">
                            <p className="tf-panel-text">{f.text}</p>
                            {on && <Demo feature={f} side={side} loop />}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </section>
  );
}
