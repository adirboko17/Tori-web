/** A tiny timeline for the feature scenes. Elements say what they do with
    data-fx and when with data-at (seconds into a 6s loop); this turns them
    into Web Animations and plays them only while the scene is on screen. */

const T = 6;
const OUT = 5.3;
const SPRING = "cubic-bezier(.34,1.56,.64,1)";
const SMOOTH = "cubic-bezier(.65,0,.35,1)";
const OUT_EASE = "cubic-bezier(.22,1,.36,1)";

const FROM = {
  scale: "scale(.4)",
  right: "translate(22px,0)",
  left: "translate(-22px,0)",
  up: "translate(0,-16px)",
  down: "translate(0,16px)",
};

/** [[seconds, props, easing]] -> keyframes on the 6s loop */
function loop(frames) {
  return frames.map(([t, props, easing]) => ({ offset: Math.min(t, T) / T, ...props, ...(easing ? { easing } : {}) }));
}

function timed(el) {
  const at = Number(el.dataset.at || 0);
  const out = Number(el.dataset.out || OUT);
  const hidden = { opacity: 0, transform: FROM[el.dataset.from || "scale"] };
  const shown = { opacity: 1, transform: "none" };
  switch (el.dataset.fx) {
    case "in":
      return loop([
        [0, hidden],
        [at, hidden, SPRING],
        [at + 0.55, shown],
        [out, shown, "ease-in"],
        [out + 0.3, { opacity: 0, transform: "scale(.94)" }],
        [T, { opacity: 0, transform: "scale(.94)" }],
      ]);
    case "show":
      return loop([[0, { opacity: 0 }], [at, { opacity: 0 }], [at + 0.15, { opacity: 1 }], [out, { opacity: 1 }], [out + 0.15, { opacity: 0 }], [T, { opacity: 0 }]]);
    case "hide":
      return loop([[0, { opacity: 1 }], [at, { opacity: 1 }], [at + 0.15, { opacity: 0 }], [out, { opacity: 0 }], [out + 0.15, { opacity: 1 }], [T, { opacity: 1 }]]);
    case "window": {
      const until = Number(el.dataset.until);
      return loop([[0, { opacity: 0 }], [at, { opacity: 0 }, OUT_EASE], [at + 0.25, { opacity: 1 }], [until, { opacity: 1 }], [until + 0.2, { opacity: 0 }], [T, { opacity: 0 }]]);
    }
    case "draw": {
      const dur = Number(el.dataset.dur || 0.6);
      return loop([
        [0, { strokeDashoffset: 1, opacity: 1 }],
        [at, { strokeDashoffset: 1, opacity: 1 }, SMOOTH],
        [at + dur, { strokeDashoffset: 0, opacity: 1 }],
        [out, { strokeDashoffset: 0, opacity: 1 }],
        [out + 0.3, { strokeDashoffset: 0, opacity: 0 }],
        [T, { strokeDashoffset: 1, opacity: 0 }],
      ]);
    }
    case "burst":
      return loop([
        [0, { opacity: 0, transform: "scale(.4)" }],
        [at, { opacity: 0, transform: "scale(.4)" }, OUT_EASE],
        [at + 0.2, { opacity: 1, transform: "scale(1)" }],
        [at + 0.6, { opacity: 0, transform: "scale(1.3)" }],
        [T, { opacity: 0, transform: "scale(1.3)" }],
      ]);
    case "wiggle":
      return loop([
        [0, { transform: "none" }],
        [at, { transform: "none" }],
        [at + 0.08, { transform: "rotate(-16deg)" }],
        [at + 0.18, { transform: "rotate(14deg)" }],
        [at + 0.28, { transform: "rotate(-10deg)" }],
        [at + 0.38, { transform: "rotate(7deg)" }],
        [at + 0.5, { transform: "none" }],
        [T, { transform: "none" }],
      ]);
    case "press":
      return loop([
        [0, { transform: "none" }],
        [at, { transform: "none" }, "ease-out"],
        [at + 0.12, { transform: "scale(.86)" }, SPRING],
        [at + 0.45, { transform: "none" }],
        [T, { transform: "none" }],
      ]);
    case "hop":
      return loop([
        [0, { transform: "none" }],
        [at, { transform: "none" }, "ease-out"],
        [at + 0.14, { transform: "translateY(2px) scale(1.05,.92)" }, "cubic-bezier(.2,.8,.3,1)"],
        [at + 0.38, { transform: "translateY(-18px) scale(.96,1.05)" }, "cubic-bezier(.5,0,.8,.4)"],
        [at + 0.6, { transform: "translateY(0) scale(1.06,.93)" }, OUT_EASE],
        [at + 0.8, { transform: "none" }],
        [T, { transform: "none" }],
      ]);
    case "fly": {
      const dx = Number(el.dataset.dx);
      const dy = Number(el.dataset.dy);
      const arc = Number(el.dataset.arc || 30);
      const dur = Number(el.dataset.dur || 0.9);
      const start = `translate(${dx}px,${dy}px)`;
      return loop([
        [0, { opacity: 0, transform: start }],
        [at, { opacity: 0, transform: start }],
        [at + 0.12, { opacity: 1, transform: start }, "cubic-bezier(.3,0,.6,1)"],
        [at + 0.12 + dur / 2, { opacity: 1, transform: `translate(${dx / 2}px,${dy / 2 - arc}px) rotate(-8deg)` }, "cubic-bezier(.4,0,.2,1)"],
        [at + 0.12 + dur, { opacity: 1, transform: "none" }],
        [out, { opacity: 1, transform: "none" }],
        [out + 0.3, { opacity: 0, transform: "none" }],
        [T, { opacity: 0, transform: start }],
      ]);
    }
    default:
      return null;
  }
}

