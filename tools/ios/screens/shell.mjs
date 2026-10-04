// The phone frame every screen sits in: status bar, nav bar, scrolling
// content and (on tab screens) the floating tab bar.
import { frame, vstack, ref, uid } from "../../lib/pen.mjs";
import { W, H } from "../components.mjs";

/**
 * @param {string} name   Screen name shown on the canvas.
 * @param {object} opts
 *   nav: "main" (menu/logo/search) | {back: "Title"} | null
 *   tab: "tab-home" | "tab-new" | "tab-submit" | "tab-activity" | null
 *   content: children of the scrolling area
 *   contentProps: overrides for the scrolling area (padding, gap, fill)
 *   background: page color variable
 */
export function screen(name, { nav = "main", tab = "tab-home", content = [], contentProps = {}, background = "$color.page", height = H } = {}) {
  const children = [ref("status-bar", { id: uid("status") })];
  if (nav === "main") children.push(ref("nav-bar", { id: uid("nav") }));
  else if (nav && nav.back !== undefined) {
    children.push(ref("nav-bar-back", { id: uid("navb") }, { "navb-title": { content: nav.back } }));
  }
  children.push(vstack({
    id: uid("content"), name: "Content", width: "fill_container", height: "fill_container", clip: true, ...contentProps,
  }, content));
  if (tab) {
    const selected = ["tab-home", "tab-new", "tab-submit", "tab-activity"];
    const descendants = Object.fromEntries(selected.map((id) => [id, { fill: id === tab ? "$color.tab-selected" : "#00000000" }]));
    children.push(ref("tab-bar", { id: uid("tabs"), layoutPosition: "absolute", x: 16, y: height - 62 - 24 }, descendants));
  }
  const id = "screen-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return frame({ id, name, layout: "vertical", width: W, height, fill: background, clip: true, cornerRadius: 0 }, children);
}
