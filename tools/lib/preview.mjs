// Renders a .pen document to static HTML, close enough to check layout,
// colors and themes without pen.dev (e.g. in CI or a headless session).
// It supports what our generator uses: frames with flex layout, text,
// rectangles, ellipses, paths, lucide icons, refs with overrides and
// descendants, variables and themes. pen.dev itself is the reference.
//
//   node design/lib/preview.mjs design/kiwi-ios.pen out.html
import fs from "fs";
import path from "path";

export function renderDocument(doc, { baseDir = ".", iconSVG = () => null, only } = {}) {
  const components = new Map();
  const index = (node) => {
    if (node.reusable) components.set(node.id, node);
    for (const child of node.children ?? []) index(child);
  };
  doc.children.forEach(index);

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function findById(node, id) {
    if (node.id === id) return node;
    for (const child of node.children ?? []) {
      const found = findById(child, id);
      if (found) return found;
    }
    return null;
  }

  function replaceById(node, id, replacement) {
    const children = node.children ?? [];
    for (let i = 0; i < children.length; i++) {
      if (children[i].id === id) {
        children[i] = replacement;
        return true;
      }
      if (replaceById(children[i], id, replacement)) return true;
    }
    return false;
  }

  /** Expands refs into plain trees, applying overrides and descendants. */
  function expand(node) {
    if (node.type === "ref") {
      const source = components.get(node.ref);
      if (!source) return { type: "note", id: node.id, content: `missing component ${node.ref}` };
      const tree = clone(source);
      delete tree.reusable;
      for (const [key, value] of Object.entries(node)) {
        if (["type", "ref", "descendants", "reusable"].includes(key)) continue;
        tree[key] = value;
      }
      for (const [key, override] of Object.entries(node.descendants ?? {})) {
        const [head, ...rest] = key.split("/");
        if (rest.length) {
          const target = findById(tree, head);
          if (!target) continue;
          target.descendants = target.descendants ?? {};
          const restKey = rest.join("/");
          target.descendants[restKey] = { ...(target.descendants[restKey] ?? {}), ...override };
          continue;
        }
        if (override.type) {
          if (tree.id === head) Object.assign(tree, override);
          else replaceById(tree, head, clone(override));
          continue;
        }
        const target = tree.id === head ? tree : findById(tree, head);
        if (target) Object.assign(target, clone(override));
      }
      return expand(tree);
    }
    if (node.children) node = { ...node, children: node.children.map(expand) };
    return node;
  }

  function resolver(theme) {
    return (value) => {
      if (typeof value !== "string" || !value.startsWith("$")) return value;
      const variable = doc.variables?.[value.slice(1)];
      if (!variable) return undefined;
      let resolved = variable.value;
      if (Array.isArray(resolved)) {
        let winner = resolved[0]?.value;
        for (const entry of resolved) {
          const ok = Object.entries(entry.theme ?? {}).every(([axis, v]) => (theme[axis] ?? doc.themes?.[axis]?.[0]) === v);
          if (ok) winner = entry.value;
        }
        resolved = winner;
      }
      return typeof resolved === "string" && resolved.startsWith("$") ? resolver(theme)(resolved) : resolved;
    };
  }

  const px = (v) => (typeof v === "number" ? `${v}px` : undefined);
  const color = (hex) => {
    if (typeof hex !== "string" || !hex.startsWith("#")) return hex;
    if (hex.length === 9) {
      const n = (i) => parseInt(hex.slice(i, i + 2), 16);
      return `rgba(${n(1)},${n(3)},${n(5)},${(n(7) / 255).toFixed(3)})`;
    }
    return hex;
  };
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function render(node, parent, theme) {
    if (node.enabled === false) return "";
    theme = { ...theme, ...(node.theme ?? {}) };
    const v = resolver(theme);
    const style = [];
    const parentLayout = parent ? (parent.type === "frame" ? parent.layout ?? "horizontal" : "none") : "root";
    const absolute = parentLayout === "none" || parentLayout === "root" || node.layoutPosition === "absolute";
    if (absolute) style.push("position:absolute", `left:${node.x ?? 0}px`, `top:${node.y ?? 0}px`);
    else style.push("position:relative", "flex-shrink:0");

    const size = (dim, value) => {
      value = v(value);
      if (typeof value === "number") return style.push(`${dim}:${value}px`);
      if (typeof value !== "string") return;
      if (value.startsWith("fill_container")) {
        const main = (parentLayout === "horizontal" && dim === "width") || (parentLayout === "vertical" && dim === "height");
        if (absolute) {
          const fallback = value.match(/\((\d+)\)/)?.[1];
          if (fallback) style.push(`${dim}:${fallback}px`);
        } else if (main) style.push("flex:1 1 0", `min-${dim}:0`);
        else style.push("align-self:stretch");
      }
    };
    size("width", node.width);
    size("height", node.height);
    if (node.opacity !== undefined) style.push(`opacity:${v(node.opacity)}`);
    if (node.cornerRadius !== undefined) {
      const r = Array.isArray(node.cornerRadius) ? node.cornerRadius.map((x) => px(v(x))).join(" ") : px(v(node.cornerRadius));
      style.push(`border-radius:${r}`);
    }
    const fills = node.fill === undefined ? [] : Array.isArray(node.fill) ? node.fill : [node.fill];
    if (!["text", "path", "icon"].includes(node.type)) {
      const layers = [];
      for (const fill of fills) {
        if (typeof fill === "string") layers.push(`linear-gradient(${color(v(fill))},${color(v(fill))})`);
        else if (fill?.type === "image") layers.push(`url('${path.join(baseDir, fill.url)}') center/${fill.mode === "stretch" ? "100% 100%" : fill.mode ?? "cover"} no-repeat`);
        else if (fill?.type === "color") layers.push(`linear-gradient(${color(v(fill.color))},${color(v(fill.color))})`);
      }
      if (layers.length) style.push(`background:${layers.reverse().join(",")}`);
    }
    if (node.stroke !== undefined && !["path"].includes(node.type)) {
      const w = v(node.strokeWidth) ?? 1;
      style.push(`box-shadow:inset 0 0 0 ${typeof w === "number" ? w : 1}px ${color(v(Array.isArray(node.stroke) ? node.stroke[0] : node.stroke))}`);
    }
    const effects = node.effect === undefined ? [] : Array.isArray(node.effect) ? node.effect : [node.effect];
    const shadows = effects.filter((e) => e.type === "shadow" && e.enabled !== false)
      .map((e) => `${e.offset?.x ?? 0}px ${e.offset?.y ?? 0}px ${v(e.blur) ?? 0}px ${color(v(e.color))}`);
    if (shadows.length) {
      const existing = style.findIndex((s) => s.startsWith("box-shadow:"));
      if (existing >= 0) style[existing] += "," + shadows.join(",");
      else style.push(`box-shadow:${shadows.join(",")}`);
    }

    if (node.type === "frame" || node.type === "group") {
      const layout = node.type === "group" ? "none" : node.layout ?? "horizontal";
      if (layout !== "none") {
        style.push("display:flex", `flex-direction:${layout === "vertical" ? "column" : "row"}`);
        if (node.gap !== undefined) style.push(`gap:${px(v(node.gap))}`);
        const justify = { start: "flex-start", center: "center", end: "flex-end", space_between: "space-between", space_around: "space-around" };
        const align = { start: "flex-start", center: "center", end: "flex-end" };
        style.push(`justify-content:${justify[node.justifyContent ?? "start"]}`, `align-items:${align[node.alignItems ?? "start"]}`);
      }
      if (node.padding !== undefined) {
        const p = Array.isArray(node.padding) ? node.padding.map((x) => px(v(x))) : [px(v(node.padding))];
        style.push(`padding:${p.join(" ")}`);
      }
      if (v(node.clip)) style.push("overflow:hidden");
      const inner = (node.children ?? []).map((child) => render(child, { ...node, layout }, theme)).join("");
      return `<div data-id="${esc(node.id)}" title="${esc(node.name ?? node.id)}" style="${style.join(";")}">${inner}</div>`;
    }
    if (node.type === "text") {
      const fill = color(v(Array.isArray(node.fill) ? node.fill[0] : node.fill)) ?? "#000";
      style.push(`color:${fill}`, `font-family:${v(node.fontFamily) ?? "Inter"},system-ui,sans-serif`);
      if (node.fontSize !== undefined) style.push(`font-size:${px(v(node.fontSize))}`);
      if (node.fontWeight !== undefined) style.push(`font-weight:${v(node.fontWeight)}`);
      if (node.lineHeight !== undefined) style.push(`line-height:${v(node.lineHeight)}`);
      else style.push("line-height:1.21");
      if (node.letterSpacing !== undefined) style.push(`letter-spacing:${px(v(node.letterSpacing))}`);
      if (node.textAlign) style.push(`text-align:${node.textAlign}`);
      style.push(node.textGrowth === "fixed-width" || node.textGrowth === "fixed-width-height" ? "white-space:pre-wrap" : "white-space:pre");
      return `<div data-id="${esc(node.id)}" style="${style.join(";")}">${esc(v(node.content))}</div>`;
    }
    if (node.type === "path") {
      const vb = node.viewBox ? node.viewBox.join(" ") : undefined;
      const fill = node.fill !== undefined ? color(v(node.fill)) : "none";
      const stroke = node.stroke !== undefined ? color(v(node.stroke)) : "none";
      const sw = v(node.strokeWidth) ?? 1;
      return `<svg data-id="${esc(node.id)}" style="${style.join(";")};overflow:visible" ${vb ? `viewBox="${vb}"` : ""} preserveAspectRatio="xMidYMid meet"><path d="${node.geometry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" vector-effect="non-scaling-stroke" stroke-linecap="${node.strokeLinecap ?? "butt"}" stroke-linejoin="${node.strokeLinejoin ?? "miter"}"/></svg>`;
    }
    if (node.type === "icon") {
      const svg = iconSVG(v(node.library), v(node.icon));
      const fill = color(v(Array.isArray(node.fill) ? node.fill[0] : node.fill)) ?? "#000";
      if (!svg) return `<div style="${style.join(";")};outline:1px dashed red" title="missing icon ${esc(node.icon)}"></div>`;
      const data = Buffer.from(svg).toString("base64");
      style.push(`background:${fill}`, `-webkit-mask:url(data:image/svg+xml;base64,${data}) center/contain no-repeat`, `mask:url(data:image/svg+xml;base64,${data}) center/contain no-repeat`);
      return `<div data-id="${esc(node.id)}" title="${esc(node.icon)}" style="${style.join(";")}"></div>`;
    }
    if (node.type === "rectangle" || node.type === "ellipse") {
      if (node.type === "ellipse") style.push("border-radius:50%");
      return `<div data-id="${esc(node.id)}" style="${style.join(";")}"></div>`;
    }
    if (node.type === "note") {
      style.push("background:#FFF6B3", "padding:12px", "font:13px Inter,sans-serif", "white-space:pre-wrap", "color:#333");
      return `<div style="${style.join(";")}">${esc(v(node.content))}</div>`;
    }
    return "";
  }

  const roots = doc.children.filter((node) => !only || only(node)).map(expand);
  const width = Math.max(...roots.map((n) => (n.x ?? 0) + (typeof n.width === "number" ? n.width : 400))) + 40;
  const height = Math.max(...roots.map((n) => (n.y ?? 0) + (typeof n.height === "number" ? n.height : 900))) + 40;
  const body = roots.map((node) => render(node, null, {})).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>html,body{margin:0;background:#E5E5E5}*{box-sizing:border-box}</style></head>
<body><div style="position:relative;width:${width}px;height:${height}px">${body}</div></body></html>`;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const [input, output] = process.argv.slice(2);
  const doc = JSON.parse(fs.readFileSync(input, "utf-8"));
  const html = renderDocument(doc, { baseDir: path.dirname(path.resolve(input)) });
  fs.writeFileSync(output, html);
  console.log(`wrote ${output}`);
}
