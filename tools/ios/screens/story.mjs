// The story page (KiwiNative/Screens/StoryDetailView.swift): the story card
// as header (StoryRow with opensStoryOnTap: false: no comments button, no
// comment preview, a text post's text inside the card), "Recommended by"
// curators, comment boxes with reactions, and the composer pinned above
// the tab bar (logged in).
import { frame, vstack, hstack, text, ellipse, icon, ref, component, uid } from "../../lib/pen.mjs";
import { type } from "../tokens.mjs";
import { screen } from "./shell.mjs";

const TAB_TOP = 62 + 24; // the floating tab bar's top, from the bottom edge
const COMPOSER = 58; // 6 + 44 + 4 + divider

export function components() {
  return [
    // A reaction chip (StoryReactionBar.chip): emoji, up to 3 reactor
    // avatars (16pt circles overlapping by 6), count when > 1. 2pt corners
    // like every other button, hoverMinimal fill, kiwiGreenLight when it's
    // your reaction.
    component("reaction-chip", hstack({
      height: 40, padding: [6, 12], gap: 6, cornerRadius: "$radius", fill: "$color.hover-minimal", alignItems: "center",
    }, [
      text("🔥", { id: "rc-emoji", fill: "$color.text-primary", fontSize: 16 }),
      frame({ id: "rc-avatars", layout: "none", width: 36, height: 16 }, [
        reactor("rc-av1", 0), reactor("rc-av2", 10), reactor("rc-av3", 20),
      ]),
      text("3", { id: "rc-count", fill: "$color.text-secondary", ...type.smallMedium }),
    ])),

    // The "+" that opens the emoji strip (48 × 40).
    component("reaction-add", hstack({
      width: 48, height: 40, cornerRadius: "$radius", fill: "$color.hover-minimal", justifyContent: "center", alignItems: "center",
    }, [icon("plus", { id: "ra-icon", size: 18, fill: "$color.text-muted", strokeWidth: 2.25 })])),

    // StoryCommentCard: white box, brown hairline, 12pt padding, 10pt gaps.
    // Header: 32pt avatar (bordered), name (contrast, ≤12 chars + "..."),
    // "• 2h ago", "…" menu. Body: 16pt with 3pt line spacing; quotes get a
    // 3pt separator bar. Reactions: chips + "+" (hidden on your own
    // comment or once you reacted).
    component("comment", vstack({
      width: "fill_container", padding: 12, gap: 10, fill: "$color.surface", stroke: "$color.border", strokeWidth: 1, cornerRadius: "$radius",
    }, [
      hstack({ id: "cm-header", width: "fill_container", gap: 12, alignItems: "center" }, [
        ref("avatar", { id: "cm-avatar", stroke: "$color.border", strokeWidth: 1 }),
        hstack({ id: "cm-meta", width: "fill_container", gap: 4, alignItems: "center" }, [
          text("timdaub.eth", { id: "cm-name", fill: "$color.contrast", ...type.smallMedium }),
          text("•", { id: "cm-dot", fill: "$color.text-secondary", ...type.small }),
          text("2h ago", { id: "cm-time", fill: "$color.text-secondary", ...type.small }),
        ]),
        hstack({ id: "cm-more", width: 32, height: 32, justifyContent: "end", alignItems: "center" }, [
          icon("ellipsis", { id: "cm-more-icon", size: 18, fill: "$color.text-secondary" }),
        ]),
      ]),
      vstack({ id: "cm-body", width: "fill_container", gap: 8 }, [
        hstack({ id: "cm-quote", width: "fill_container", enabled: false }, [
          frame({ id: "cm-quote-bar", width: 3, height: "fill_container", fill: "$color.separator" }),
          vstack({ id: "cm-quote-pad", width: "fill_container", padding: [10, 10, 10, 7] }, [
            text("Quoted text", { id: "cm-quote-text", width: "fill_container", fill: "$color.text-secondary", fontSize: 16, lineHeight: 1.4 }),
          ]),
        ]),
        text("Really cool write-up, the threat model section is worth reading in full.", {
          id: "cm-text", width: "fill_container", fill: "$color.text-primary", fontSize: 16, lineHeight: 1.4,
        }),
      ]),
      hstack({ id: "cm-reactions", width: "fill_container", gap: 6, alignItems: "center" }, [
        ref("reaction-chip", { id: "cm-r1" }),
        ref("reaction-chip", { id: "cm-r2", enabled: false }),
        ref("reaction-add", { id: "cm-add" }),
      ]),
    ])),

    // Messages-style composer (safeAreaInset above the tab bar): .bar
    // background with a top divider, 17pt field with a separator
    // hairline, and arrow.up.circle.fill (gray until there's text, then
    // brown).
    component("composer", vstack({ width: 393, fill: "$color.glass" }, [
      frame({ id: "cmp-divider", width: "fill_container", height: 0.5, fill: "$color.separator" }),
      hstack({ id: "cmp-row", width: "fill_container", padding: [6, 12, 4, 12], gap: 8, alignItems: "end" }, [
        hstack({
          id: "cmp-field", width: "fill_container", height: 38, padding: [8, 14], cornerRadius: "$radius", fill: "$color.surface",
          stroke: "$color.separator", strokeWidth: 1, alignItems: "center",
        }, [text("Post your reply", { id: "cmp-text", width: "fill_container", fill: "$color.text-muted", fontSize: 17 })]),
        frame({ id: "cmp-send", width: 44, height: 44, justifyContent: "center", alignItems: "center" }, [
          frame({ id: "cmp-send-circle", width: 28, height: 28, cornerRadius: 14, fill: "$color.separator", justifyContent: "center", alignItems: "center" }, [
            icon("arrow-up", { id: "cmp-send-arrow", size: 18, fill: "$color.surface", strokeWidth: 3 }),
          ]),
        ]),
      ]),
    ])),
  ];
}

