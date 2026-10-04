// The menu sheet (KiwiNative/Screens/MenuView.swift): the site's sidebar as
// a .medium-detent sheet over the feed. Plain list on Theme.headerBeige,
// 52pt rows with a 22pt icon in a 28pt box and a 20pt label, KiwiLogo as
// the nav title, three sections without separators.
import { frame, vstack, hstack, text, rect, icon, ref, component, uid } from "../../lib/pen.mjs";
import { screen } from "./shell.mjs";
import { W, H } from "../components.mjs";
const BEIGE = "$color.header-beige"; // Theme.headerBeige

export function components() {
  return [
    component("menu-row", hstack({ width: W, height: 52, padding: [0, 20], gap: 14, alignItems: "center" }, [
      frame({ id: "mr-icon-box", width: 28, height: 28, justifyContent: "center", alignItems: "center" }, [
        icon("house", { id: "mr-icon", size: 22, fill: "$color.text-primary" }),
      ]),
      text("Home", { id: "mr-label", fill: "$color.text-primary", fontSize: 20 }),
    ])),
  ];
}

const item = (label, iconName, destructive = false) => ref("menu-row", { id: uid("mrow"), width: "fill_container" }, {
  "mr-icon": { icon: iconName, ...(destructive ? { fill: "$color.alert" } : {}) },
  "mr-label": { content: label, ...(destructive ? { fill: "$color.alert" } : {}) },
});

const group = (rows) => vstack({ id: uid("mgroup"), width: "fill_container" }, rows);

/** The sheet itself: grabber, logo title bar, the three sections. */
function sheet(loggedIn, { y, height }) {
  return vstack({
    id: uid("sheet"), name: "Menu sheet", layoutPosition: "absolute", x: 0, y, width: W, height,
    fill: BEIGE, cornerRadius: [38, 38, 0, 0], clip: true,
    effect: { type: "shadow", offset: { x: 0, y: -2 }, blur: 20, color: "#00000026" },
  }, [
    hstack({ id: uid("grabber-wrap"), width: "fill_container", padding: [5, 0, 0, 0], justifyContent: "center" }, [
      rect({ id: uid("grabber"), width: 36, height: 5, cornerRadius: 2.5, fill: "$color.placeholder-icon" }),
    ]),
    hstack({ id: uid("sheet-nav"), width: "fill_container", height: 52, justifyContent: "center", alignItems: "center" }, [
      ref("logo", { id: uid("sheet-logo") }),
    ]),
    vstack({ id: uid("sheet-list"), width: "fill_container", gap: 16, padding: [4, 0, 0, 0] }, [
      group([
        item("Home", "house"),
        ...(loggedIn ? [item("Profile", "square-user")] : []),
        item("Settings", "settings"),
      ]),
      group([
        item("Guidelines", "book-open"),
        item("Privacy Policy", "lock"),
        item("Wiki", "book"),
      ]),
      group([loggedIn ? item("Log out", "log-out", true) : item("Log in", "circle-user")]),
    ]),
  ]);
}

const feedBehind = () => [
  ref("segmented", { id: uid("seg") }),
  ref("story-card", { id: uid("story") }, {
    "sc-title": { content: "OpenAI says planned GPT-6.1 is too insecure to release" },
    "sc-comment": { enabled: false },
  }),
  ref("story-card", { id: uid("story") }, {
    "sc-title": { content: "Introducing zkAPI: private usage credits for any API" },
    "sc-comment": { enabled: false },
  }),
];

function overSheet(name, loggedIn) {
  const page = screen(name, { tab: "tab-home", content: feedBehind(), contentProps: { padding: [4, 11, 120, 11], gap: 20 } });
  page.children.push(
    rect({ id: uid("dim"), name: "Dim", layoutPosition: "absolute", x: 0, y: 0, width: W, height: H, fill: "#00000033" }),
    sheet(loggedIn, { y: Math.round(H / 2) - 40, height: Math.round(H / 2) + 40 }),
  );
  return page;
}

export function screens() {
  return [overSheet("Menu", true), overSheet("Menu · Logged out", false)];
}