const CONTINUOUS = {
  bob: [[{ transform: "none" }, { transform: "translateY(-3px)" }, { transform: "none" }], { duration: 2400, easing: "ease-in-out" }],
  float: [[{ transform: "none" }, { transform: "translateY(-4px)" }, { transform: "none" }], { duration: 3600, easing: "ease-in-out" }],
  blink: [[{ transform: "none", offset: 0 }, { transform: "none", offset: 0.44 }, { transform: "scaleY(.1)", offset: 0.47 }, { transform: "none", offset: 0.5 }, { transform: "none", offset: 1 }], { duration: 3800 }],
  wave: [[{ transform: "rotate(-5deg)" }, { transform: "rotate(5deg)" }], { duration: 1400, direction: "alternate", easing: "ease-in-out" }],
  spin: [[{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 1200 }],
  twinkle: [[{ transform: "scale(.7) rotate(0)" }, { transform: "scale(1.1) rotate(25deg)" }], { duration: 1500, direction: "alternate", easing: "ease-in-out" }],
  dot: [[{ transform: "none" }, { transform: "translateY(-3px)" }, { transform: "none" }], { duration: 800, easing: "ease-in-out" }],
  flow: [[{ strokeDashoffset: 0 }, { strokeDashoffset: -12 }], { duration: 700 }],
  pulse: [[{ transform: "none" }, { transform: "scale(1.06)" }, { transform: "none" }], { duration: 1600, easing: "ease-in-out" }],
};

export function playScene(svg) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    svg.querySelectorAll("[data-still='hide']").forEach((el) => (el.style.display = "none"));
    return undefined;
  }
  const animations = [];
  svg.querySelectorAll("[data-fx]").forEach((el) => {
    const continuous = CONTINUOUS[el.dataset.fx];
    if (continuous) {
      const [frames, options] = continuous;
      animations.push(el.animate(frames, { ...options, iterations: Infinity, delay: Number(el.dataset.delay || 0) * 1000 }));
      return;
    }
    const frames = timed(el);
    if (frames) animations.push(el.animate(frames, { duration: T * 1000, iterations: Infinity }));
  });
  animations.forEach((a) => a.pause());
  const observer = new IntersectionObserver(([entry]) => {
    animations.forEach((a) => (entry.isIntersecting ? a.play() : a.pause()));
  });
  observer.observe(svg);
  return () => {
    observer.disconnect();
    animations.forEach((a) => a.cancel());
  };
}