function reactor(id, x) {
  return ref("avatar", {
    id, x, y: 0, width: 16, height: 16, cornerRadius: 8, stroke: "$color.surface", strokeWidth: 1,
  }, { "av-icon": { width: 8, height: 8 } });
}

// MARK: Sample data

/** One comment. reactions: [{emoji, count, avatars, mine}]; add: show "+". */
function comment({ name, ago, body, quote, reactions = [], add = true }) {
  const short = name.length > 12 ? name.slice(0, 12) + "..." : name;
  const chip = (key, r) => r
    ? {
      [key]: { enabled: true, ...(r.mine ? { fill: "$color.kiwi-green-light" } : {}) },
      [`${key}/rc-emoji`]: { content: r.emoji },
      [`${key}/rc-avatars`]: { width: 16 + 10 * (Math.min(r.avatars ?? r.count, 3) - 1) },
      [`${key}/rc-av2`]: { enabled: (r.avatars ?? r.count) >= 2 },
      [`${key}/rc-av3`]: { enabled: (r.avatars ?? r.count) >= 3 },
      [`${key}/rc-count`]: r.count > 1 ? { content: String(r.count) } : { enabled: false },
    }
    : { [key]: { enabled: false } };
  return ref("comment", { id: uid("comment") }, {
    "cm-name": { content: short },
    "cm-time": { content: `${ago} ago` },
    "cm-text": { content: body },
    ...(quote ? { "cm-quote": { enabled: true }, "cm-quote-text": { content: quote } } : {}),
    ...chip("cm-r1", reactions[0]),
    ...chip("cm-r2", reactions[1]),
    "cm-add": { enabled: add },
    ...(reactions.length === 0 && !add ? { "cm-reactions": { enabled: false } } : {}),
  });
}

/**
 * "Recommended by N curators" + wrapping chips (20pt avatar, contrast name).
 * rows: the chips per line (the app's flow layout wraps them).
 */
function curators(rows) {
  const names = rows.flat();
  const chip = (name) => hstack({
    id: uid("curator"), padding: [4, 8], gap: 6, cornerRadius: "$radius", fill: "$color.surface",
    stroke: "$color.border", strokeWidth: 1, alignItems: "center",
  }, [
    ref("avatar", { id: uid("curator-av"), width: 20, height: 20 }, { "av-icon": { width: 10, height: 10 } }),
    text(name, { id: uid("curator-name"), fill: "$color.contrast", ...type.meta }),
  ]);
  return vstack({ id: uid("curators"), width: "fill_container", gap: 8 }, [
    text(`Recommended by ${names.length} ${names.length === 1 ? "curator" : "curators"}`, {
      id: uid("curators-label"), fill: "$color.text-secondary", fontSize: 10, fontWeight: "500",
    }),
    vstack({ id: uid("curators-chips"), width: "fill_container", gap: 6 }, rows.map((row) => (
      hstack({ id: uid("curators-row"), gap: 6 }, row.map(chip))
    ))),
  ]);
}

// The detail header hides the comments button (it is the comments page).
const header = {
  "sc-actions/ab-comments": { enabled: false },
  "sc-comment": { enabled: false },
};

