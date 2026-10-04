// Small helpers for writing .pen documents (pen.dev's JSON design format,
// https://docs.pen.dev/for-developers/the-pen-format) from code.
//
// Every node needs a document-wide unique `id`. Components (`reusable: true`)
// keep short, stable ids for their parts so instances can override them via
// `descendants`; screens get unique ids from `uid()`.
import fs from "fs";
import path from "path";

let counter = 0;
/** Unique id with a readable prefix ("u-story-3f"). The "u-" keeps them
 * apart from component part ids like "seg-1". */
export function uid(prefix = "n") {
  counter += 1;
  return `u-${prefix}-${counter.toString(36)}`;
}

/** A frame (flexbox container). Defaults: horizontal layout, fit content. */
export function frame(props = {}, children = []) {
  return { type: "frame", id: props.id ?? uid(props.name ?? "frame"), ...props, children };
}

export function vstack(props = {}, children = []) {
  return frame({ layout: "vertical", ...props }, children);
}

export function hstack(props = {}, children = []) {
  return frame({ layout: "horizontal", ...props }, children);
}

/** Text. `width: "fill_container"` wraps it inside its parent. */
export function text(content, props = {}) {
  const node = {
    type: "text",
    id: props.id ?? uid("text"),
    content,
    fontFamily: "$font.family",
    ...props,
  };
  if (node.width !== undefined && !node.textGrowth) node.textGrowth = "fixed-width";
  return node;
}

export function rect(props = {}) {
  return { type: "rectangle", id: props.id ?? uid("rect"), ...props };
}

export function ellipse(props = {}) {
  return { type: "ellipse", id: props.id ?? uid("ellipse"), ...props };
}

/** An icon from pen.dev's built-in libraries (lucide, phosphor, …). */
export function icon(name, props = {}) {
  return {
    type: "icon",
    id: props.id ?? uid("icon"),
    library: props.library ?? "lucide",
    icon: name,
    width: props.size ?? 20,
    height: props.size ?? 20,
    fill: props.fill ?? "$color.text-primary",
    ...without(props, ["size", "library", "fill"]),
  };
}

/** An SVG path (used for the website's Phosphor line icons and the wordmark). */
export function pathNode(geometry, props = {}) {
  return { type: "path", id: props.id ?? uid("path"), geometry, ...props };
}

/** An instance of a component. `descendants` overrides its parts by id. */
export function ref(component, props = {}, descendants) {
  const node = { type: "ref", id: props.id ?? uid(`${component}-i`), ref: component, ...props };
  if (descendants) node.descendants = descendants;
  return node;
}

/** Marks a node as a reusable component with a stable id. */
export function component(id, node) {
  return { ...node, id, name: node.name ?? id, reusable: true };
}

/** Image fill (URL relative to the .pen file). */
export function image(url, mode = "cover") {
  return { type: "image", url, mode };
}

export function note(content, props = {}) {
  return { type: "note", id: props.id ?? uid("note"), content, ...props };
}

export function without(object, keys) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
}

/** Light/dark color variable. Alpha colors use #RRGGBBAA. */
export function themed(light, dark) {
  return { type: "color", value: [{ value: light, theme: { mode: "light" } }, { value: dark, theme: { mode: "dark" } }] };
}

/** rgba(166,110,78,0.15) → #A66E4E26 */
export function rgba(r, g, b, a) {
  const hex = (n) => Math.round(n).toString(16).padStart(2, "0").toUpperCase();
  return `#${hex(r)}${hex(g)}${hex(b)}${hex(a * 255)}`;
}

/** Converts an SVG's <path d> and <polyline points> into one path geometry. */
export function svgGeometry(svg) {
  const parts = [];
  for (const [, d] of svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)) parts.push(d);
  for (const [, points] of svg.matchAll(/<polyline[^>]*points="([^"]+)"/g)) {
    const nums = points.trim().split(/[\s,]+/).map(Number);
    let d = "";
    for (let i = 0; i < nums.length; i += 2) d += `${i ? "L" : "M"}${nums[i]} ${nums[i + 1]} `;
    parts.push(d.trim());
  }
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);
  return { geometry: parts.join(" "), viewBox };
}

export function readSVG(file) {
  return svgGeometry(fs.readFileSync(file, "utf-8"));
}

export function writeDocument(file, document) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(document, null, 2) + "\n");
}
