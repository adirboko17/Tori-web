import { createDomScope } from "@/lib/dom-scope";
import { phoneSchema, priceSummary, serviceSchema } from "@/lib/booking";
import { submitBusinessOnboarding } from "@/lib/business-onboarding";
import { missingPaymentFields } from "@/lib/onboarding-payment";
export function initializeOnboarding(root) {
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
  const acts = (name) => $$('[data-act="' + name + '"]', root);
  const on = (name, fn) =>
    acts(name).forEach((el) =>
      listen(el, el.getAttribute("data-ev") || "click", fn),
    );

  const FREE_SMS = 1000;
  const LAST_STEP = 5;
  const PALETTE = [
    ["#BFFF51", "#0CFFBE"],
    ["#FF8ACF", "#FF2E93"],
    ["#C4B5FD", "#7C3AED"],
    ["#FFD166", "#F5433C"],
    ["#8BE9FF", "#0EA5E9"],
    ["#FCD34D", "#D97706"],
    ["#3D3B3A", "#171616"],
    ["#D9FFEC", "#22C55E"],
  ];
  const REQUIRED = {
    1: [
      "fullName",
      "phone",
      "appName",
      "appNameEn",
      "email",
      "adminPassword",
      "address",
      "idNumber",
    ],
    5: [],
  };
  const LABELS = {
    fullName: "שם מלא",
    phone: "טלפון",
    appName: "שם האפליקציה",
    appNameEn: "שם באנגלית",
    email: "אימייל",
    adminPassword: "סיסמת מנהל",
    address: "כתובת",
    idNumber: "תעודת זהות",
    cardName: "שם בעל הכרטיס",
    cardNumber: "מספר כרטיס",
    cardExp: "תוקף",
    cardCvv: "CVV",
  };

  const st = {
    step: 1,
    done: false,
    f: {},
    lang: "he",
    logoMode: "text",
    logoUrl: null,
    logoFile: null,
    savedId: "",
    submitting: false,
    pal: 0,
    media: [],
    services: [
      { name: "", duration: "", price: "" },
      { name: "", duration: "", price: "" },
    ],
    agreed: false,
    contractRead: false,
    error: "",
    customColor: "",
  };

  /* ---------- persistence (never cards or password) ---------- */
  function persist() {
    try {
      const safe = {};
      Object.keys(st.f).forEach((k) => {
        if (
          k !== "adminPassword" &&
          k !== "idNumber" &&
          k.slice(0, 4) !== "card"
        )
          safe[k] = st.f[k];
      });
      localStorage.setItem(
        "tori-ob-site",
        JSON.stringify({
          step: st.step,
          f: safe,
          services: st.services,
          pal: st.pal,
          lang: st.lang,
          logoMode: st.logoMode,
          customColor: st.customColor,
        }),
      );
      return true;
    } catch {
      showError("לא ניתן לשמור בדפדפן. יש לפנות מקום או לאפשר אחסון מקומי.");
      return false;
    }
  }
  try {
    const saved = JSON.parse(localStorage.getItem("tori-ob-site") || "null");
    if (saved) {
      st.f = saved.f || {};
      st.services =
        Array.isArray(saved.services) && saved.services.length
          ? saved.services
          : st.services;
      st.pal =
        Number.isInteger(saved.pal) && PALETTE[saved.pal] ? saved.pal : 0;
      st.lang = saved.lang || "he";
      st.logoMode = saved.logoMode || "text";
      st.customColor = /^#[0-9a-f]{6}$/i.test(saved.customColor || "")
        ? saved.customColor
        : "";
      const savedStep = Math.min(6, Math.max(1, saved.step || 1));
      st.step =
        "pkg" in saved && savedStep >= 5
          ? savedStep - 1
          : Math.min(LAST_STEP, savedStep);
    }
  } catch (e) {}

  /* ---------- field masks ---------- */
  function mask(k, v) {
    if (k === "cardNumber")
      return v
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})(?=.)/g, "$1 ");
    if (k === "cardCvv") return v.replace(/\D/g, "").slice(0, 4);
    if (k === "cardExp") {
      const d = v.replace(/\D/g, "").slice(0, 4);
      return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    }
    if (k === "cardName")
      return v
        .replace(/[^A-Za-z .'-]/g, "")
        .toUpperCase()
        .slice(0, 26);
    if (k === "appNameEn")
      return v.replace(/[^A-Za-z0-9 .'-]/g, "").slice(0, 28);
    if (k === "idNumber") return v.replace(/\D/g, "").slice(0, 9);
    return v;
  }
  Object.keys(LABELS)
    .concat(["logoText"])
    .forEach((k) => {
      acts("on." + k).forEach((el) => {
        if (st.f[k]) el.value = st.f[k];
        listen(el, "input", () => {
          const v = mask(k, el.value);
          if (v !== el.value) el.value = v;
          st.f[k] = v;
          el.classList.remove("is-bad");
          persist();
          if (st.step === LAST_STEP) paintSummary();
        });
      });
    });

  /* ---------- steps ---------- */
  function paintSteps() {
    root.setAttribute("data-step", st.done ? "done" : String(st.step));
    root
      .querySelector('[data-branch="isDone"]')
      .classList.toggle("is-off", !st.done);
    root.querySelector(".ob-nav-cta").style.display = st.done ? "none" : "";
    $$("[data-step-panel]", root).forEach((p) =>
      p.classList.toggle(
        "is-off",
        Number(p.getAttribute("data-step-panel")) !== st.step || st.done,
      ),
    );
    $$(".ob-stepper-item", root).forEach((item, i) => {
      const n = i + 1;
      item.setAttribute(
        "data-state",
        st.done || n < st.step ? "done" : n === st.step ? "active" : "todo",
      );
      const num = $(".ob-stepper-num", item);
      if (num)
        num.innerHTML =
          st.done || n < st.step
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"></path></svg>'
            : String(n);
    });
    const back = $('[data-branch="canBack"]', root);
    if (back) back.classList.toggle("is-off", st.step === 1 || st.done);
    const nb = ref("nextBtn");
    if (nb && nb.firstChild)
      nb.firstChild.nodeValue =
        st.step === 4 ? "אני מאשר/ת את תנאי ההסכם" : "לשלב הבא";
    if (st.step === LAST_STEP) paintSummary();
  }
  function showError(msg) {
    st.error = msg;
    const line = ref("errorLine"),
      txt = ref("errorText");
    if (txt) txt.textContent = msg || "";
    if (line) line.style.display = msg ? "flex" : "none";
    $$('[data-branch="hasError"]', root).forEach((b) =>
      b.classList.add("is-off"),
    );
  }
  function validate() {
    const need = REQUIRED[st.step];
    if (need) {
      const missing = need.filter((k) => !(st.f[k] || "").trim());
      missing.forEach((k) =>
        acts("on." + k).forEach((el) => el.classList.add("is-bad")),
      );
      if (missing.length) {
        showError("צריך למלא: " + missing.map((k) => LABELS[k]).join(", "));
        return false;
      }
      if (
        st.step === 1 &&
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(st.f.email || "")
      ) {
        showError("האימייל לא נראה תקין.");
        return false;
      }
    }
    if (st.step === 1 && !phoneSchema.safeParse(st.f.phone || "").success) {
      showError("צריך להזין מספר נייד ישראלי תקין.");
      return false;
    }
    if (st.step === 1 && (st.f.adminPassword || "").length < 8) {
      showError("הסיסמה צריכה לכלול לפחות 8 תווים.");
      return false;
    }
    if (st.step === 3) {
      const rows = st.services.filter(
        (s) => s.name.trim() || s.duration || s.price,
      );
      if (
        !rows.length ||
        rows.some(
          (s, i) =>
            !serviceSchema.safeParse({
              id: `s${i}`,
              name: s.name,
              mins: Number(s.duration),
              price: s.price === "" ? -1 : Number(s.price),
            }).success,
        )
      ) {
        showError(
          "הוסיפו לפחות שירות אחד עם שם, משך של 5–480 דקות ומחיר תקין.",
        );
        return false;
      }
    }
    if (st.step === 4 && !st.agreed) {
      showError("צריך לאשר את ההסכם כדי להמשיך.");
      return false;
    }
    if (st.step === LAST_STEP) {
      const missingPay = missingPaymentFields(st.f);
      if (missingPay.length) {
        showError(
          "צריך למלא: " + missingPay.map((k) => LABELS[k]).join(", "),
        );
        return false;
      }
    }
    showError("");
    return true;
  }
  function setPayLabel(text) {
    const label = ref("payBtnLabel");
    if (label) label.textContent = text;
  }
  function setPayStatus(text, isError) {
    const status = ref("payStatus");
    if (!status) return;
    status.textContent = text;
    status.style.color = isError ? "#FF8A8A" : "rgba(255,255,255,.55)";
  }
  function setBusy(busy) {
    st.submitting = busy;
    [ref("nextBtn"), ref("nextBtnPay")].forEach((btn) => {
      if (!btn) return;
      btn.disabled = busy;
      btn.setAttribute("aria-busy", String(busy));
    });
    setPayLabel(busy ? "שולחים את הפרטים..." : "שמירה ופתיחת ההדגמה");
  }
  function savedErrorId(error) {
    const cause = error && typeof error === "object" ? error.cause : null;
    return cause && typeof cause.id === "string" ? cause.id : "";
  }
  async function finishOnboarding() {
    if (st.submitting) return;
    setBusy(true);
    showError("");
    setPayStatus("שומרים את העסק ושולחים הודעה לצוות...", false);
    try {
      const result = await Promise.race([
        submitBusinessOnboarding(
          {
            managerName: st.f.fullName,
            phone: st.f.phone,
            businessNameHe: st.f.appName,
            businessNameEn: st.f.appNameEn,
            appNameEn: st.f.appNameEn,
            address: st.f.address,
            email: st.f.email,
            managerPassword: st.f.adminPassword,
            brandColor: st.customColor || PALETTE[st.pal][1],
            logoFile: st.logoMode === "img" ? st.logoFile : null,
            services: st.services,
          },
          st.savedId || undefined,
        ),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("השליחה לוקחת יותר מדי זמן. נסו שוב.")),
            28000,
          ),
        ),
      ]);
      st.savedId = result.id;
      try {
        localStorage.setItem(
          "tori-business",
          JSON.stringify({
            name: st.f.appName,
            tagline: st.f.address,
            nameEn: st.f.appNameEn,
            color: st.customColor || PALETTE[st.pal][1],
            language: st.lang,
            smsPackage: FREE_SMS,
            services: st.services
              .filter((s) => s.name.trim())
              .map((s, i) => ({
                id: `s${i + 1}`,
                name: s.name.trim(),
                mins: Number(s.duration),
                price: Number(s.price),
                icon: "sparkles",
              })),
          }),
        );
      } catch {
        const msg = "הפרטים נשלחו, אבל שמירת ההדגמה בדפדפן נכשלה.";
        showError(msg);
        setPayStatus(msg, true);
        return;
      }
      st.done = true;
      paintSteps();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const existingId = savedErrorId(error);
      if (existingId) st.savedId = existingId;
      const msg =
        error instanceof Error
          ? error.message
          : "השליחה נכשלה. נסו שוב בעוד רגע.";
      showError(msg);
      setPayStatus(msg, true);
    } finally {
      setBusy(false);
    }
  }
  on("next", () => {
    if (st.step === LAST_STEP) {
      finishOnboarding();
      return;
    }
    if (!validate()) return;
    st.step += 1;
    persist();
    paintSteps();
    const sc = $(".ob-scroll", root);
    if (sc) sc.scrollTop = 0;
  });
  on("saveDemo", () => {
    finishOnboarding();
  });
  on("back", () => {
    if (st.step === 1) return;
    st.step -= 1;
    showError("");
    persist();
    paintSteps();
  });

  /* ---------- language ---------- */
  ["he", "ru", "en", "ar"].forEach((code) =>
    on("lang:" + code, () => {
      st.lang = code;
      ["he", "ru", "en", "ar"].forEach((c) =>
        acts("lang:" + c).forEach((b) =>
          b.setAttribute("aria-pressed", String(c === code)),
        ),
      );
      persist();
    }),
  );

  /* ---------- branding ---------- */
  function paintLogo() {
    const isText = st.logoMode === "text";
    const b = (k, v) => {
      const el = $('[data-branch="' + k + '"]', root);
      if (el) el.classList.toggle("is-off", !v);
    };
    b("logoIsText", isText);
    b("logoIsImg", !isText);
    b("hasLogo", !isText && !!st.logoUrl);
    b("noLogo", !isText && !st.logoUrl);
    acts("pickLogoText").forEach((x) =>
      x.setAttribute("aria-pressed", String(isText)),
    );
    acts("pickLogoImg").forEach((x) =>
      x.setAttribute("aria-pressed", String(!isText)),
    );
    const img = ref("logoImg");
    if (img && st.logoUrl) img.src = st.logoUrl;
  }
  on("pickLogoText", () => {
    st.logoMode = "text";
    paintLogo();
    persist();
  });
  on("pickLogoImg", () => {
    st.logoMode = "img";
    paintLogo();
    persist();
  });
  on("onLogoFile", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (
      !/^image\/(png|jpeg|webp|gif)$/.test(f.type) ||
      f.size > 5 * 1024 * 1024
    ) {
      showError("בחרו תמונת PNG, JPG, WebP או GIF עד 5MB.");
      return;
    }
    if (st.logoUrl) URL.revokeObjectURL(st.logoUrl);
    st.logoUrl = URL.createObjectURL(f);
    st.logoFile = f;
    st.logoMode = "img";
    paintLogo();
  });
  PALETTE.forEach((_, i) =>
    on("pal:" + i, () => {
      st.pal = i;
      st.customColor = "";
      PALETTE.forEach((__, j) =>
        acts("pal:" + j).forEach((b) =>
          b.setAttribute("aria-pressed", String(i === j)),
        ),
      );
      persist();
    }),
  );
  on("onCustomColor", (event) => {
    st.customColor = event.target.value;
    PALETTE.forEach((__, j) =>
      acts("pal:" + j).forEach((b) => b.setAttribute("aria-pressed", "false")),
    );
    persist();
  });

  /* ---------- media ---------- */
  function paintMedia() {
    const wrap = $('[data-branch="hasMedia"]', root);
    const grid = ref("mediaGrid");
    if (wrap) wrap.classList.toggle("is-off", st.media.length === 0);
    if (!grid) return;
    grid.innerHTML = st.media
      .map(
        (m, i) =>
          '<div style="position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#EEEEEB">' +
          (m.type === "image"
            ? '<img src="' +
              m.url +
              '" alt="" style="width:100%;height:100%;object-fit:cover;display:block">'
            : '<video src="' +
              m.url +
              '" muted style="width:100%;height:100%;object-fit:cover;display:block"></video>') +
          '<button type="button" data-rm="' +
          i +
          '" aria-label="הסרה" style="position:absolute;top:4px;inset-inline-start:4px;width:22px;height:22px;border-radius:50%;border:0;background:rgba(23,22,22,.75);color:#fff;display:grid;place-items:center;cursor:pointer"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg></button></div>',
      )
      .join("");
    $$("[data-rm]", grid).forEach((b) =>
      listen(b, "click", () => {
        const i = Number(b.getAttribute("data-rm"));
        URL.revokeObjectURL(st.media[i].url);
        st.media.splice(i, 1);
        paintMedia();
      }),
    );
  }
  on("onMediaFiles", (e) => {
    const files = Array.prototype.slice.call(e.target.files || []);
    files.forEach((f) => {
      if (st.media.length >= 10) return;
      st.media.push({
        url: URL.createObjectURL(f),
        type: f.type.indexOf("video") === 0 ? "video" : "image",
      });
    });
    paintMedia();
  });

  /* ---------- services ---------- */
  const svList = ref("svList");
  const svRowHTML = () =>
    '<div style="display:grid;grid-template-columns:minmax(0,1fr) 110px 110px 38px;gap:10px;align-items:center;animation:ob-in .3s ease both">' +
    '<input class="ob-input" data-sv="name" placeholder="למשל: תספורת">' +
    '<input class="ob-input" inputMode="numeric" data-sv="duration" placeholder="45" dir="ltr" style="text-align:center">' +
    '<input class="ob-input" inputMode="numeric" data-sv="price" placeholder="120" dir="ltr" style="text-align:center">' +
    '<button type="button" class="ob-icon-btn" data-sv-remove aria-label="הסרת שירות"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg></button></div>';
  function paintServices() {
    if (!svList) return;
    svList.innerHTML = st.services.map(svRowHTML).join("");
    $$("div", svList).forEach((rowEl, i) => {
      const s = st.services[i];
      if (!s) return;
      $$("[data-sv]", rowEl).forEach((inp) => {
        const key = inp.getAttribute("data-sv");
        inp.value = s[key] || "";
        listen(inp, "input", () => {
          s[key] =
            key === "name"
              ? inp.value
              : inp.value.replace(/\D/g, "").slice(0, 5);
          if (inp.value !== s[key]) inp.value = s[key];
          persist();
        });
      });
      const rm = $("[data-sv-remove]", rowEl);
      if (rm)
        listen(rm, "click", () => {
          if (st.services.length <= 1) {
            st.services[i] = { name: "", duration: "", price: "" };
          } else {
            st.services.splice(i, 1);
          }
          paintServices();
          persist();
        });
    });
  }
  on("addService", () => {
    st.services.push({ name: "", duration: "", price: "" });
    paintServices();
    persist();
  });

  /* ---------- payment summary ---------- */
  function paintSummary() {
    const c = ref("smsCount"),
      pr = ref("smsPrice"),
      v = ref("vat"),
      t = ref("total"),
      pay = ref("nextBtnPay");
    if (c) c.textContent = FREE_SMS.toLocaleString("he-IL") + " הודעות";
    if (pr) pr.textContent = "‎0 ₪";
    const summary = priceSummary();
    if (v)
      v.textContent =
        summary.vat.toLocaleString("he-IL", { minimumFractionDigits: 2 }) +
        " ₪";
    if (t)
      t.textContent =
        summary.total.toLocaleString("he-IL", { minimumFractionDigits: 2 }) +
        " ₪";
    if (!st.submitting) setPayLabel("שמירה ופתיחת ההדגמה");
  }

  /* ---------- contract ---------- */
  const contract = ref("contractRef");
  if (contract)
    listen(contract, "scroll", () => {
      if (
        contract.scrollTop + contract.clientHeight >=
          contract.scrollHeight - 12 &&
        !st.contractRead
      ) {
        st.contractRead = true;
        const h = ref("contractHint");
        if (h) h.textContent = "קראתם עד הסוף — תודה.";
      }
    });
  const agree = ref("agree");
  if (agree)
    listen(agree, "change", () => {
      st.agreed = agree.checked;
      showError("");
    });

  /* ---------- looping videos ---------- */
  function playVideos() {
    $$("video", root).forEach((v) => {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      v.playsInline = true;
      if (v.paused) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    });
  }
  playVideos();
  [400, 1200, 2600].forEach((t) => setTimeout(playVideos, t));

  /* ---------- init ---------- */
  PALETTE.forEach((_, j) =>
    acts("pal:" + j).forEach((b) =>
      b.setAttribute("aria-pressed", String(st.pal === j)),
    ),
  );
  ["he", "ru", "en", "ar"].forEach((c) =>
    acts("lang:" + c).forEach((b) =>
      b.setAttribute("aria-pressed", String(st.lang === c)),
    ),
  );
  paintServices();
  paintLogo();
  paintMedia();
  paintSteps();
  const colorInput = acts("onCustomColor")[0];
  if (colorInput && st.customColor) colorInput.value = st.customColor;
  ref("errorLine")?.setAttribute("role", "alert");
  scope.cleanup(() => {
    if (st.logoUrl) URL.revokeObjectURL(st.logoUrl);
    st.media.forEach((item) => URL.revokeObjectURL(item.url));
  });
  return () => scope.dispose();
}