const linkStory = () => ref("story-card", { id: uid("story") }, {
  "sc-title": { content: "Vitalik: a roadmap for making Ethereum's L1 quantum resistant" },
  "sc-author": { content: "rvolz.eth" },
  "sc-ago": { content: "6h" },
  "sc-domain-badge/db-domain": { content: "vitalik.eth.limo" },
  "sc-actions/ab-like-count": { content: "7" },
  ...header,
});

// Text posts: no media, the text sits between the meta line and the
// actions (13pt, 8pt line spacing, 85% primary, 20pt sides). The action
// bar is swapped for a stack holding the text and a fresh action bar.
const textStory = () => ref("story-card", { id: uid("story") }, {
  "sc-media": { enabled: false },
  "sc-title": { content: "Ask Kiwi: what's your stack for running an Ethereum node at home in 2026?" },
  "sc-author": { content: "mishaderidder.eth" },
  "sc-ago": { content: "3h" },
  ...header,
  "sc-actions": {
    type: "frame", id: uid("text-post"), layout: "vertical", width: "fill_container",
    children: [
      vstack({ id: uid("post-text-pad"), width: "fill_container", padding: [12, 20, 0, 20] }, [text(
        "I've been running Nethermind + Lighthouse on a NUC for two years and the disk is filling up again. " +
          "Thinking about moving to Reth with history expiry now that EIP-4444 shipped.\n\n" +
          "What hardware are you using, and do you still bother with a full archive node?",
        { id: uid("post-text"), width: "fill_container", fill: "$color.text-primary", opacity: 0.85, fontSize: 13, lineHeight: 1.85 },
      )]),
      ref("action-bar", { id: uid("post-actions") }, {
        "ab-like-count": { content: "4" },
        "ab-comments": { enabled: false },
      }),
    ],
  },
});

const linkComments = () => [
  comment({
    name: "timdaub.eth", ago: "5h",
    body: "The part about hash-based signatures for the beacon chain is the most concrete plan I've seen so far. Curious how big the aggregate proofs get.",
    reactions: [{ emoji: "🔥", count: 3 }, { emoji: "🥝", count: 1, mine: true }], add: false,
  }),
  comment({
    name: "mishaderidder.eth", ago: "4h",
    quote: "Curious how big the aggregate proofs get.",
    body: "There's a section on that further down: a few hundred kB per slot with STARK aggregation, so it's fine for full nodes.",
    reactions: [{ emoji: "💯", count: 2 }],
  }),
  comment({
    name: "rvolz.eth", ago: "2h",
    body: "Good timing with the Glamsterdam discussions, this should be on the agenda.",
    reactions: [], add: true,
  }),
  comment({
    name: "0xC0B3…3D80", ago: "45m",
    body: "Bookmarked. Does anyone have the ethresear.ch thread this is based on?",
    reactions: [{ emoji: "👀", count: 1 }],
  }),
];

const textComments = () => [
  comment({
    name: "rvolz.eth", ago: "2h",
    body: "Reth on a 4 TB NVMe here, pruned. Archive only makes sense if you run an indexer, otherwise just use a provider for old state.",
    reactions: [{ emoji: "🙏", count: 2 }],
  }),
  comment({
    name: "timdaub.eth", ago: "1h",
    body: "Same setup as you, but I switched the NUC for a Rock 5B with an SSD. Draws 8 W and has been fine for six months.",
    reactions: [{ emoji: "🤯", count: 1 }], add: false,
  }),
  comment({
    name: "jessepollak.eth", ago: "20m",
    body: "Running Nimbus on a Pi 5 for the CL, works great.",
    reactions: [], add: true,
  }),
];

function storyScreen(name, content, height) {
  const s = screen(name, {
    nav: null, tab: "tab-home", height,
    content,
    contentProps: { padding: [12, 11, TAB_TOP + COMPOSER + 24, 11], gap: 16 },
  });
  // Pushed screen: system back button, logo centered, search on the right.
  s.children.splice(1, 0, ref("nav-bar", { id: uid("nav") }, {
    "nav-menu/gb-icon": { icon: "chevron-left" },
  }));
  // The composer sits above the floating tab bar.
  s.children.splice(s.children.length - 1, 0, ref("composer", {
    id: uid("composer"), layoutPosition: "absolute", x: 0, y: height - TAB_TOP - 8 - COMPOSER,
  }));
  return s;
}

export function screens() {
  return [
    storyScreen("Story", [linkStory(), curators([["timdaub.eth", "mishaderidder.eth"], ["0xC0B3…3D80", "jessepollak.eth"]]), ...linkComments()], 1520),
    storyScreen("Story · Text post", [textStory(), curators([["rvolz.eth", "timdaub.eth"]]), ...textComments()], 1240),
  ];
}

