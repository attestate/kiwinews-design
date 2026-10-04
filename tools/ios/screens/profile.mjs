// Profile (KiwiNative/Screens/ProfileView.swift): header (avatar,
// "name (karma 🥝)", Rank / Karma / Submissions, bio, social buttons), the
// Submissions / Top picker and numbered submission rows.
import { vstack, hstack, text, rect, ref, component, uid } from "../../lib/pen.mjs";
import { screen } from "./shell.mjs";

export function components() {
  return [
    // ProfileSocialButton: .bordered, .controlSize(.small), with the brand's 2pt
    // corners instead of the iOS 26 capsule.
    component("profile-social", hstack({
      height: 28, padding: [0, 12], cornerRadius: "$radius", fill: "$color.button-background", justifyContent: "center", alignItems: "center",
    }, [text("Website", { id: "ps-label", fill: "$color.text-primary", fontSize: 15, fontWeight: "500" })])),

    // ProfileSubmissionRow: "1. Title (domain)" + "N points | 3d ago",
    // 10pt vertical padding, full-width divider.
    component("profile-row", vstack({ width: 361 }, [
      vstack({ id: "pr-body", width: "fill_container", padding: [10, 0], gap: 4 }, [
        hstack({ id: "pr-title-row", width: "fill_container", gap: 4, alignItems: "start" }, [
          text("1.", { id: "pr-number", fill: "$color.text-secondary", fontSize: 15, lineHeight: 1.3 }),
          text("Ethereum's Fusaka upgrade is live on mainnet (blog.ethereum.org)", {
            id: "pr-title", width: "fill_container", fill: "$color.text-primary", fontSize: 15, lineHeight: 1.3,
          }),
        ]),
        text("12 points | 3d ago", { id: "pr-meta", fill: "$color.text-secondary", fontSize: 13 }),
      ]),
      rect({ id: "pr-divider", width: "fill_container", height: 0.5, fill: "$color.separator" }),
    ])),
  ];
}

const stat = (label, value) => hstack({ id: uid("stat"), alignItems: "center" }, [
  text(`${label}: `, { id: uid("stat-l"), fill: "$color.text-secondary", fontSize: 15 }),
  text(value, { id: uid("stat-v"), fill: "$color.text-primary", fontSize: 15, fontWeight: "600" }),
]);

const row = (n, title, domain, points, ago) => ref("profile-row", { id: uid("prow"), width: "fill_container" }, {
  "pr-number": { content: `${n}.` },
  "pr-title": { content: domain ? `${title} (${domain})` : title },
  "pr-meta": { content: `${points} ${points === 1 ? "point" : "points"} | ${ago} ago` },
});

// Native segmented picker with two segments.
const picker = () => ref("segmented", { id: uid("seg") }, {
  "seg-1-label": { content: "Submissions" },
  "seg-2-label": { content: "Top" },
  "seg-3": { enabled: false },
});

/** Puts a glass button (gear or ellipsis) where nav-bar-back has its spacer. */
export function withTrailing(page, iconName) {
  const nav = page.children[1];
  nav.descendants = {
    ...nav.descendants,
    "navb-spacer": { id: uid("trailing"), type: "ref", ref: "glass-button", descendants: { "gb-icon": { icon: iconName } } },
  };
  return page;
}

export function screens() {
  return [
    // Own profile: gear → Settings (someone else's: ellipsis → Report / Block).
    withTrailing(screen("Profile", {
      nav: { back: "timdaub.eth" },
      tab: "tab-home",
      contentProps: { padding: [16, 16, 120, 16], gap: 16 },
      content: [
        vstack({ id: uid("header"), width: "fill_container", gap: 12 }, [
          hstack({ id: uid("name-row"), gap: 10, alignItems: "center" }, [
            ref("avatar", { id: uid("avatar"), width: 44, height: 44, cornerRadius: 22 }, { "av-icon": { width: 22, height: 22 } }),
            text("timdaub.eth (12,483 🥝)", { id: uid("name"), fill: "$color.text-primary", fontSize: 17, fontWeight: "600" }),
          ]),
          hstack({ id: uid("stats"), gap: 20 }, [stat("Rank", "#2"), stat("Karma", "12483"), stat("Submissions", "1204")]),
          text("Building Kiwi News, a crypto-native Hacker News. Previously rugpull.index, Neume.", {
            id: uid("bio"), width: "fill_container", fill: "$color.text-secondary", fontSize: 15, lineHeight: 1.35,
          }),
          hstack({ id: uid("links"), gap: 8 }, ["Website", "X", "GitHub", "Farcaster"].map((label) =>
            ref("profile-social", { id: uid("social") }, { "ps-label": { content: label } }))),
        ]),
        picker(),
        vstack({ id: uid("rows"), width: "fill_container" }, [
          row(1, "Ethereum's Fusaka upgrade is live on mainnet", "blog.ethereum.org", 14, "3h"),
          row(2, "Introducing zkAPI: private usage credits for any API", "ethereum.org", 9, "1d"),
          row(3, "Vitalik: a simple L2 security and finality roadmap", "vitalik.eth.limo", 22, "2d"),
          row(4, "Base sequencer outage postmortem", "base.mirror.xyz", 6, "4d"),
          row(5, "Uniswap v4 hooks: one year in", "blog.uniswap.org", 11, "6d"),
          row(6, "Show KN: Kiwi News is now a native iOS app", null, 31, "8d"),
          row(7, "The Farcaster protocol after Merkle", "paragraph.xyz", 4, "12d"),
        ]),
      ],
    }), "settings"),
  ];
}
