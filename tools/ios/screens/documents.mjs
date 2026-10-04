// Native document pages (KiwiNative/Screens/Documents.swift): Guidelines
// and Privacy Policy, pushed from Settings/Menu with a large title.
// Settings' "Terms of Use" opens GuidelinesView too; onboarding's "Terms &
// Guidelines" shows it in a sheet with Done, drawn as the third screen.
// Text is copied from the Swift (first sections only; the page scrolls).
import { frame, vstack, hstack, text, rect, ref, component, uid } from "../../lib/pen.mjs";
import { screen } from "./shell.mjs";

export function components() {
  return [
    // DocBulletRow: secondary marker (min 14 wide), 8 apart, 17pt text.
    component("doc-bullet", hstack({ width: "fill_container", gap: 8 }, [
      text("•", { id: "doc-bullet-marker", width: 14, fill: "$color.text-secondary", fontSize: 17, lineHeight: 1.3 }),
      text("Item", { id: "doc-bullet-text", width: "fill_container", fill: "$color.text-primary", fontSize: 17, lineHeight: 1.3 }),
    ])),
  ];
}

// MARK: Blocks (DocBlockView / DocSectionView)

const para = (content) => text(content, { width: "fill_container", fill: "$color.text-primary", fontSize: 17, lineHeight: 1.3 });
const docNote = (content) => text(content, { width: "fill_container", fill: "$color.text-secondary", fontSize: 13, lineHeight: 1.3 });
const bullets = (items, gap = 8) => vstack({ id: uid("doc-list"), width: "fill_container", gap }, items.map((item) =>
  ref("doc-bullet", { id: uid("doc-b") }, { "doc-bullet-text": { content: item } })));

const HEADINGS = {
  part: (h) => frame({ id: uid("doc-h"), width: "fill_container", padding: [8, 0, 0, 0] }, [
    text(h, { width: "fill_container", fill: "$color.text-primary", fontSize: 22, fontWeight: "700" }),
  ]),
  section: (h) => frame({ id: uid("doc-h"), width: "fill_container", padding: [4, 0, 0, 0] }, [
    text(h, { width: "fill_container", fill: "$color.text-primary", fontSize: 20, fontWeight: "600" }),
  ]),
  subsection: (h) => text(h, { width: "fill_container", fill: "$color.text-primary", fontSize: 17, fontWeight: "600" }),
};

const section = (heading, level, blocks) => vstack({ id: uid("doc-sec"), width: "fill_container", gap: 10 }, [
  ...(heading ? [HEADINGS[level](heading)] : []),
  ...blocks,
]);

/** Large title + DocPage (20pt sides, 8 top, sections 20 apart). */
const page = (title, sections) => [
  hstack({ id: uid("doc-title"), width: "fill_container", padding: [4, 16, 8, 16] }, [
    text(title, { fill: "$color.text-primary", fontSize: 34, fontWeight: "700" }),
  ]),
  vstack({ id: uid("doc-page"), width: "fill_container", padding: [8, 20, 32, 20], gap: 20 }, sections),
];

// MARK: Content

const RULES = [
  "No objectionable, abusive, hateful, sexual, violent or illegal content.",
  "No harassment, ad hominem attacks, spam or shilling.",
  "Everything you post is public, signed with your key and shared across Kiwi nodes; it can't be edited.",
  "Report posts, comments and people from their \"…\" menu, or block them. We review reports within 24 hours and remove violating content and accounts.",
];

// Markdown links take the tint (Theme.tint = textPrimary when pushed,
// the kiwi accent inside onboarding's sheet).
const contact = (linkColor) => hstack({ id: uid("doc-contact"), width: "fill_container" }, [
  text("Contact: ", { fill: "$color.text-secondary", fontSize: 13 }),
  text("tim@daubenschuetz.de", { fill: linkColor, fontSize: 13 }),
]);

