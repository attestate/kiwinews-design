// Generates the iOS part of the design from code that mirrors the SwiftUI
// views (the initial import of kiwi-news.pen). Designers now edit
// kiwi-news.pen directly, so this writes to out/ and never over it:
//
//   node tools/build-ios.mjs                   # → out/kiwi-ios.generated.pen
//   node tools/build-ios.mjs --only feed,story --out /tmp/x.pen
//
// Needs a kiwinews-ios checkout next to this repo (or KIWINEWS_IOS=path)
// for the app's icons.
//
// The canvas has three areas: the component library (left), every screen
// in light mode, and the same screens again in dark mode. The dark row
// holds instances of the light screens with theme {mode: dark}, so editing
// a light screen updates its dark twin.
import path from "path";
import { parseArgs } from "util";
import { fileURLToPath } from "url";
import { vstack, text, ref, writeDocument } from "./lib/pen.mjs";
import { variables, themes } from "./ios/tokens.mjs";
import { components as baseComponents, W, H } from "./ios/components.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const { values: args } = parseArgs({
  options: { only: { type: "string" }, out: { type: "string", default: path.join(here, "..", "out", "kiwi-ios.generated.pen") } },
});

// Screen modules, in canvas order. Each exports `screens()` and may export
// `components()` for parts only its screens use.
const MODULES = ["feed", "story", "submit", "activity", "profile", "settings", "menu", "search", "onboarding", "documents"];
const only = args.only?.split(",");
const modules = [];
for (const name of MODULES) {
  if (only && !only.includes(name)) continue;
  try {
    modules.push(await import(`./ios/screens/${name}.mjs`));
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND" || !String(err.message).includes(`${name}.mjs`)) throw err;
  }
}

const GAP = 80;
const label = (id, content, x, y) => text(content, { id, x, y, fill: "#000000", fontSize: 48, fontWeight: "700" });

const allComponents = [...baseComponents(), ...modules.flatMap((m) => m.components?.() ?? [])];
const library = vstack({
  id: "components", name: "Components", x: 0, y: 140, width: W + 80, padding: 40, gap: 48, fill: "#FFFFFA", cornerRadius: 12,
}, allComponents.map((c) => vstack({ id: `cell-${c.id}`, name: c.name, width: "fill_container", gap: 12 }, [
  text(c.name, { id: `cell-${c.id}-label`, fill: "#828282", fontSize: 14, fontWeight: "500" }),
  c,
])));

const screens = modules.flatMap((m) => m.screens());
const screensX = W + 80 + 200;
const lightY = 140;
const tallest = Math.max(H, ...screens.map((s) => (typeof s.height === "number" ? s.height : H)));
const darkY = lightY + tallest + 260;

const light = screens.map((screen, i) => ({ ...screen, reusable: true, x: screensX + i * (W + GAP), y: lightY }));
const dark = screens.map((screen, i) => ref(screen.id, {
  id: `${screen.id}-dark`, name: `${screen.name} (dark)`, x: screensX + i * (W + GAP), y: darkY, theme: { mode: "dark" },
}));

const ids = new Set();
const walk = (node) => {
  if (ids.has(node.id)) throw new Error(`duplicate id ${node.id}`);
  ids.add(node.id);
  (node.children ?? []).forEach(walk);
};

const document = {
  version: "2.20",
  themes,
  variables,
  children: [
    label("title-components", "Components", 0, 40),
    library,
    label("title-light", "Screens · Light", screensX, 40),
    ...light,
    label("title-dark", "Screens · Dark", screensX, darkY - 100),
    ...dark,
  ],
};
document.children.forEach(walk);

writeDocument(args.out, document);
console.log(`${path.relative(process.cwd(), args.out)}: ${allComponents.length} components, ${screens.length} screens (light + dark)`);
