import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { signAdminSession } from "./src/lib/admin/session-token.ts";

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(".env");
const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error("missing session secret");

const token = await signAdminSession(
  { userId: "audience-check", phone: "0500000000", name: "בדיקה", exp: Date.now() + 10 * 60 * 1000 },
  secret,
);

const api = await fetch("http://127.0.0.1:3000/api/admin/help", {
  headers: { cookie: `tori_admin_session=${token}` },
});
const body = await api.json();
if (!api.ok || !body.ok) {
  console.error("api", api.status, body.message ?? "failed");
  process.exit(1);
}

const categories = body.categories ?? [];
const videos = categories.flatMap((category) => category.videos ?? []);
console.log(
  JSON.stringify({
    categories: categories.length,
    categoryAudiences: [...new Set(categories.map((category) => category.audience))],
    videos: videos.length,
    videoAudiences: [...new Set(videos.map((video) => video.audience))],
  }),
);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
await context.addCookies([
  {
    name: "tori_admin_session",
    value: token,
    domain: "127.0.0.1",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  },
]);
const page = await context.newPage();
await page.goto("http://127.0.0.1:3000/admin/content/videos", { waitUntil: "networkidle" });
await page.getByText("מיועד למנהל").first().waitFor();
await page.getByText("כמו הקטגוריה (מנהל)").first().waitFor();

await page.getByRole("button", { name: "קטגוריה חדשה" }).click();
const categorySelect = page.getByLabel("למי זה מיועד");
await categorySelect.waitFor();
const categoryOptions = await categorySelect.locator("option").allTextContents();
if (categoryOptions.join("|") !== "מנהל|לקוח|כולם") {
  throw new Error(`category options: ${categoryOptions.join("|")}`);
}
if ((await categorySelect.inputValue()) !== "admin") {
  throw new Error(`new category default: ${await categorySelect.inputValue()}`);
}
await page.getByRole("button", { name: "ביטול" }).click();
await page.getByLabel("למי זה מיועד").waitFor({ state: "hidden" });

const editCategory = page.getByRole("button", { name: /^עריכת / }).first();
await editCategory.click();
const editSelect = page.getByLabel("למי זה מיועד");
await editSelect.waitFor();
if ((await editSelect.inputValue()) !== "admin") {
  throw new Error(`existing category value: ${await editSelect.inputValue()}`);
}
await page.getByRole("button", { name: "ביטול" }).click();
await page.getByLabel("למי זה מיועד").waitFor({ state: "hidden" });

await page.getByRole("button", { name: "סרטון" }).first().click();
const videoSelect = page.getByLabel("למי זה מיועד");
await videoSelect.waitFor();
const videoOptions = await videoSelect.locator("option").allTextContents();
if (videoOptions.join("|") !== "כמו הקטגוריה|מנהל|לקוח|כולם") {
  throw new Error(`video options: ${videoOptions.join("|")}`);
}
if ((await videoSelect.inputValue()) !== "inherit") {
  throw new Error(`new video default: ${await videoSelect.inputValue()}`);
}
await page.getByRole("button", { name: "ביטול" }).click();
await page.getByLabel("למי זה מיועד").waitFor({ state: "hidden" });

const videoRow = page.locator(".ad-list-item", { hasText: "כמו הקטגוריה (מנהל)" }).first();
await videoRow.getByRole("button", { name: /^עריכת / }).click();
const existingVideoSelect = page.getByLabel("למי זה מיועד");
await existingVideoSelect.waitFor();
if ((await existingVideoSelect.inputValue()) !== "inherit") {
  throw new Error(`existing video value: ${await existingVideoSelect.inputValue()}`);
}

console.log("ui ok");
await browser.close();
