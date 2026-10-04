// Renders kiwi-news.pen to PNGs without pen.dev: one image per screen
// (top-level frame) plus the whole canvas. CI posts these on pull requests
// so a design change can be reviewed in the browser.
//
//   node tools/render.mjs kiwi-news.pen out/preview [screen-id …]
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { renderDocument } from "./lib/preview.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT ?? "playwright");
const require = createRequire(import.meta.url);
const [input = "kiwi-news.pen", outDir = "out/preview", ...ids] = process.argv.slice(2);
const file = path.resolve(input);
fs.mkdirSync(outDir, { recursive: true });

const icons = path.dirname(require.resolve("lucide-static/package.json"));
const iconSVG = (library, name) => {
  try {
    return fs.readFileSync(path.join(icons, "icons", `${name}.svg`), "utf-8");
  } catch {
    return null;
  }
};

const doc = JSON.parse(fs.readFileSync(file, "utf-8"));
const html = path.resolve(outDir, "canvas.html");
fs.writeFileSync(html, renderDocument(doc, { baseDir: path.dirname(file), iconSVG }));

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.route(/^https?:/, async (route) => {
  if (!process.env.HTTPS_PROXY) return route.continue();
  try {
    const response = await fetch(route.request().url(), { signal: AbortSignal.timeout(15000) });
    await route.fulfill({ status: response.status, headers: { "content-type": response.headers.get("content-type") || "" }, body: Buffer.from(await response.arrayBuffer()) });
  } catch {
    await route.abort();
  }
});
await page.goto(`file://${html}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const screens = ids.length ? ids : doc.children.filter((node) => node.type === "frame" || node.type === "ref").map((node) => node.id);
for (const id of screens) {
  const target = path.join(outDir, `${id}.png`);
  await page.locator(`[data-id="${id}"]`).first().screenshot({ path: target }).catch((err) => console.warn(`${id}: ${err.message.split("\n")[0]}`));
}
if (!ids.length) await page.screenshot({ path: path.join(outDir, "canvas.png"), fullPage: true });
await browser.close();
console.log(`${screens.length} screens → ${outDir}`);
