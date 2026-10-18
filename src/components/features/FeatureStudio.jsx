"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import FeatureIcon from "./FeatureIcon";
import { SIDES, featuresOf } from "./features-data";

/* The capabilities page. Desktop: an index beside a pinned phone that loops
   the chosen demo. Phone: the index is an accordion, and the open row shows
   its explanation with the demo inside it. */

const MOBILE = "(max-width: 900px)";
const DEMOS = "/assets/demos/";
const NAV_CLEARANCE = 76; // the floating site bar covers the top of the screen

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

/** The demo video, looping. Until it can play, its first frame shows with a
    small "loading" note. Mount it with a key per feature so each starts fresh. */
function DemoVideo({ demo }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  // React leaves `muted` out of the server HTML, so the browser would refuse to autoplay
  useEffect(() => {
    const video = videoRef.current;
    video.muted = true;
    video.play().catch(() => {});
  }, []);
  return (
    <>
      <img className="tf-poster" src={DEMOS + demo + ".jpg"} alt="" />
      <video
        ref={videoRef}
        className={ready ? "tf-video is-ready" : "tf-video"}
        autoPlay
        muted
        playsInline
        loop
        onCanPlay={() => setReady(true)}
      >
        <source src={DEMOS + demo + ".webm"} type="video/webm" />
        <source src={DEMOS + demo + ".mp4"} type="video/mp4" />
      </video>
      {!ready && (
        <span className="tf-loading">
          <i />
          טוען הדגמה…
        </span>
      )}
    </>
  );
}

function Demo({ feature, side }) {
  return (
    <div className="tf-phone" aria-hidden="true">
      <div className="tori-device tori-brand-device" style={{ "--tilt": "0deg" }}>
        <div className="ha-screen tf-screen">
          {feature.demo ? (
            <DemoVideo key={feature.id} demo={feature.demo} />
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

/** On the phone, keeps the tapped row under the finger while the row above it
    closes, then brings the opened row up if its demo would run off screen. */
function useSteadyAccordion(activeId) {
  const tapped = useRef(null);
  useLayoutEffect(() => {
    const t = tapped.current;
    tapped.current = null;
    if (!t) return;
    const row = document.querySelector(`[data-row="${t.id}"]`);
    if (!row) return;
    const shift = row.getBoundingClientRect().top - t.top;
    if (shift) window.scrollTo({ top: window.scrollY + shift, behavior: "instant" });
    if (t.id !== activeId) return;
    const panel = row.parentElement.querySelector(".tf-panel-inner");
    const top = row.getBoundingClientRect().top;
    const bottom = top + row.offsetHeight + panel.scrollHeight;
    if (bottom > window.innerHeight) {
      window.scrollTo({ top: window.scrollY + top - NAV_CLEARANCE, behavior: "smooth" });
    }
  }, [activeId]);
  return (id, el) => {
    tapped.current = { id, top: el.getBoundingClientRect().top };
  };
}

export default function FeatureStudio() {
  const mobile = useMobile();
  const [side, setSide] = useState("customer");
  const list = featuresOf(side);
  const [activeId, setActiveId] = useState(list[0].id);
  const feature = list.find((f) => f.id === activeId) ?? list[0];
  const holdRow = useSteadyAccordion(activeId);

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
  function tap(id, el) {
    if (!mobile) return pick(id);
    // on the phone a row opens and closes like a question in an FAQ
    holdRow(id, el);
    pick(id === activeId ? null : id);
  }
  function switchSide(nextSide) {
    if (nextSide !== side) pick(featuresOf(nextSide)[0].id, nextSide);
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
              <Demo feature={feature} side={side} />
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
                    <li key={f.id} className={on ? "is-on" : undefined}>
                      <button
                        type="button"
                        data-row={f.id}
                        aria-current={on && !mobile ? "true" : undefined}
                        aria-expanded={mobile ? on : undefined}
                        onClick={(e) => tap(f.id, e.currentTarget)}
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
                            {on && <Demo feature={f} side={side} />}
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
