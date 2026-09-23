import { createDomScope } from "@/lib/dom-scope";
import { submitBusinessOnboarding } from "@/lib/business-onboarding";

/** True once the loader has actually finished, not merely started. Survives a
    remount within the same page load (React re-runs effects in development). */
let loaderPlayed = false;

export function initializeLanding(root) {
  const scope = createDomScope();
  const setTimeout = scope.timeout;
  const requestAnimationFrame = scope.frame;
  const listen = scope.listen;
  const originalOverflow = document.body.style.overflow;
  scope.cleanup(() => {
    document.body.style.overflow = originalOverflow;
  });
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) =>
    Array.prototype.slice.call((r || document).querySelectorAll(s));
  if (!root) return;
  const ref = (n) => $('[data-ref="' + n + '"]', root);
  const on = (name, fn, ev) =>
    $$('[data-act="' + name + '"]', root).forEach((el) =>
      listen(el, ev || el.getAttribute("data-ev") || "click", fn),
    );
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- loader ---------- */
  const loader = $(".tori-loader", root);
  let loaderDone = false;

  /* Progress eases toward 92% on its own, then snaps to 100% the moment the
     loader is actually dismissed, so the bar and the counter never disagree. */
  const bar = ref("loaderBarRef");
  const pct = ref("loaderPctRef");
  let progress = 0;
  function paintProgress(value) {
    progress = Math.max(progress, Math.min(100, value));
    if (bar) bar.style.width = progress + "%";
    if (pct) pct.textContent = Math.round(progress) + "%";
  }
  (function rampProgress() {
    if (!bar && !pct) return;
    const start = performance.now();
    const tick = (now) => {
      if (loaderDone) return;
      const t = Math.min(1, (now - start) / 2600);
      paintProgress(92 * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();

  function dismissLoader() {
    if (loaderDone) return;
    paintProgress(100);
    loaderDone = true;
    loaderPlayed = true;
    try {
      sessionStorage.setItem("tori-lp-loader", "1");
    } catch (e) {}
    if (loader) loader.classList.add("is-out");
    setTimeout(() => {
      document.body.style.overflow = "";
    }, 620);
  }
  on("skipLoader", dismissLoader);
  (function startLoader() {
    if (!loader) return;
    const v = ref("loaderVideoRef") || loader.querySelector("video");
    let seen = loaderPlayed;
    try {
      seen = seen || sessionStorage.getItem("tori-lp-loader") === "1";
    } catch (e) {}
    if (reduce || seen) {
      loader.style.display = "none";
      loaderDone = true;
      return;
    }
    document.body.style.overflow = "hidden";
    let playing = false;
    if (v) {
      const img = loader.querySelector(".tori-loader-fallback");
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      v.playsInline = true;
      const tryPlay = () => {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      };
      listen(v, "playing", () => {
        playing = true;
        v.style.opacity = "1";
        if (img) img.style.opacity = "0";
      });
      listen(v, "loadeddata", tryPlay);
      listen(v, "canplay", tryPlay);
      listen(v, "ended", () => setTimeout(dismissLoader, 240));
      v.load();
      tryPlay();
      setTimeout(() => {
        if (playing || loaderDone || v.readyState < 2) return;
        playing = true;
        v.style.opacity = "1";
        if (img) img.style.opacity = "0";
        let t0 = null;
        const step = (t) => {
          if (loaderDone) return;
          if (t0 === null) t0 = t;
          const at = (t - t0) / 1000;
          if (at >= (v.duration || 3)) {
            dismissLoader();
            return;
          }
          try {
            v.currentTime = at;
          } catch (e) {}
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 900);
      setTimeout(() => {
        if (!playing) {
          v.style.display = "none";
          dismissLoader();
        }
      }, 6000);
    }
    setTimeout(dismissLoader, 9000);
  })();

  /* ---------- looping brand marks ---------- */
  function playMarks() {
    $$("video", root).forEach((v) => {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
    });
    $$(".tori-nav-mark video,.tori-hero-mark video", root).forEach((v) => {
      v.loop = true;
      v.playsInline = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
  }
  playMarks();
  [400, 1200, 2600].forEach((t) => setTimeout(playMarks, t));

  /* ---------- accessibility ---------- */
  const A11Y = {
    contrast: "a11y-contrast",
    invert: "a11y-invert",
    gray: "a11y-gray",
    links: "a11y-links",
    readable: "a11y-readable",
    space: "a11y-space",
    stop: "a11y-stop",
    focus: "a11y-focus",
  };
  let flags = {},
    scale = 100;
  const a11yWrap = $(".tori-a11y", root);
  function applyA11y() {
    Object.keys(A11Y).forEach((k) =>
      root.classList.toggle(A11Y[k], !!flags[k]),
    );
    root.style.zoom = scale === 100 ? "" : scale / 100;
    const lbl = ref("a11yScaleLabel");
    if (lbl) lbl.textContent = scale + "%";
    Object.keys(A11Y).forEach((k) => {
      const btn = $(
        '[data-act="a11yToggle' + k.charAt(0).toUpperCase() + k.slice(1) + '"]',
        root,
      );
      if (btn) btn.setAttribute("aria-pressed", String(!!flags[k]));
    });
    try {
      localStorage.setItem(
        "tori-a11y",
        JSON.stringify({ flags: flags, scale: scale }),
      );
    } catch (e) {}
  }
  try {
    const saved = JSON.parse(localStorage.getItem("tori-a11y") || "null");
    if (saved) {
      flags = saved.flags || {};
      scale = saved.scale || 100;
      applyA11y();
    }
  } catch (e) {}
  on("toggleA11y", () => {
    const open = !a11yWrap.classList.contains("is-open");
    a11yWrap.classList.toggle("is-open", open);
    const t = $('[data-act="toggleA11y"]', a11yWrap);
    if (t) t.setAttribute("aria-expanded", String(open));
  });
  Object.keys(A11Y).forEach((k) => {
    on("a11yToggle" + k.charAt(0).toUpperCase() + k.slice(1), () => {
      flags[k] = !flags[k];
      if (k === "invert" && flags.invert) {
        flags.contrast = false;
        flags.gray = false;
      }
      if ((k === "contrast" || k === "gray") && flags[k]) flags.invert = false;
      applyA11y();
    });
  });
  on("a11yTextUp", () => {
    scale = Math.min(150, scale + 10);
    applyA11y();
  });
  on("a11yTextDown", () => {
    scale = Math.max(90, scale - 10);
    applyA11y();
  });
  on("a11yReset", () => {
    flags = {};
    scale = 100;
    applyA11y();
  });

  /* ---------- scroll reveal ---------- */
  const io = scope.observe(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.setAttribute("data-in", "1");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -6% 0px" },
  );
  $$("[data-reveal]", root).forEach((el) => io.observe(el));

  /* ---------- count-ups ---------- */
  $$("[data-count]", root).forEach((el) => {
    const to = Number(el.getAttribute("data-count")) || 0;
    el.textContent = "0";
    const run = () => {
      if (reduce) {
        el.textContent = String(to);
        return;
      }
      const t0 = performance.now(),
        ms = 1500;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / ms);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const o = scope.observe(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          run();
          o.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    o.observe(el);
  });

  /* ---------- hero parallax + magnetic CTA ---------- */
  const hero = $("#top", root);
  if (hero && !reduce) {
    let mx = 0,
      my = 0,
      tx = 0,
      ty = 0,
      sy = 0,
      ts = 0;
    listen(
      hero,
      "pointermove",
      (e) => {
        const r = hero.getBoundingClientRect();
        mx = Math.max(
          -1,
          Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2),
        );
        my = Math.max(
          -1,
          Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2),
        );
      },
      { passive: true },
    );
    listen(hero, "pointerleave", () => {
      mx = 0;
      my = 0;
    });
    const onScroll = () => {
      sy = Math.max(
        0,
        Math.min(1.2, window.scrollY / Math.max(1, hero.offsetHeight)),
      );
    };
    listen(window, "scroll", onScroll, { passive: true });
    onScroll();
    const tick = () => {
      tx += (mx - tx) * 0.07;
      ty += (my - ty) * 0.07;
      ts += (sy - ts) * 0.12;
      hero.style.setProperty("--mx", tx.toFixed(4));
      hero.style.setProperty("--my", ty.toFixed(4));
      hero.style.setProperty("--sy", ts.toFixed(4));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const cta = hero.querySelector(".tori-magnet");
    if (cta) {
      listen(cta, "pointermove", (e) => {
        const r = cta.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width,
          dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        cta.style.transform =
          "translate(" +
          (dx * 10).toFixed(1) +
          "px," +
          (dy * 8).toFixed(1) +
          "px)";
      });
      listen(cta, "pointerleave", () => {
        cta.style.transform = "";
      });
    }
  }

  /* ---------- nav state + chat reveal ---------- */
  const nav = $(".tori-nav", root);
  const chatWrap = $(".tori-chat", root);
  function onNavScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 40);
    if (chatWrap && y > 320) chatWrap.classList.add("is-visible");
  }
  listen(window, "scroll", onNavScroll, { passive: true });
  onNavScroll();

  /* ---------- mobile menu ---------- */
  const menu = ref("menuRef");
  const burger = $('[data-act="toggleMenu"]', root);
  const menuLinks = $$("[data-menu-link]", root);
  function setMenu(open) {
    root.classList.toggle("menu-open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
    }
    if (menu) menu.hidden = false;
    document.body.style.overflow = open ? "hidden" : "";
  }
  on("toggleMenu", () => setMenu(!root.classList.contains("menu-open")));
  on("closeMenu", () => setMenu(false));
  listen(window, "keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("menu-open"))
      setMenu(false);
  });
  listen(window, "resize", () => {
    if (window.innerWidth > 760 && root.classList.contains("menu-open"))
      setMenu(false);
  });
  scope.cleanup(() => root.classList.remove("menu-open"));

  /* marks the section in view on both the bar links and the menu */
  if (menuLinks.length) {
    const spy = scope.observe(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          menuLinks.forEach((a) =>
            a.classList.toggle("is-current", a.dataset.menuLink === id),
          );
          $$("[data-nav]", root).forEach((a) =>
            a.classList.toggle("is-current", a.dataset.nav === id),
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    menuLinks.forEach((a) => {
      const section = $("#" + a.dataset.menuLink, root);
      if (section) spy.observe(section);
    });
  }

  /* ---------- live brand demo ---------- */
  const PALETTES = [
    { c1: "#0CFFBE", c2: "#BFFF51", fg: "#171616" },
    { c1: "#FF2E93", c2: "#FF8ACF", fg: "#FFFFFF" },
    { c1: "#7C3AED", c2: "#A855F7", fg: "#FFFFFF" },
    { c1: "#F5433C", c2: "#FF8A6B", fg: "#FFFFFF" },
    { c1: "#0EA5E9", c2: "#67D5FF", fg: "#FFFFFF" },
    { c1: "#F59E0B", c2: "#FCD34D", fg: "#171616" },
  ];
  const FONTS = [
    { css: "var(--font-tenant-round)", boost: 1 },
    { css: "var(--font-tenant-heavy)", boost: 1 },
    { css: "var(--font-tenant-bold)", boost: 0.95 },
    { css: "var(--font-tenant-script)", boost: 1.4 },
  ];
  const demo = { pal: 0, font: 0, size: 100, logoMode: "text", logoUrl: null };
  const phone = ref("phoneRef");
  const branch = (k) => $('[data-branch="' + k + '"]', root);
  function applyLive() {
    if (phone) {
      const p = PALETTES[demo.pal],
        f = FONTS[demo.font];
      phone.style.setProperty("--c1", p.c1);
      phone.style.setProperty("--c2", p.c2);
      phone.style.setProperty("--fg", p.fg);
      phone.style.setProperty("--logo-font", f.css);
      phone.style.setProperty(
        "--logo-scale",
        String((demo.size / 100) * (demo.logoMode === "text" ? f.boost : 1)),
      );
    }
    PALETTES.forEach((_, i) => {
      const b = $('[data-act="pick' + i + '"]', root);
      if (b) b.setAttribute("data-on", String(demo.pal === i));
    });
    FONTS.forEach((_, i) => {
      const b = $('[data-act="font' + i + '"]', root);
      if (b) b.setAttribute("data-on", String(demo.font === i));
    });
    const up = demo.logoMode === "upload";
    const bu = $('[data-act="pickUpload"]', root),
      bt = $('[data-act="pickText"]', root);
    if (bu) bu.setAttribute("data-on", String(up));
    if (bt) bt.setAttribute("data-on", String(!up));
    const showImg = up && !!demo.logoUrl;
    [
      ["modeUpload", up],
      ["modeText", !up],
      ["hasLogo", up && !!demo.logoUrl],
      ["showLogoImg", showImg],
      ["showLogoText", !showImg],
    ].forEach((pair) => {
      const el = branch(pair[0]);
      if (el) el.classList.toggle("is-off", !pair[1]);
    });
    const img = ref("logoImg");
    if (img && demo.logoUrl) img.src = demo.logoUrl;
    const lbl = $('[data-act="onLogo"]', root);
    if (lbl && lbl.parentElement) {
      const span = lbl.parentElement.querySelector("span");
      if (span) span.textContent = demo.logoUrl ? "החלפת הלוגו" : "בחירת קובץ";
    }
  }
  PALETTES.forEach((_, i) =>
    on("pick" + i, () => {
      demo.pal = i;
      applyLive();
    }),
  );
  FONTS.forEach((_, i) =>
    on("font" + i, () => {
      demo.font = i;
      demo.logoMode = "text";
      applyLive();
    }),
  );
  on("pickUpload", () => {
    demo.logoMode = "upload";
    applyLive();
  });
  on("pickText", () => {
    demo.logoMode = "text";
    applyLive();
  });
  on(
    "onSize",
    (e) => {
      demo.size = Number(e.target.value);
      const sizeLbl = ref("sizeLabel");
      if (sizeLbl) sizeLbl.textContent = demo.size + "%";
      applyLive();
    },
    "input",
  );
  on(
    "onName",
    (e) => {
      const t = ref("logoText");
      if (t) t.textContent = e.target.value || "שם העסק";
      demo.logoMode = "text";
      applyLive();
    },
    "input",
  );
  on("clearLogo", () => {
    if (demo.logoUrl) URL.revokeObjectURL(demo.logoUrl);
    demo.logoUrl = null;
    applyLive();
  });
  on(
    "onLogo",
    (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (demo.logoUrl) URL.revokeObjectURL(demo.logoUrl);
      demo.logoUrl = URL.createObjectURL(f);
      demo.logoMode = "upload";
      applyLive();
    },
    "change",
  );
  applyLive();

  /* ---------- chat ---------- */
  const CHAT = {
    price: {
      q: "כמה זה עולה?",
      a: "‎299 ₪ לחודש (לא כולל מע״מ), וזהו. בלי דמי הקמה, בלי אחוזים על תורים ובלי התחייבות — אפשר להתנתק מתי שרוצים.",
      next: ["included", "time", "start"],
    },
    included: {
      q: "מה כלול?",
      a: "אפליקציה ממותגת בשם שלך בשתי החנויות, יומן תורים חכם, תזכורות אוטומטיות, תשלומים באפליקציה וניהול לקוחות — כולל עדכונים ותמיכה אנושית.",
      next: ["time", "fit", "start"],
    },
    time: {
      q: "כמה זמן עד שזה באוויר?",
      a: "‎72 שעות מהרגע שקיבלנו לוגו ופרטי עסק. אנחנו עושים את הכל — עיצוב, הקמה והעלאה לחנויות.",
      next: ["need", "price", "start"],
    },
    need: {
      q: "מה צריך ממני?",
      a: "לוגו (ואם אין — נעצב לך), שם העסק, רשימת שירותים ושעות פעילות. חמש דקות עבודה מצידך, לא יותר.",
      next: ["start", "human"],
    },
    fit: {
      q: "זה מתאים לעסק שלי?",
      a: "אם יש לך תורים — כן. מספרות, ציפורניים, קוסמטיקה, קליניקות, סטודיו ומאמנים אישיים. גם עסק של אדם אחד.",
      next: ["price", "time", "start"],
    },
    start: {
      q: "רוצה להתחיל",
      a: "יאללה. גללתי אותך לטופס — משאירים פרטים ואנחנו חוזרים תוך שעה לשיחה קצרה, בלי התחייבות.",
      next: ["human", "more"],
      act: "form",
    },
    human: {
      q: "לדבר עם בן אדם",
      a: "בכיף, גם אני מעדיף בן אדם לפעמים. וואטסאפ ‎053-557-5303, א׳–ה׳ בין 9:00 ל־17:00 — פותח לך את השיחה.",
      next: ["price", "more"],
      act: "wa",
    },
    more: {
      q: "יש לי עוד שאלה",
      a: "קדימה, אני כאן. אפשר גם פשוט לכתוב לי בשורה למטה.",
      next: ["price", "included", "time", "fit"],
    },
  };
  const MARK = "/assets/brand/tori-mark.png";
  const scrollEl = ref("chatScrollRef");
  const chipsEl = ref("chatChips");
  const inputEl = $(".tori-chat-input", root);
  let msgs = [
    {
      from: "bot",
      text: "היי, אני תורי. איך אפשר לעזור? אפשר לשאול אותי הכל — מחיר, זמנים, מה כלול, ואם זה מתאים לעסק שלך.",
    },
  ];
  let chips = ["price", "included", "time", "fit"];
  let typing = false,
    chatT = null;
  const esc = (t) =>
    String(t)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const botHTML = (t) =>
    '<div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-start;animation:tori-chat-in .32s cubic-bezier(.34,1.42,.64,1) both"><span style="flex:0 0 auto;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#BFFF51,#0CFFBE);display:grid;place-items:center"><img src="' +
    MARK +
    '" alt="" style="width:17px;height:17px"></span><div style="max-width:78%;background:var(--white);border:1px solid rgba(23,22,22,.08);border-radius:18px 18px 18px 6px;padding:11px 14px;font-size:14px;line-height:1.55;color:var(--ink-800);box-shadow:0 2px 8px rgba(23,22,22,.05)">' +
    esc(t) +
    "</div></div>";
  const meHTML = (t) =>
    '<div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-end;animation:tori-chat-in .32s cubic-bezier(.34,1.42,.64,1) both"><div style="max-width:78%;background:linear-gradient(135deg,#BFFF51,#0CFFBE);border-radius:18px 18px 6px 18px;padding:11px 14px;font-size:14px;line-height:1.55;color:#171616;font-weight:500">' +
    esc(t) +
    "</div></div>";
  const typingHTML =
    '<div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-start"><span style="flex:0 0 auto;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#BFFF51,#0CFFBE);display:grid;place-items:center"><img src="' +
    MARK +
    '" alt="" style="width:17px;height:17px"></span><span style="display:flex;align-items:center;gap:4px;background:var(--white);border:1px solid rgba(23,22,22,.08);border-radius:18px 18px 18px 6px;padding:13px 15px"><span class="tori-chat-dot"></span><span class="tori-chat-dot" style="animation-delay:.15s"></span><span class="tori-chat-dot" style="animation-delay:.3s"></span></span></div>';
  function scrollChat() {
    if (!scrollEl) return;
    const go = () => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    };
    requestAnimationFrame(go);
    setTimeout(go, 90);
    setTimeout(go, 380);
  }
  function renderChat() {
    if (scrollEl)
      scrollEl.innerHTML =
        msgs
          .map((m) => (m.from === "bot" ? botHTML(m.text) : meHTML(m.text)))
          .join("") + (typing ? typingHTML : "");
    if (chipsEl) {
      chipsEl.innerHTML = chips
        .map(
          (k) =>
            '<button class="tori-chat-chip" data-chip="' +
            k +
            '">' +
            esc(CHAT[k].q) +
            "</button>",
        )
        .join("");
      $$("[data-chip]", chipsEl).forEach((b) =>
        listen(b, "click", () => ask(b.getAttribute("data-chip"))),
      );
    }
    scrollChat();
  }
  function pushBot(key) {
    const node = CHAT[key];
    if (!node) return;
    typing = true;
    renderChat();
    clearTimeout(chatT);
    chatT = setTimeout(() => {
      typing = false;
      msgs = msgs.concat({ from: "bot", text: node.a });
      chips = node.next;
      renderChat();
      if (node.act === "form") {
        const t = document.getElementById("lead-form");
        if (t)
          window.scrollTo({
            top: t.getBoundingClientRect().top + window.scrollY - 70,
            behavior: "smooth",
          });
      }
      if (node.act === "wa")
        window.open("https://wa.me/972535575303", "_blank");
    }, 760);
  }
  function ask(key) {
    msgs = msgs.concat({ from: "me", text: CHAT[key].q });
    chips = [];
    renderChat();
    pushBot(key);
  }
  function sendChat() {
    if (!inputEl) return;
    const text = (inputEl.value || "").trim();
    if (!text) return;
    inputEl.value = "";
    msgs = msgs.concat({ from: "me", text: text });
    chips = [];
    renderChat();
    let key = null;
    if (/מחיר|עולה|כסף|תשלום|עלות/.test(text)) key = "price";
    else if (/כלול|מקבל|יש באפליקציה|פיצ/.test(text)) key = "included";
    else if (/זמן|מתי|כמה ימים|מהר/.test(text)) key = "time";
    else if (/מתאים|עסק שלי|מספרה|קליניקה|סטודיו|קוסמטיק/.test(text))
      key = "fit";
    else if (/צריך ממני|לוגו|להתחיל|הרשמה/.test(text)) key = "need";
    else if (/אנוש|נציג|טלפון|וואטסאפ|לדבר/.test(text)) key = "human";
    if (key) {
      pushBot(key);
      return;
    }
    typing = true;
    renderChat();
    clearTimeout(chatT);
    chatT = setTimeout(() => {
      typing = false;
      msgs = msgs.concat({
        from: "bot",
        text: "שאלה טובה, ודווקא עליה עדיף שיענה לך בן אדם — וואטסאפ ‎053-557-5303, עונים מהר. בינתיים אולי אחת מאלה?",
      });
      chips = ["price", "time", "human"];
      renderChat();
    }, 800);
  }
  on("toggleChat", () => {
    const open = !chatWrap.classList.contains("is-open");
    chatWrap.classList.toggle("is-open", open);
    chatWrap.classList.add("is-dismissed", "is-visible");
    if (open) scrollChat();
  });
  on("sendChat", sendChat);
  if (inputEl)
    listen(inputEl, "keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendChat();
      }
    });
  renderChat();

  /* ---------- feature videos: play only in view ---------- */
  const featVids = $$(".tori-feat-media video", root);
  if (featVids.length) {
    const vo = scope.observe(
      (es) => {
        es.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) {
            v.muted = true;
            v.playsInline = true;
            if (v.preload === "none") v.preload = "auto";
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
          } else if (!v.paused) v.pause();
        });
      },
      { threshold: 0.25 },
    );
    featVids.forEach((v) => vo.observe(v));
  }

  /* ---------- lead form ---------- */
  const leadMsg = ref("leadMsg");
  function say(msg, ok) {
    if (!leadMsg) return;
    leadMsg.textContent = msg || "";
    leadMsg.style.display = msg ? "block" : "none";
    leadMsg.style.color = ok ? "var(--green-700)" : "var(--red-600, #C2231C)";
  }
  let leadSavedId = "";
  let leadBusy = false;
  on("submitLead", async () => {
    const form = $("#lead-form", root);
    if (!form || leadBusy) return;
    const name = form.querySelector('input[autocomplete="name"]');
    const tel = form.querySelector('input[type="tel"]');
    const biz = form.querySelector(
      'input[type="text"]:not([autocomplete="name"])',
    );
    const note = form.querySelector("textarea");
    const submitBtn = form.querySelector('[data-act="submitLead"]');
    const missing = [];
    [
      [name, "שם מלא"],
      [tel, "טלפון לחזרה"],
    ].forEach((p) => {
      if (p[0] && !p[0].value.trim()) missing.push(p[1]);
    });
    if (missing.length) {
      say("צריך למלא: " + missing.join(" ו"), false);
      if (name && !name.value.trim()) name.focus();
      else if (tel) tel.focus();
      return;
    }
    if (!/^0\d[\d\- ]{7,}$/.test(tel.value.trim())) {
      say("מספר הטלפון לא נראה תקין.", false);
      tel.focus();
      return;
    }
    const type = form.querySelector('input[name="biz-type"]:checked');
    const typeLabel =
      type && type.parentElement ? type.parentElement.textContent.trim() : "";
    leadBusy = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }
    say("שולחים את הפרטים...", true);
    try {
      const result = await submitBusinessOnboarding(
        {
          managerName: name.value.trim(),
          phone: tel.value.trim(),
          businessNameHe: (biz && biz.value.trim()) || name.value.trim(),
          businessType: typeLabel || null,
          note: note ? note.value.trim() : "",
        },
        leadSavedId || undefined,
      );
      leadSavedId = result.id;
      if (name) name.value = "";
      if (tel) tel.value = "";
      if (biz) biz.value = "";
      if (note) note.value = "";
      const radios = form.querySelectorAll('input[name="biz-type"]');
      if (radios[0]) radios[0].checked = true;
      leadSavedId = "";
      say("הפרטים נשלחו בהצלחה. נחזור אליך תוך 72 שעות.", true);
    } catch (error) {
      const cause =
        error && typeof error === "object" ? error.cause : null;
      if (cause && typeof cause.id === "string") leadSavedId = cause.id;
      say(
        error instanceof Error
          ? error.message
          : "השליחה נכשלה. נסו שוב בעוד רגע.",
        false,
      );
    } finally {
      leadBusy = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
      }
    }
  });
  return () => scope.dispose();
}
