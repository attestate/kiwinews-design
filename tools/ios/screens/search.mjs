// Search sheet (KiwiNative/Screens/SearchView.swift), opened from the feed's
// search button with `.sheet` (large detent, no grabber): inline "Search"
// title with Cancel, an always-visible search field, and the hits as story
// cards (StoryRow without comment preview or comments button), stacked
// edge to edge with an inset divider under each.
import { frame, vstack, hstack, text, rect, icon, ref, component, uid } from "../../lib/pen.mjs";
import { screen } from "./shell.mjs";

export function components() {
  return [
    // `.searchable(placement: .navigationBarDrawer(displayMode: .always))`.
    component("search-field", hstack({ width: "fill_container", padding: [2, 16, 10, 16] }, [
      hstack({ id: "sf-box", width: "fill_container", height: 36, padding: [0, 10], gap: 6, cornerRadius: "$radius", fill: "$color.segment-track", alignItems: "center" }, [
        icon("search", { id: "sf-icon", size: 16, fill: "$color.text-secondary" }),
        text("Search...", { id: "sf-text", width: "fill_container", fill: "$color.text-secondary", fontSize: 17 }),
        icon("circle-x", { id: "sf-clear", size: 17, fill: "$color.text-muted", enabled: false }),
      ]),
    ])),

    // Inline sheet title with Cancel (glass text button, tinted textPrimary).
    component("search-bar", hstack({ width: "fill_container", height: 56, padding: [0, 16], alignItems: "center" }, [
      hstack({ id: "sbar-left", width: "fill_container", alignItems: "center" }, [
        hstack({
          id: "sbar-cancel", height: 40, padding: [0, 14], cornerRadius: 20, fill: "$color.glass", stroke: "$color.glass-border", strokeWidth: 0.5,
          alignItems: "center", effect: { type: "shadow", offset: { x: 0, y: 2 }, blur: 10, color: "#00000014" },
        }, [text("Cancel", { id: "sbar-cancel-label", fill: "$color.text-primary", fontSize: 17 })]),
      ]),
      text("Search", { id: "sbar-title", fill: "$color.text-primary", fontSize: 17, fontWeight: "600" }),
      frame({ id: "sbar-right", width: "fill_container", height: 1 }),
    ])),
  ];
}

// Search hits are loaded from /api/v1/stories without link metadata, so
// they have no preview image: the domain sits in the meta line.
const result = (title, author, ago, domain, likes) => vstack({ id: uid("search-hit"), width: "fill_container" }, [
  ref("story-card", { id: uid("search-story") }, {
    "sc-media": { enabled: false },
    "sc-title": { content: title },
    "sc-author": { content: author },
    "sc-ago": { content: ago },
    "sc-dot2": { enabled: true },
    "sc-domain": { enabled: true, content: domain },
    "sc-actions/ab-like-count": likes ? { content: String(likes) } : { enabled: false },
    "sc-actions/ab-comments": { enabled: false },
    "sc-comment": { enabled: false },
  }),
  hstack({ id: uid("search-div"), width: "fill_container", padding: [0, 0, 0, 16] }, [
    rect({ id: uid("search-div-line"), width: "fill_container", height: 0.5, fill: "$color.separator" }),
  ]),
]);

/** The feed pushed back behind a large sheet, on black. */
function sheetScreen(name, children) {
  const s = screen(name, {
    nav: null,
    tab: null,
    background: "#000000",
    content: [
      hstack({ id: uid("search-behind"), width: "fill_container", height: 10, padding: [0, 18] }, [
        rect({ id: uid("search-behind-card"), width: "fill_container", height: 10, cornerRadius: [12, 12, 0, 0], fill: "$color.page", opacity: 0.55 }),
      ]),
      vstack({
        id: uid("search-sheet"), name: "Sheet", width: "fill_container", height: "fill_container", cornerRadius: [38, 38, 0, 0],
        fill: "$color.page", clip: true,
      }, children),
    ],
  });
  // Light status bar over the dark backdrop.
  s.children[0].descendants = {
    "sb-time": { fill: "#FFFFFF" }, "sb-signal": { fill: "#FFFFFF" }, "sb-wifi": { fill: "#FFFFFF" }, "sb-battery": { fill: "#FFFFFF" },
  };
  return s;
}

const field = (query) => ref("search-field", { id: uid("search-f") }, query
  ? { "sf-text": { content: query, fill: "$color.text-primary" }, "sf-clear": { enabled: true } }
  : undefined);

export function screens() {
  return [
    sheetScreen("Search · Results", [
      ref("search-bar", { id: uid("search-b") }),
      field("ethereum"),
      vstack({ id: uid("search-results"), width: "fill_container", height: "fill_container", clip: true, padding: [0, 0, 12, 0] }, [
        result("Ethereum Foundation publishes 2026 protocol roadmap", "timdaub.eth", "3h", "blog.ethereum.org", 12),
        result("Introducing zkAPI: private usage credits for any API", "mishaderidder.eth", "8h", "ethereum.org", 2),
        result("Why Ethereum's blob fees stayed low after Fusaka", "rvolz.eth", "2d", "mirror.xyz", 7),
        result("A visual guide to Ethereum's state expiry proposals", "zinkk.eth", "5d", "hackmd.io", 4),
        result("Running an Ethereum node on a Raspberry Pi in 2026", "noctis.eth", "1w", "github.com", 3),
      ]),
    ]),
    sheetScreen("Search · No results", [
      ref("search-bar", { id: uid("search-b") }),
      field("zkSNARK tutorial"),
      // EmptyState(text:systemImage: "magnifyingglass"): 34pt muted icon,
      // 17pt secondary text, 60pt vertical padding.
      vstack({ id: uid("search-empty"), width: "fill_container", padding: [60, 20], gap: 8, alignItems: "center" }, [
        icon("search", { size: 34, fill: "$color.text-muted" }),
        text("No results found for \"zkSNARK tutorial\"", { width: "fill_container", fill: "$color.text-secondary", fontSize: 17, textAlign: "center" }),
      ]),
    ]),
  ];
}