const guidelines = (linkColor = "$color.text-primary") => [
  section("Community rules", "part", [
    para("These are the terms you agree to when using Kiwi News:"),
    bullets(RULES),
    contact(linkColor),
  ]),
  section("Why guidelines are important", "part", [
    para("We have an opportunity to build our own corner of the onchain internet. With awesome people, links, resources, and learning. To ensure this corner is valuable, we need to follow some submission guidelines."),
  ]),
  section("What to submit?", "section", []),
  section("On topic:", "subsection", [
    para("Anything that gratifies the intellectual curiosities of builders, engineers, hackers, and craftspeople in the community."),
    para("That includes:"),
    bullets([
      "Technical resources, hacking, and awesome git repos",
      "Dune dashboards, reports, data-driven articles",
      "Startups, cryptocurrencies, cryptography",
    ]),
  ]),
];

// Bold run labels ("**Google Analytics:**") are plain text here.
const privacy = () => [
  section("Privacy Policy for Kiwi News", "part", [docNote("Last updated: 2025-03-31")]),
  section("1. Introduction", "section", [
    para("This Privacy Policy outlines how Kiwi News collects, uses, and protects your information when you use our service. We are committed to protecting your privacy in compliance with applicable data protection laws, including the General Data Protection Regulation (GDPR)."),
  ]),
  section("2. Data Controller", "section", [
    para("Kiwi News is operated by Tim Daubenschütz, who serves as the Data Controller for your personal data."),
    hstack({ id: uid("doc-contact"), width: "fill_container" }, [
      text("Contact: ", { fill: "$color.text-primary", fontSize: 17 }),
      text("tim@daubenschuetz.de", { fill: "$color.text-primary", fontSize: 17 }),
    ]),
  ]),
  section("3. Information We Collect", "section", []),
  section("3.1. Analytics Data", "subsection", [
    para("We use the following analytics services:"),
    bullets([
      "Google Analytics: We collect data such as browsing patterns, device information, and location data to analyze usage and improve our service. For details, see Google's privacy policy.",
      "PostHog: We use PostHog to track user interactions with our platform. For details, see PostHog's privacy policy.",
    ]),
  ]),
];

// MARK: Screens

function pushed(name, title, sections) {
  const s = screen(name, { nav: { back: title }, tab: null, content: page(title, sections) });
  // Large title mode: the inline title only appears once scrolled.
  s.children[1].descendants["navb-title"] = { enabled: false };
  return s;
}

/** GuidelinesView in onboarding's sheet (large detent) with Done. */
function guidelinesSheet() {
  const s = screen("Terms & Guidelines (onboarding sheet)", {
    nav: null,
    tab: null,
    background: "#000000",
    content: [
      hstack({ id: uid("doc-behind"), width: "fill_container", height: 10, padding: [0, 18] }, [
        rect({ id: uid("doc-behind-card"), width: "fill_container", height: 10, cornerRadius: [12, 12, 0, 0], fill: "$color.page", opacity: 0.55 }),
      ]),
      vstack({ id: uid("doc-sheet"), name: "Sheet", width: "fill_container", height: "fill_container", cornerRadius: [38, 38, 0, 0], fill: "$color.page", clip: true }, [
        // confirmationAction "Done": prominent glass button in the tint.
        hstack({ id: uid("doc-sheet-bar"), width: "fill_container", height: 56, padding: [0, 16], justifyContent: "end", alignItems: "center" }, [
          hstack({ height: 40, padding: [0, 16], cornerRadius: 20, fill: "$color.accent", alignItems: "center",
            effect: { type: "shadow", offset: { x: 0, y: 2 }, blur: 10, color: "#00000014" } }, [
            text("Done", { fill: "#FFFFFF", fontSize: 17, fontWeight: "600" }),
          ]),
        ]),
        ...page("Guidelines", guidelines("$color.accent")),
      ]),
    ],
  });
  s.children[0].descendants = {
    "sb-time": { fill: "#FFFFFF" }, "sb-signal": { fill: "#FFFFFF" }, "sb-wifi": { fill: "#FFFFFF" }, "sb-battery": { fill: "#FFFFFF" },
  };
  return s;
}

export function screens() {
  return [
    pushed("Guidelines", "Guidelines", guidelines()),
    pushed("Privacy Policy", "Privacy Policy", privacy()),
    guidelinesSheet(),
  ];
}
