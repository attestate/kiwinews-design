// Captures the newsletter emails (kiwistand/newsletter, exported to
// newsletter/out with `npm run export:sample`) into the "Newsletter" area
// of kiwi-news.pen: the weekly digest in light and dark mode, wide (desktop
// mail apps) and narrow (phones), plus the story/tweet/cast building
// blocks. Re-running replaces only that area (ids starting with "mail-").
//
//   npm run capture:newsletter
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { chromium, capture, newPage, addArea, localizeImages, pinFixed, publicFile, slug, KIWISTAND } from "./lib/capture.mjs";

const OUT = process.env.NEWSLETTER_OUT ?? path.join(KIWISTAND, "newsletter", "out");
const DIGEST = path.join(OUT, "Digest.html");
if (!fs.existsSync(DIGEST)) {
  console.error(`${DIGEST} is missing. In kiwistand/newsletter run: npm run export:sample`);
  process.exit(1);
}

const DEVICES = [
  { name: "Desktop", width: 800, height: 900, mobile: false },
  { name: "Mobile", width: 390, height: 844, mobile: true },
];
const SCHEMES = ["light", "dark"];
const PARTS = ["Row", "Tweet", "Farcaster", "Bluesky"];

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });

async function shot(file, name, device, prefix) {
  const { context, page } = await newPage(browser, device, { localFile: publicFile });
  await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  const result = await page.evaluate(capture, { maxHeight: 6000, prefix });
  await context.close();
  return pinFixed(localizeImages({
    type: "frame", id: prefix, name, layout: "none", clip: true,
    width: device.width, height: Math.max(200, Math.round(result.height)), fill: result.background,
    children: result.children,
  }));
}

const rows = [];
const digest = [];
for (const scheme of SCHEMES) {
  for (const device of DEVICES) {
    const name = `Newsletter · Digest · ${device.name} · ${scheme}`;
    digest.push(await shot(DIGEST, name, { ...device, colorScheme: scheme }, `mail-digest-${slug(device.name)}-${scheme}`));
    console.log(`${name}: captured`);
  }
}
rows.push({ title: "Newsletter · Weekly digest", screens: digest, gap: 120 });

const parts = [];
for (const part of PARTS) {
  const file = path.join(OUT, `${part}.html`);
  if (!fs.existsSync(file)) continue;
  parts.push(await shot(file, `Newsletter · ${part}`, { ...DEVICES[0], height: 200 }, `mail-part-${slug(part)}`));
  console.log(`Newsletter · ${part}: captured`);
}
rows.push({ title: "Newsletter · Building blocks", screens: parts, gap: 120 });
await browser.close();

addArea("mail-", rows);
console.log(`newsletter: ${digest.length + parts.length} screens added`);
