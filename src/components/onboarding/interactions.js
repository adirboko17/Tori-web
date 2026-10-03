import { createDomScope } from "@/lib/dom-scope";
import { phoneSchema, priceSummary } from "@/lib/booking";
import { submitBusinessOnboarding } from "@/lib/business-onboarding";
import {
  ENGLISH_DISPLAY_NAME_ERROR,
  hasNonEnglishDisplayChars,
  isEnglishDisplayName,
} from "@/lib/display-name";
import { watchMarkVideo } from "@/lib/mark-video";

const FIELDS = ["fullName", "phone", "appName"];
const LABELS = {
  fullName: "שם מלא",
  phone: "מספר טלפון",
  appName: "שם האפליקציה באנגלית",
};

export function initializeOnboarding(root) {
  const scope = createDomScope();
  const setTimeout = scope.timeout;
  const listen = scope.listen;
  const originalOverflow = document.body.style.overflow;
  scope.cleanup(() => {
    document.body.style.overflow = originalOverflow;
  });
  const $ = (selector, base) => (base || document).querySelector(selector);
  const $$ = (selector, base) =>
    Array.prototype.slice.call((base || document).querySelectorAll(selector));
  if (!root) return;
  const ref = (name) => $(`[data-ref="${name}"]`, root);
  const acts = (name) => $$(`[data-act="${name}"]`, root);
  const on = (name, fn) =>
    acts(name).forEach((el) =>
      listen(el, el.getAttribute("data-ev") || "click", fn),
    );

  scope.cleanup(watchMarkVideo(ref("markVideoRef")));

  const st = {
    f: {},
    savedId: "",
    submitting: false,
    agreed: false,
  };

  function persist() {
    try {
      localStorage.setItem(
        "tori-ob-site",
        JSON.stringify({
          step: 1,
          f: {
            fullName: st.f.fullName || "",
            phone: st.f.phone || "",
            appName: st.f.appName || "",
          },
          savedId: st.savedId || "",
        }),
      );
    } catch {
      showError("לא ניתן לשמור בדפדפן. יש לפנות מקום או לאפשר אחסון מקומי.");
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem("tori-ob-site") || "null");
    if (saved && saved.f) {
      st.f = {
        fullName: saved.f.fullName || "",
        phone: saved.f.phone || "",
        appName: saved.f.appName || "",
      };
      st.savedId = typeof saved.savedId === "string" ? saved.savedId : "";
    }
  } catch {
    st.f = {};
  }

  FIELDS.forEach((key) => {
    acts("on." + key).forEach((el) => {
      if (st.f[key]) el.value = st.f[key];
      listen(el, "input", () => {
        st.f[key] = el.value;
        el.classList.remove("is-bad");
        if (key === "appName" && hasNonEnglishDisplayChars(el.value)) {
          el.classList.add("is-bad");
          showError(ENGLISH_DISPLAY_NAME_ERROR);
        } else if (key === "appName") {
          showError("");
        }
        persist();
      });
    });
  });

  function showError(message) {
    const line = ref("errorLine");
    const text = ref("errorText");
    if (text) text.textContent = message || "";
    if (line) line.style.display = message ? "flex" : "none";
  }

  function validate() {
    const missing = FIELDS.filter((key) => !(st.f[key] || "").trim());
    missing.forEach((key) =>
      acts("on." + key).forEach((el) => el.classList.add("is-bad")),
    );
    if (missing.length) {
      showError("צריך למלא: " + missing.map((key) => LABELS[key]).join(", "));
      return false;
    }
    if (!phoneSchema.safeParse(st.f.phone || "").success) {
      showError("צריך להזין מספר נייד ישראלי תקין.");
      return false;
    }
    if (!isEnglishDisplayName(st.f.appName || "")) {
      acts("on.appName").forEach((el) => el.classList.add("is-bad"));
      showError(ENGLISH_DISPLAY_NAME_ERROR);
      return false;
    }
    if (!st.agreed) {
      showError("צריך לאשר את הסכם השירות כדי להמשיך לתשלום.");
      return false;
    }
    showError("");
    return true;
  }

  function setBusy(busy) {
    st.submitting = busy;
    const button = ref("nextBtn");
    if (button) {
      button.disabled = busy;
      button.setAttribute("aria-busy", String(busy));
    }
    const label = ref("payBtnLabel");
    if (label) label.textContent = busy ? "מעבירים לתשלום..." : "לתשלום";
  }

  function setPayStatus(text) {
    const status = ref("payStatus");
    if (status) status.textContent = text;
  }

  async function finishOnboarding() {
    if (st.submitting || !validate()) return;
    setBusy(true);
    setPayStatus("שומרים את העסק ומעבירים להוראת קבע...");
    try {
      const summary = priceSummary();
      const result = await Promise.race([
        submitBusinessOnboarding(
          {
            managerName: st.f.fullName,
            phone: st.f.phone,
            businessNameHe: st.f.appName,
            plan: "monthly",
            price: String(summary.total),
            commitment: "pending-payment",
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
      persist();
      const checkout = await fetch("/api/subscribe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: result.id,
          customerName: st.f.fullName,
          phone: st.f.phone,
        }),
      });
      const data = await checkout.json().catch(() => ({}));
      if (!checkout.ok || !data.url) {
        throw new Error(data.error || "יצירת דף התשלום נכשלה. נסו שוב.");
      }
      window.location.assign(data.url);
    } catch (error) {
      const cause = error && typeof error === "object" ? error.cause : null;
      if (cause && typeof cause.id === "string") st.savedId = cause.id;
      showError(
        error instanceof Error ? error.message : "השליחה נכשלה. נסו שוב בעוד רגע.",
      );
      setPayStatus("");
    } finally {
      setBusy(false);
    }
  }

  on("next", () => {
    finishOnboarding();
  });

  const agree = ref("agree");
  if (agree) {
    listen(agree, "change", () => {
      st.agreed = agree.checked;
      showError("");
    });
  }

  function playVideos() {
    $$("video", root).forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      if (video.paused) {
        const playing = video.play();
        if (playing && playing.catch) playing.catch(() => {});
      }
    });
  }
  playVideos();
  [400, 1200].forEach((delay) => setTimeout(playVideos, delay));

  return () => scope.dispose();
}
