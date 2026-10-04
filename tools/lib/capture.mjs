// Shared by capture-website.mjs and capture-newsletter.mjs: turns a page
// rendered in Playwright into .pen nodes and adds them to kiwi-news.pen as
// their own area, below what's already there.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(here, "..", "..");
export const PEN = process.env.PEN ?? path.join(ROOT, "kiwi-news.pen");
// The website's static files (logo, banner, …), from a kiwistand checkout
// next to this repo. Images found there are copied into assets/; all other
// images (story previews, avatars) stay placeholders.
export const KIWISTAND = process.env.KIWISTAND ?? path.join(ROOT, "..", "kiwistand");
const PUBLIC = path.join(KIWISTAND, "src", "public");

export const { chromium } = await import(process.env.PLAYWRIGHT ?? "playwright");

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** news.kiwistand.com/<file> → the file in kiwistand/src/public, if any. */
export function publicFile(url) {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== "news.kiwistand.com") return null;
    const file = path.join(PUBLIC, path.normalize(decodeURIComponent(pathname)));
    return file.startsWith(PUBLIC + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
  } catch {
    return null;
  }
}

/** Replaces placeholders of the site's own images with the real files. */
export function localizeImages(node) {
  if (node.src) {
    const file = publicFile(node.src);
    if (file) {
      const name = path.basename(file);
      fs.mkdirSync(path.join(ROOT, "assets", "site"), { recursive: true });
      fs.copyFileSync(file, path.join(ROOT, "assets", "site", name));
      node.fill = { type: "image", url: `assets/site/${name}`, mode: "cover" };
    }
    delete node.src;
  }
  for (const child of node.children ?? []) localizeImages(child);
  return node;
}

/** Moves bottom-fixed bars of a screen to its bottom edge. */
export function pinFixed(screen) {
  const visit = (node, offset) => {
    for (const child of node.children ?? []) {
      if (child.fixedBottom) {
        delete child.fixedBottom;
        child.y = Math.round((screen.height - offset - child.height) * 10) / 10;
      }
      visit(child, offset + (child.y ?? 0));
    }
  };
  visit(screen, 0);
  return screen;
}

/**
 * Adds an area to the design file: a title, then rows of screens, placed
 * below everything else. Replaces earlier nodes whose id starts with
 * `prefix`, so other parts of the file (and designers' edits there) stay.
 */
export function addArea(prefix, rows) {
  const doc = JSON.parse(fs.readFileSync(PEN, "utf-8"));
  const previous = new Map(doc.children.filter((node) => String(node.id).startsWith(prefix)).map((node) => [node.id, node]));
  doc.children = doc.children.filter((node) => !String(node.id).startsWith(prefix));
  // `row.order` lists every screen id of a row: screens that weren't
  // captured this time (skipped, or blocked) keep their earlier capture.
  for (const row of rows) {
    if (!row.order) continue;
    const fresh = new Map(row.screens.map((screen) => [screen.id, screen]));
    row.screens = row.order.map((id) => fresh.get(id) ?? previous.get(id)).filter(Boolean);
  }
  const bottom = (node) => (node.y ?? 0) + (typeof node.height === "number" ? node.height : 900);
  let y = Math.max(...doc.children.map(bottom)) + 300;
  const left = 0;
  for (const [i, row] of rows.entries()) {
    if (!row.screens.length) continue;
    doc.children.push({ type: "text", id: `${prefix}title-${i}`, x: left, y, content: row.title, fill: "#000000", fontSize: 48, fontWeight: "700", fontFamily: "Inter" });
    y += 100;
    let x = left;
    for (const screen of row.screens) {
      doc.children.push({ ...screen, x, y });
      x += screen.width + (row.gap ?? 120);
    }
    y += Math.max(...row.screens.map((s) => s.height)) + 300;
  }
  fs.writeFileSync(PEN, JSON.stringify(doc, null, 2) + "\n");
}

