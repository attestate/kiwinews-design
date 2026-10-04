// Notifications tab (KiwiNative/Screens/ActivityView.swift): ActivityRow
// list (likes, comments, emoji reactions; unread rows tinted green with a
// dot) and the logged-out login prompt.
import path from "path";
import { vstack, hstack, text, rect, ellipse, pathNode, ref, component, readSVG, uid } from "../../lib/pen.mjs";
import { screen } from "./shell.mjs";
import { xcassets } from "../components.mjs";

const heartFill = readSVG(path.join(xcassets, "IconHeartFill.imageset", "icon-heart-fill.svg"));

export function components() {
  return [
    // ActivityRow: 36pt icon column, headline / comment / "2h ago", unread
    // dot; 12×16 padding; divider inset 64 from the leading edge.
    component("notif-row", vstack({ width: 393 }, [
      hstack({ id: "notif-body", width: "fill_container", padding: [12, 16], gap: 12, alignItems: "start", fill: "#00000000" }, [
        // Like: green filled heart over "+1 🥝".
        vstack({ id: "notif-icon-like", width: 36, gap: 2, alignItems: "center" }, [
          pathNode(heartFill.geometry, { id: "notif-heart", width: 26, height: 26, viewBox: heartFill.viewBox, fill: "$color.voted" }),
          text("+1 🥝", { id: "notif-plus", fill: "$color.text-secondary", fontSize: 11, fontWeight: "500" }),
        ]),
        // Comment: 32pt circle avatar.
        vstack({ id: "notif-icon-avatar", width: 36, enabled: false }, [
          ref("avatar", { id: "notif-avatar", cornerRadius: 16 }),
        ]),
        // Reaction: the emoji at 26pt.
        vstack({ id: "notif-icon-emoji", width: 36, alignItems: "center", enabled: false }, [
          text("🔥", { id: "notif-emoji", fontSize: 26, fill: "$color.text-primary" }),
        ]),
        vstack({ id: "notif-text", width: "fill_container", gap: 4 }, [
          text("timdaub.eth and 2 others liked your submission Ethereum's Fusaka upgrade is live on mainnet", {
            id: "notif-headline", width: "fill_container", fill: "$color.text-primary", fontSize: 15, lineHeight: 1.3,
          }),
          text("Agree, blob fees were the real story here.", {
            id: "notif-comment", width: "fill_container", fill: "$color.text-secondary", fontSize: 15, lineHeight: 1.3, enabled: false,
          }),
          text("2h ago", { id: "notif-time", fill: "$color.text-muted", fontSize: 13 }),
        ]),
        vstack({ id: "notif-dot-wrap", padding: [6, 0, 0, 0], enabled: false }, [
          ellipse({ id: "notif-dot", width: 8, height: 8, fill: "$color.notification-dot" }),
        ]),
      ]),
      hstack({ id: "notif-divider", width: "fill_container", padding: [0, 0, 0, 64] }, [
        rect({ id: "notif-divider-line", width: "fill_container", height: 0.5, fill: "$color.separator" }),
      ]),
    ])),
  ];
}

const unreadProps = (unread) => (unread
  ? { "notif-body": { fill: "$color.kiwi-green-light" }, "notif-dot-wrap": { enabled: true } }
  : {});

const like = (headline, ago, unread = false) => ref("notif-row", { id: uid("notif"), width: "fill_container" }, {
  "notif-headline": { content: headline },
  "notif-time": { content: `${ago} ago` },
  ...unreadProps(unread),
});

const comment = (name, title, body, ago, unread = false) => ref("notif-row", { id: uid("notif"), width: "fill_container" }, {
  "notif-icon-like": { enabled: false },
  "notif-icon-avatar": { enabled: true },
  "notif-headline": { content: `${name} commented on ${title}` },
  "notif-comment": { enabled: true, content: body },
  "notif-time": { content: `${ago} ago` },
  ...unreadProps(unread),
});

const reaction = (name, emoji, commentText, ago, unread = false) => ref("notif-row", { id: uid("notif"), width: "fill_container" }, {
  "notif-icon-like": { enabled: false },
  "notif-icon-emoji": { enabled: true },
  "notif-emoji": { content: emoji },
  "notif-headline": { content: `${name} reacted ${emoji} to your comment "${commentText}"` },
  "notif-time": { content: `${ago} ago` },
  ...unreadProps(unread),
});

export function screens() {
  return [
    screen("Notifications", {
      tab: "tab-activity",
      contentProps: { padding: [0, 0, 120, 0], gap: 0 },
      content: [
        like("mishaderidder.eth and 2 others liked your submission Ethereum's Fusaka upgrade is live on mainnet", "12m", true),
        comment("rvolz.eth", "Introducing zkAPI: private usage credits for any API", "This is basically Privacy Pass for API keys, love it. Any plans for an x402 integration?", "38m", true),
        reaction("mishaderidder.eth", "🔥", "The threat model section is worth reading in full.", "1h", true),
        like("rvolz.eth liked your submission Vitalik: a simple L2 security and finality roadmap", "3h"),
        comment("mishaderidder.eth", "Base sequencer outage postmortem", "Good thread. Forced inclusion via L1 worked exactly as designed.", "5h"),
        reaction("rvolz.eth", "😂", "We're one blob away from a fee market.", "9h"),
        like("0xC0B3…3D80 and 5 others liked your submission Introducing the Larva Labs Catalog", "1d"),
      ],
    }),
    screen("Notifications · Logged out", {
      tab: "tab-activity",
      contentProps: { padding: [0, 32, 86, 32], gap: 20, justifyContent: "center", alignItems: "center" },
      content: [
        ref("logo", { id: uid("logo") }),
        text("Log in to see notifications when people like your stories or reply to you.", {
          id: uid("prompt"), width: "fill_container", fill: "$color.text-secondary", fontSize: 15, lineHeight: 1.35, textAlign: "center",
        }),
        ref("button-primary", { id: uid("login"), width: 280 }, { "bp-label": { content: "Log in" } }),
      ],
    }),
  ];
}
