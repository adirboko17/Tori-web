import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanSenderName,
  designFromProfile,
  designProfilePatch,
  senderNameError,
  unknownMediaUrl,
  uploadSpec,
  validateDesign,
} from "../src/lib/account/design.ts";

const PREFIX = "https://x.supabase.co/storage/v1/object/public/app_design/business-images/";

test("sender name is English letters and digits, no spaces, up to 11", () => {
  assert.equal(senderNameError("StudioNoa"), null);
  assert.equal(senderNameError("Noa2"), null);
  assert.notEqual(senderNameError("Studio Noa"), null);
  assert.notEqual(senderNameError("סטודיו"), null);
  assert.notEqual(senderNameError("LironHuri4821"), null);
  assert.notEqual(senderNameError("0501234567"), null);
  assert.notEqual(senderNameError(""), null);
  assert.equal(cleanSenderName("Studio Noa סטודיו!"), "StudioNoa");
  assert.equal(cleanSenderName("ABCDEFGHIJKLMN"), "ABCDEFGHIJK");
});

test("the sender name is required to save the design", () => {
  assert.equal(validateDesign({}).ok, false);
  const result = validateDesign({ fromNumber: "StudioNoa" });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.heroKind, "none");
});

test("a chosen home media needs its file", () => {
  assert.equal(validateDesign({ fromNumber: "Noa", heroKind: "video" }).ok, false);
  assert.equal(validateDesign({ fromNumber: "Noa", heroKind: "images", heroImages: [] }).ok, false);
  assert.equal(
    validateDesign({ fromNumber: "Noa", heroKind: "image", heroUrl: `${PREFIX}home-hero-single/a.jpg` }).ok,
    true,
  );
});

test("uploads accept only images, or MP4/MOV for the video, up to 10MB", () => {
  const logo = uploadSpec("logo", "image/png", 2000);
  assert.deepEqual(logo, { ok: true, folder: "business-images/home-logos", ext: "png" });
  assert.equal(uploadSpec("hero-video", "video/mp4", 5_000_000).ok, true);
  assert.equal(uploadSpec("hero-video", "image/png", 2000).ok, false);
  assert.equal(uploadSpec("logo", "image/svg+xml", 2000).ok, false);
  assert.equal(uploadSpec("hero-images", "image/jpeg", 11 * 1024 * 1024).ok, false);
  assert.equal(uploadSpec("cover", "image/jpeg", 2000).ok, false);
});

test("business_profile columns map to the hero choice", () => {
  const single = designFromProfile({
    home_hero_mode: "single_fullbleed",
    home_hero_single_url: `${PREFIX}home-hero-single/v.mp4`,
    home_hero_single_kind: "video",
    home_hero_images: [`${PREFIX}home-hero/1.jpg`],
    home_logo_url: `${PREFIX}home-logos/l.png`,
    pulseem_from_number: "Noa",
  });
  assert.equal(single.heroKind, "video");
  assert.equal(single.logoUrl, `${PREFIX}home-logos/l.png`);
  assert.equal(designFromProfile({ home_hero_mode: "marquee", home_hero_images: [`${PREFIX}home-hero/1.jpg`] }).heroKind, "images");
  assert.equal(designFromProfile({}).heroKind, "none");
});

test("saving writes the columns the app reads", () => {
  const base = { logoUrl: "", heroUrl: "", heroImages: [], fromNumber: "Noa" };
  assert.deepEqual(designProfilePatch({ ...base, heroKind: "video", heroUrl: "u" }), {
    home_logo_url: null,
    pulseem_from_number: "Noa",
    home_hero_mode: "single_fullbleed",
    home_hero_single_url: "u",
    home_hero_single_kind: "video",
  });
  assert.deepEqual(designProfilePatch({ ...base, heroKind: "images", heroImages: ["a", "b"] }), {
    home_logo_url: null,
    pulseem_from_number: "Noa",
    home_hero_mode: "marquee",
    home_hero_images: ["a", "b"],
  });
  assert.deepEqual(designProfilePatch({ ...base, heroKind: "none" }).home_hero_images, []);
});

test("media must be uploaded here or already saved on the business", () => {
  const current = designFromProfile({ home_logo_url: "https://cdn.example.com/old-logo.png" });
  const design = {
    logoUrl: "https://cdn.example.com/old-logo.png",
    heroKind: "image" as const,
    heroUrl: `${PREFIX}home-hero-single/a.jpg`,
    heroImages: [],
    fromNumber: "Noa",
  };
  assert.equal(unknownMediaUrl(design, current, PREFIX), null);
  assert.equal(
    unknownMediaUrl({ ...design, heroUrl: "https://evil.example.com/a.jpg" }, current, PREFIX),
    "https://evil.example.com/a.jpg",
  );
});