/** Runs in the page: DOM → .pen node tree (absolute positions). */
export function capture({ maxHeight, prefix }) {
  let n = 0;
  const id = () => `${prefix}-${(n++).toString(36)}`;
  const hex = (css) => {
    const m = css && css.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (a === 0) return null;
    const h = (v) => Math.round(v).toString(16).padStart(2, "0").toUpperCase();
    return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a * 255) : ""}`;
  };
  const px = (v) => parseFloat(v) || 0;
  const round = (v) => Math.round(v * 10) / 10;
  const visible = (el, cs) => cs.display !== "none" && cs.visibility !== "hidden" && px(cs.opacity) > 0;

  // An inline SVG icon as a frame of vector paths (one per shape, each with
  // its own fill/stroke), scaled from the viewBox to the icon's box.
  function svgNode(svg, box, origin) {
    const vb = svg.viewBox?.baseVal;
    const vbw = vb && vb.width ? vb.width : box.width;
    const vbh = vb && vb.height ? vb.height : box.height;
    const scale = Math.min(box.width / vbw, box.height / vbh);
    const paths = [];
    for (const shape of svg.querySelectorAll("path,polyline,polygon,line,circle,ellipse,rect")) {
      const cs = getComputedStyle(shape);
      if (cs.display === "none") continue;
      const tag = shape.tagName.toLowerCase();
      const a = (k) => parseFloat(shape.getAttribute(k) || "0");
      const fill = cs.fill !== "none" ? hex(cs.fill) : null;
      const stroke = cs.stroke !== "none" ? hex(cs.stroke) : null;
      if (!fill && !stroke) continue;
      // Phosphor icons start with an invisible full-size <rect fill="none">.
      if (tag === "rect" && !fill && a("width") >= vbw && a("height") >= vbh) continue;
      let d = "";
      switch (tag) {
        case "path": d = shape.getAttribute("d") || ""; break;
        case "polyline":
        case "polygon": {
          const p = (shape.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number);
          for (let i = 0; i < p.length; i += 2) d += `${i ? "L" : "M"}${p[i]} ${p[i + 1]} `;
          if (tag === "polygon") d += "Z";
          break;
        }
        case "line": d = `M${a("x1")} ${a("y1")} L${a("x2")} ${a("y2")}`; break;
        case "circle": case "ellipse": {
          const rx = a("r") || a("rx"), ry = a("r") || a("ry"), cx = a("cx"), cy = a("cy");
          d = `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
          break;
        }
        case "rect": {
          const x = a("x"), y = a("y"), w = a("width"), h = a("height");
          if (w && h) d = `M${x} ${y} h${w} v${h} h${-w} Z`;
          break;
        }
      }
      if (!d) continue;
      // Each path spans the whole icon box so the viewBox maps 1:1.
      const node = { type: "path", id: id(), x: 0, y: 0, width: round(box.width), height: round(box.height), geometry: d, viewBox: [vb?.x ?? 0, vb?.y ?? 0, vbw, vbh] };
      if (fill) node.fill = fill;
      if (stroke) Object.assign(node, {
        stroke, strokeWidth: round(Math.max(px(cs.strokeWidth) * scale, 0.5)),
        strokeLinecap: cs.strokeLinecap || "round", strokeLinejoin: cs.strokeLinejoin || "round",
      });
      paths.push(node);
    }
    if (!paths.length) return null;
    return {
      type: "frame", id: id(), name: "icon", layout: "none",
      x: round(box.left - origin.left), y: round(box.top - origin.top),
      width: round(box.width), height: round(box.height), children: paths,
    };
  }

  function textNodes(el, cs, origin) {
    const out = [];
    for (const child of el.childNodes) {
      if (child.nodeType !== 3 || !child.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(child);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      if (!rects.length) continue;
      const left = Math.min(...rects.map((r) => r.left)), top = Math.min(...rects.map((r) => r.top));
      const right = Math.max(...rects.map((r) => r.right)), bottom = Math.max(...rects.map((r) => r.bottom));
      if (top + scrollY > maxHeight) continue;
      const lineHeight = cs.lineHeight === "normal" ? undefined : round(px(cs.lineHeight) / px(cs.fontSize));
      const node = {
        type: "text", id: id(),
        x: round(left - origin.left), y: round(top - origin.top),
        content: child.textContent.replace(/\s+/g, " ").trim(),
        fontFamily: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
        fontSize: round(px(cs.fontSize)),
        fontWeight: String(cs.fontWeight),
        fill: hex(cs.color) ?? "#000000",
      };
      if (lineHeight) node.lineHeight = lineHeight;
      if (px(cs.letterSpacing)) node.letterSpacing = round(px(cs.letterSpacing));
      if (cs.textDecorationLine.includes("underline")) node.underline = true;
      if (cs.fontStyle === "italic") node.fontStyle = "italic";
      if (rects.length > 1 || cs.whiteSpace.startsWith("pre")) {
        Object.assign(node, { textGrowth: "fixed-width", width: round(right - left + 1) });
      }
      out.push(node);
    }
    return out;
  }

  // A paragraph whose text wraps across inline children ("Here are the
  // <b>five</b> stories …") becomes one wrapping text node: separate nodes
  // per text run would overlap where a run starts mid-line.
  const INLINE = ["inline", "inline-block"];
  function paragraph(el, cs, box, origin) {
    if (INLINE.includes(cs.display) || !el.firstChild) return null;
    let hasText = false;
    let runs = 0;
    for (const child of el.childNodes) {
      if (child.nodeType === 3) {
        if (child.textContent.trim()) hasText = true;
        if (child.textContent.trim()) runs += 1;
        continue;
      }
      if (child.nodeType === 1) runs += 1;
      if (child.nodeType !== 1) continue;
      const ccs = getComputedStyle(child);
      if (ccs.display !== "inline" || child.querySelector("svg,img,video,iframe,input,textarea,button")) return null;
      if (hex(ccs.backgroundColor) || ccs.borderStyle !== "none" && px(ccs.borderWidth) > 0) return null;
    }
    if (!hasText || runs < 2) return null;
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    // Single lines keep one node per run (and their bold/links).
    if (new Set(rects.map((r) => Math.round(r.top / 4))).size < 2) return null;
    const left = box.left + px(cs.paddingLeft) + px(cs.borderLeftWidth);
    const top = Math.min(...rects.map((r) => r.top));
    const width = box.width - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.borderLeftWidth) - px(cs.borderRightWidth);
    const lineHeight = cs.lineHeight === "normal" ? undefined : round(px(cs.lineHeight) / px(cs.fontSize));
    const node = {
      type: "text", id: id(),
      x: round(left - origin.left), y: round(top - origin.top),
      content: el.innerText.replace(/[ \t]+/g, " ").trim(),
      fontFamily: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
      fontSize: round(px(cs.fontSize)), fontWeight: String(cs.fontWeight),
      fill: hex(cs.color) ?? "#000000",
      textGrowth: "fixed-width", width: round(width + 1),
    };
    if (lineHeight) node.lineHeight = lineHeight;
    if (cs.textAlign === "center") node.textAlign = "center";
    return node;
  }

  function walk(el, origin) {
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) return [];
    const box = el.getBoundingClientRect();
    if (box.top + scrollY > maxHeight) return [];
    const tag = el.tagName.toLowerCase();
    if (["script", "style", "noscript", "template", "head", "meta", "link"].includes(tag)) return [];
    if (tag === "svg") {
      if (box.width < 1 || box.height < 1) return [];
      const node = svgNode(el, box, origin);
      return node ? [node] : [];
    }

    const bg = hex(cs.backgroundColor);
    const bgImage = cs.backgroundImage !== "none";
    const widths = ["Top", "Right", "Bottom", "Left"].map((s) => px(cs[`border${s}Width`]));
    const colors = ["Top", "Right", "Bottom", "Left"].map((s) => hex(cs[`border${s}Color`]));
    const hasBorder = widths.some((w, i) => w > 0 && colors[i] && cs[`border${["Top", "Right", "Bottom", "Left"][i]}Style`] !== "none");
    const shadow = cs.boxShadow !== "none" ? cs.boxShadow : null;
    const isImage = tag === "img" || tag === "video" || tag === "canvas" || tag === "iframe";
    const isField = tag === "input" || tag === "textarea" || tag === "select" || tag === "button";
    // Scroll containers (carousels) clip their overflow.
    const clips = [cs.overflow, cs.overflowX, cs.overflowY].some((o) => o === "hidden" || o === "auto" || o === "scroll" || o === "clip");
    const styled = bg || bgImage || hasBorder || shadow || isImage || isField || clips;

    const self = styled && box.width >= 1 && box.height >= 1;
    const nextOrigin = self ? box : origin;
    const children = [];
    const para = !isImage && !isField && paragraph(el, cs, box, nextOrigin);
    if (para) {
      children.push(para);
    } else if (!isImage) {
      children.push(...textNodes(el, cs, nextOrigin));
      if ((tag === "input" || tag === "textarea") && (el.value || el.placeholder)) {
        children.push({
          type: "text", id: id(),
          x: round(px(cs.paddingLeft) + widths[3]), y: round((box.height - px(cs.fontSize) * 1.2) / 2),
          content: el.value || el.placeholder,
          fontFamily: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fontSize: round(px(cs.fontSize)),
          fill: el.value ? hex(cs.color) ?? "#000000" : "#888888",
        });
      }
      for (const child of el.children) children.push(...walk(child, nextOrigin));
    }
    if (!self) return children;

    const node = {
      type: "frame", id: id(), name: (el.className && typeof el.className === "string" && el.className.split(" ")[0]) || tag,
      layout: "none",
      x: round(box.left - origin.left), y: round(box.top - origin.top),
      width: round(box.width), height: round(box.height),
    };
    if (isImage) {
      // Content images are placeholders; designers drop real ones in.
      node.name = tag === "img" ? (el.alt || "image") : tag;
      node.fill = "$color.placeholder";
      if (tag === "img" && el.currentSrc) node.src = el.currentSrc;
    } else if (bg) node.fill = bg;
    const radii = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => round(Math.min(px(cs[`border${c}Radius`]), box.height / 2, box.width / 2)));
    if (radii.some((r) => r > 0)) node.cornerRadius = radii.every((r) => r === radii[0]) ? radii[0] : radii;
    if (hasBorder) {
      const color = colors.find((c, i) => c && widths[i] > 0);
      node.stroke = color;
      node.strokeAlignment = "inner";
      node.strokeWidth = widths.every((w) => w === widths[0]) ? widths[0] : { top: widths[0], right: widths[1], bottom: widths[2], left: widths[3] };
    }
    if (shadow) {
      const m = shadow.match(/(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/);
      if (m) node.effect = { type: "shadow", offset: { x: px(m[2]), y: px(m[3]) }, blur: px(m[4]), color: hex(m[1]) ?? "#00000026" };
    }
    if (clips) node.clip = true;
    // Bars fixed to the bottom of the viewport (the mobile tab bar) go to
    // the bottom of the screen; see pinFixed.
    if (cs.position === "fixed" && box.bottom >= innerHeight - 1) node.fixedBottom = true;
    if (px(cs.opacity) < 1) node.opacity = round(px(cs.opacity));
    node.children = children;
    return [node];
  }

  const root = document.body;
  const body = getComputedStyle(root);
  const html = getComputedStyle(document.documentElement);
  return {
    background: hex(body.backgroundColor) ?? hex(html.backgroundColor) ?? "#FFFFFF",
    height: Math.min(document.documentElement.scrollHeight, maxHeight),
    children: [...root.children].flatMap((child) => walk(child, { left: 0, top: -scrollY })),
  };
}

export async function newPage(browser, device, { localFile } = {}) {
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: 1,
    isMobile: device.mobile,
    hasTouch: device.mobile,
    colorScheme: device.colorScheme ?? "light",
    userAgent: device.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
      : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36",
  });
  const page = await context.newPage();
  // The site's own files come from the kiwistand checkout (so unreleased
  // images show up too). Behind an HTTPS proxy (sandboxes) Chromium may not
  // trust its CA, so everything else is fetched by Node (run with
  // NODE_USE_ENV_PROXY=1).
  await page.route(/^https?:/, async (route) => {
    const request = route.request();
    const local = localFile?.(request.url());
    if (local) return route.fulfill({ path: local });
    if (!process.env.HTTPS_PROXY) return route.continue();
    try {
      const response = await fetch(request.url(), {
        method: request.method(), headers: request.headers(), body: request.postDataBuffer() ?? undefined,
        signal: AbortSignal.timeout(20000),
      });
      const headers = Object.fromEntries(response.headers);
      delete headers["content-encoding"];
      delete headers["content-length"];
      await route.fulfill({ status: response.status, headers, body: Buffer.from(await response.arrayBuffer()) });
    } catch {
      await route.abort();
    }
  });
  return { context, page };
}

