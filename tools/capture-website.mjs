// Captures pages of the live website (news.kiwistand.com), desktop and
// mobile, into the "Website" area of kiwi-news.pen. Re-running replaces
// only that area (ids starting with "web-").
//
//   npm run capture:website
//
// Every visible element with a background, border, shadow or text becomes
// a frame or text node at its exact position (absolute layout, like a
// web-to-design import). Inline SVG icons become vector paths; the site's
// own images (logo, banners) are copied into assets/site, other images
// (story previews, avatars) are placeholders.
//
// Cloudflare's bot check blocks most pages from datacenter IPs (CI,
// cloud sandboxes); run this from a normal internet connection.
import { chromium, capture, newPage, addArea, localizeImages, pinFixed, slug } from "./lib/capture.mjs";

const SITE = "https://news.kiwistand.com";
const PROFILE = "0xee324c588ceF1BF1c1360883E4318834af66366d"; // timdaub.eth
const PAGES = [
  ["Home · Hot", "/"],
  ["New", "/new"],
  ["Best", "/best"],
  ["Story", null], // first story of the hot feed, filled in below
  ["Submit", "/submit"],
  ["Profile", `/upvotes?address=${PROFILE}`],
  ["Notifications", `/activity?address=${PROFILE}`],
  ["Search", "/search?q=ethereum"],
  ["Guidelines", "/guidelines"],
  ["Privacy Policy", "/privacy-policy"],
  ["iOS App", "/app-testflight"],
];
// ONLY="Home · Hot,New" captures a subset (the other website screens stay).
const ONLY = process.env.ONLY?.split(",");
const DEVICES = [
  { name: "Desktop", width: 1280, height: 900, mobile: false, maxHeight: 3200 },
  { name: "Mobile", width: 390, height: 844, mobile: true, maxHeight: 3200 },
];

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });

{
  const { context, page } = await newPage(browser, DEVICES[0]);
  await page.goto(`${SITE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const href = await page.evaluate(() => [...document.querySelectorAll('a[href*="/stories/"]')].map((a) => a.getAttribute("href")).find(Boolean));
  if (href) PAGES.find((p) => p[0] === "Story")[1] = href.startsWith("http") ? new URL(href).pathname + new URL(href).search : href;
  await context.close();
}

const rows = [];
let blocked = 0;
for (const device of DEVICES) {
  const screens = [];
  for (const [name, url] of PAGES) {
    if (!url || (ONLY && !ONLY.includes(name))) continue;
    // A fresh context per page: Cloudflare's bot check is less likely to
    // step in on a first visit than on a burst of navigations.
    const { context, page } = await newPage(browser, device);
    const prefix = `web-${slug(device.name)}-${slug(name)}`;
    try {
      await page.goto(`${SITE}${url}`, { waitUntil: "networkidle", timeout: 60000 });
    } catch {
      // Live pages poll; capture what has loaded.
    }
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 0));
    const title = await page.title();
    if (/just a moment|attention required/i.test(title)) {
      console.log(`${device.name} ${name}: blocked by Cloudflare's bot check, skipped`);
      blocked += 1;
      await context.close();
      continue;
    }
    const result = await page.evaluate(capture, { maxHeight: device.maxHeight, prefix });
    await context.close();
    screens.push(pinFixed(localizeImages({
      type: "frame", id: prefix, name: `Web ${device.name} · ${name}`, layout: "none", clip: true,
      width: device.width, height: Math.max(device.height, Math.round(result.height)), fill: result.background,
      children: result.children,
    })));
    console.log(`${device.name} ${name}: captured`);
  }
  const order = PAGES.map(([name]) => `web-${slug(device.name)}-${slug(name)}`);
  rows.push({ title: `Website · ${device.name}`, screens, order, gap: device.mobile ? 80 : 120 });
}
await browser.close();

addArea("web-", rows);
console.log(`website: ${rows.reduce((n, r) => n + r.screens.length, 0)} screens added${blocked ? `, ${blocked} blocked by Cloudflare` : ""}`);
