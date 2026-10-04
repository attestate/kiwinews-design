// Checks that a .pen file is intact before it's merged: valid JSON, unique
// ids, references to existing components, and images that exist in the
// repo. Run by CI on every pull request (npm run check).
import fs from "fs";
import path from "path";

const file = path.resolve(process.argv[2] ?? "kiwi-news.pen");
const errors = [];
let doc;
try {
  doc = JSON.parse(fs.readFileSync(file, "utf-8"));
} catch (err) {
  console.error(`${path.basename(file)} isn't valid JSON (${err.message}). Was it saved completely?`);
  process.exit(1);
}
if (!doc.version || !Array.isArray(doc.children)) errors.push("missing `version` or `children`: not a .pen document");

const ids = new Map();
const refs = [];
const images = [];
const walk = (node, where) => {
  if (!node || typeof node !== "object") return;
  if (node.id !== undefined) {
    if (ids.has(node.id)) errors.push(`duplicate id "${node.id}" (${where} and ${ids.get(node.id)})`);
    ids.set(node.id, where);
    if (String(node.id).includes("/")) errors.push(`id "${node.id}" contains "/"`);
  }
  if (node.type === "ref") refs.push([node.ref, where]);
  for (const fill of [node.fill].flat()) if (fill?.type === "image" && fill.url) images.push([fill.url, where]);
  for (const child of node.children ?? []) walk(child, `${where} › ${child.name ?? child.id}`);
  for (const value of Object.values(node.descendants ?? {})) walk(value, where);
};
for (const node of doc.children ?? []) walk(node, node.name ?? node.id);

for (const [target, where] of refs) if (!ids.has(target)) errors.push(`${where}: uses component "${target}", which doesn't exist`);
for (const [url, where] of images) {
  if (/^(https?:|data:)/.test(url)) continue;
  if (!fs.existsSync(path.resolve(path.dirname(file), url))) errors.push(`${where}: image "${url}" is missing (add it to the repo too)`);
}

if (errors.length) {
  console.error(`${path.basename(file)}: ${errors.length} problem(s)\n- ${errors.slice(0, 50).join("\n- ")}`);
  process.exit(1);
}
console.log(`${path.basename(file)}: ok (${ids.size} nodes, ${refs.length} component instances, ${images.length} images)`);
