// Captures pages of a locally running branch into kiwi-news.pen as a
// mockup area for a pull request, desktop and mobile:
//
//   SITE=http://localhost:4000 node tools/capture-mockup.mjs kiwistand-214 "/" "/newsletter"
//
// Replaces only that PR's area (ids starting with "mock-<name>-"); render
// it with tools/render.mjs to get the PNGs for the PR description.
import { chromium, capture, newPage, addArea, localizeImages, pinFixed, slug } from "./lib/capture.mjs";

const [name, ...paths] = process.argv.slice(2);
if (!name || !paths.length) {
  console.error("usage: capture-mockup.mjs <name> <path> [path …]");
  process.exit(1);
}
const SITE = process.env.SITE ?? "http://localhost:4000";
const DEVICES = [
  { name: "Desktop", width: 1280, height: 900, mobile: false, maxHeight: 3200 },
  { name: "Mobile", width: 390, height: 844, mobile: true, maxHeight: 3200 },
];

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });
const rows = [];
for (const device of DEVICES) {
  const screens = [];
  for (const path of paths) {
    const prefix = `mock-${slug(name)}-${slug(device.name)}-${slug(path) || "home"}`;
    const { context, page } = await newPage(browser, device);
    await page.goto(`${SITE}${path}`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const result = await page.evaluate(capture, { maxHeight: device.maxHeight, prefix });
    await context.close();
    screens.push(pinFixed(localizeImages({
      type: "frame", id: prefix, name: `Mockup ${name} · ${device.name} · ${path}`, layout: "none", clip: true,
      width: device.width, height: Math.max(device.height, Math.round(result.height)), fill: result.background,
      children: result.children,
    })));
    console.log(`${device.name} ${path}: captured as ${prefix}`);
  }
  rows.push({ title: `Mockup · ${name} · ${device.name}`, screens, gap: device.mobile ? 80 : 120 });
}
await browser.close();
addArea(`mock-${slug(name)}-`, rows);
