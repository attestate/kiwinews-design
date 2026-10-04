// Onboarding (KiwiNative/Screens/OnboardingView.swift), presented as a
// full-screen cover: progress capsules + Close, then one page per step:
// welcome (terms) → wallet → one-tap actions → push → email → done. The
// wallet picker (KiwiNative/Wallet/WalletPicker.swift) is a sheet on top of
// its page, shown at its medium detent.
import { frame, vstack, hstack, text, rect, icon, ref, component, uid } from "../../lib/pen.mjs";
import { W, H } from "../components.mjs";
import { screen } from "./shell.mjs";

const STEPS = ["welcome", "wallet", "delegation", "push", "email", "done"];

const RULES = [
  "No objectionable, abusive, hateful, sexual, violent or illegal content.",
  "No harassment, ad hominem attacks, spam or shilling.",
  "Everything you post is public, signed with your key and shared across Kiwi nodes; it can't be edited.",
  "Report posts, comments and people from their \"…\" menu, or block them. We review reports within 24 hours and remove violating content and accounts.",
];

export function components() {
  return [
    // Top bar: five progress capsules (every step but "done") and Close
    // (hidden on the welcome page). Tinted with the kiwi accent.
    component("onb-header", hstack({
      width: W, height: 44, padding: [8, 20, 0, 20], justifyContent: "space_between", alignItems: "center",
    }, [
      hstack({ id: "onb-progress", gap: 4, alignItems: "center" }, STEPS.slice(0, -1).map((_, i) => rect({
        id: `onb-p${i + 1}`, width: 18, height: 4, cornerRadius: 2, fill: i === 0 ? "$color.accent" : "$color.button-background",
      }))),
      hstack({ id: "onb-close", height: 44, alignItems: "center" }, [
        text("Close", { id: "onb-close-label", fill: "$color.accent", fontSize: 17 }),
      ]),
    ])),

    // Big title (34 bold) + message (17, secondary), 8 apart.
    component("onb-heading", vstack({ width: "fill_container", gap: 8 }, [
      text("Title", { id: "onb-title", width: "fill_container", fill: "$color.text-primary", fontSize: 34, fontWeight: "700", lineHeight: 1.2 }),
      text("Message", { id: "onb-message", width: "fill_container", fill: "$color.text-secondary", fontSize: 17, lineHeight: 1.3 }),
    ])),

    // "Skip" / "Not now": full-width borderless text button in the tint.
    component("onb-skip", hstack({ width: "fill_container", height: 44, justifyContent: "center", alignItems: "center" }, [
      text("Not now", { id: "onb-skip-label", fill: "$color.accent", fontSize: 17 }),
    ])),

    // One row of the wallet list (WalletRow): 40pt icon, name, "Installed".
    component("onb-wallet-row", hstack({
      width: "fill_container", height: 60, padding: [0, 16], gap: 12, fill: "$color.surface", alignItems: "center",
    }, [
      frame({ id: "onb-wallet-icon", width: 40, height: 40, cornerRadius: 8, fill: "$color.button-background" }),
      text("MetaMask", { id: "onb-wallet-name", width: "fill_container", fill: "$color.text-primary", fontSize: 17, fontWeight: "500" }),
      text("Installed", { id: "onb-wallet-installed", fill: "$color.text-secondary", fontSize: 13 }),
    ])),
  ];
}

// MARK: Building blocks

function header(step, { close = true } = {}) {
  const index = STEPS.indexOf(step);
  const descendants = {};
  STEPS.slice(0, -1).forEach((_, i) => {
    descendants[`onb-p${i + 1}`] = { fill: i <= index ? "$color.accent" : "$color.button-background" };
  });
  if (!close) descendants["onb-close"] = { enabled: false };
  return ref("onb-header", { id: uid("onb-hdr"), ...(close ? {} : { height: 12 }) }, descendants);
}

const heading = (title, message) => ref("onb-heading", { id: uid("onb-h") }, {
  "onb-title": { content: title }, "onb-message": { content: message },
});

const symbol = (name) => frame({ id: uid("onb-sym"), padding: [0, 0, 4, 0] }, [icon(name, { size: 46, fill: "$color.accent" })]);

const green = (label) => ref("button-primary", { id: uid("onb-btn") }, { "bp-label": { content: label } });

// GreenButtonStyle while disabled (busy, or nothing typed yet).
const greenDisabled = (label) => ref("button-primary", { id: uid("onb-btn"), fill: "$color.button-background", stroke: "$color.border" }, {
  "bp-label": { content: label, fill: "$color.text-muted" },
});

const skip = (label) => ref("onb-skip", { id: uid("onb-skip") }, { "onb-skip-label": { content: label } });

function onboardingScreen(name, step, page, { close = true } = {}) {
  return screen(name, {
    nav: null,
    tab: null,
    content: [
      header(step, { close }),
      vstack({ id: uid("onb-scroll"), width: "fill_container", padding: 20, gap: 18 }, [
        vstack({ id: uid("onb-page"), width: "fill_container", gap: 16 }, page),
      ]),
    ],
  });
}

// MARK: Pages

const welcomePage = () => [
  frame({ id: uid("onb-logo"), padding: [0, 0, 8, 0] }, [ref("logo", { id: uid("onb-logo-i") })]),
  heading("Welcome to Kiwi News", "Handpicked links for builders, engineers and crypto researchers, curated and discussed by the community."),
  vstack({ id: uid("onb-rules"), width: "fill_container", gap: 10 }, [
    text("Community rules", { fill: "$color.text-primary", fontSize: 17, fontWeight: "600" }),
    ...RULES.map((rule) => hstack({ id: uid("onb-rule"), width: "fill_container", gap: 8 }, [
      text("•", { fill: "$color.text-secondary", fontSize: 15, lineHeight: 1.3 }),
      text(rule, { width: "fill_container", fill: "$color.text-secondary", fontSize: 15, lineHeight: 1.3 }),
    ])),
    hstack({ id: uid("onb-docs"), height: 44, gap: 20, alignItems: "center" }, [
      text("Terms & Guidelines", { fill: "$color.accent", fontSize: 15 }),
      text("Privacy Policy", { fill: "$color.accent", fontSize: 15 }),
    ]),
  ]),
  green("I agree, continue"),
  skip("I agree, just browse for now"),
];

const walletPage = (busy = false) => [
  symbol("wallet"),
  heading("Connect your wallet", "Your Ethereum address is your Kiwi News account. Pick your wallet; it opens, you approve, and you come right back here. Reading never needs an account."),
  busy ? greenDisabled("Waiting for your wallet…") : green("Connect wallet"),
  skip("Not now"),
];

const delegationIntro = () => [
  symbol("pointer"),
  heading("Enable one-tap actions", "So you don't have to confirm every like and comment in your wallet, Kiwi News creates a key on this iPhone. Your wallet approves it once with a free-of-value transaction on Optimism (only network fees apply). No funds are moved."),
];

// `status(...)`: spinner + title + message, while the wallet confirms.
const status = (title, message) => hstack({ id: uid("onb-status"), width: "fill_container", padding: [8, 0], gap: 12 }, [
  icon("loader", { size: 20, fill: "$color.text-secondary" }),
  vstack({ width: "fill_container", gap: 4 }, [
    text(title, { width: "fill_container", fill: "$color.text-primary", fontSize: 17, fontWeight: "600" }),
    text(message, { width: "fill_container", fill: "$color.text-secondary", fontSize: 15, lineHeight: 1.3 }),
  ]),
]);

const pushPage = () => [
  symbol("bell-dot"),
  heading("Get notified", "We'll only notify you when someone likes your story or replies to you. No marketing, and you can turn it off anytime in Settings."),
  green("Turn on notifications"),
  skip("Not now"),
];

// Color(.secondarySystemBackground) has no token; segment-track (iOS fill
// gray) is the closest themed variable.
const emailPage = () => [
  symbol("mail"),
  heading("Replies by email", "Optional: get an email when someone replies to your comments or stories."),
  hstack({ id: uid("onb-email"), width: "fill_container", height: 50, padding: [0, 16], cornerRadius: "$radius", fill: "$color.segment-track", alignItems: "center" }, [
    text("Email", { fill: "$color.text-muted", fontSize: 17 }),
  ]),
  greenDisabled("Subscribe"),
  skip("Skip"),
];

const donePage = () => [
  symbol("badge-check"),
  heading("You're all set!", "You can now like, comment and submit without confirming every action in your wallet."),
  green("Start reading"),
];

// MARK: Sheets

/** iOS 26 sheet at its medium detent: dims the page, floats inset. */
function sheetOver(base, { height, children }) {
  const dim = rect({ id: uid("onb-dim"), layoutPosition: "absolute", x: 0, y: 0, width: W, height: H, fill: "#00000040" });
  const sheet = vstack({
    id: uid("onb-sheet"), name: "Sheet", layoutPosition: "absolute", x: 8, y: H - height - 8, width: W - 16, height,
    cornerRadius: 36, fill: "$color.page", clip: true,
    effect: { type: "shadow", offset: { x: 0, y: 0 }, blur: 30, color: "#00000026" },
  }, [
    hstack({ id: uid("onb-grabber-row"), width: "fill_container", padding: [5, 0, 0, 0], justifyContent: "center" }, [
      rect({ id: uid("onb-grabber"), width: 36, height: 5, cornerRadius: 3, fill: "$color.placeholder-icon" }),
    ]),
    ...children,
  ]);
  base.children.push(dim, sheet);
  return base;
}

/** Inline sheet title with a glass text button on the left. */
function sheetBar(title, button, buttonColor) {
  return hstack({ id: uid("onb-bar"), width: "fill_container", height: 52, padding: [0, 16], alignItems: "center" }, [
    hstack({ width: "fill_container", alignItems: "center" }, [
      hstack({
        height: 40, padding: [0, 14], cornerRadius: 20, fill: "$color.glass", stroke: "$color.glass-border", strokeWidth: 0.5,
        alignItems: "center", effect: { type: "shadow", offset: { x: 0, y: 2 }, blur: 10, color: "#00000014" },
      }, [text(button, { fill: buttonColor, fontSize: 17 })]),
    ]),
    text(title, { fill: "$color.text-primary", fontSize: 17, fontWeight: "600" }),
    frame({ width: "fill_container", height: 1 }),
  ]);
}

const separator = (inset) => hstack({ id: uid("onb-sep"), width: "fill_container", padding: [0, 0, 0, inset], fill: "$color.surface" }, [
  rect({ width: "fill_container", height: 0.5, fill: "$color.separator" }),
]);

function walletPicker() {
  const wallets = [["MetaMask", true], ["Rainbow", true], ["Base", false], ["Trust Wallet", false], ["Uniswap Wallet", false]];
  const rows = [];
  wallets.forEach(([name, installed], i) => {
    if (i) rows.push(separator(68));
    rows.push(ref("onb-wallet-row", { id: uid("onb-wallet") }, {
      "onb-wallet-name": { content: name },
      "onb-wallet-installed": installed ? {} : { enabled: false },
    }));
  });
  rows.push(separator(16));
  rows.push(hstack({ id: uid("onb-qr"), width: "fill_container", height: 52, padding: [0, 16], gap: 14, fill: "$color.surface", alignItems: "center" }, [
    icon("qr-code", { size: 20, fill: "$color.text-primary" }),
    text("Wallet on another device", { fill: "$color.text-primary", fontSize: 17 }),
  ]));
  return [
    sheetBar("Connect a wallet", "Cancel", "$color.text-primary"),
    hstack({ id: uid("onb-search"), width: "fill_container", padding: [0, 16, 8, 16] }, [
      hstack({ width: "fill_container", height: 36, padding: [0, 10], gap: 6, cornerRadius: "$radius", fill: "$color.segment-track", alignItems: "center" }, [
        icon("search", { size: 16, fill: "$color.text-secondary" }),
        text("Search wallets", { fill: "$color.text-secondary", fontSize: 17 }),
      ]),
    ]),
    vstack({ id: uid("onb-wallets"), width: "fill_container" }, rows),
  ];
}

export function screens() {
  return [
    onboardingScreen("Onboarding · Welcome", "welcome", welcomePage(), { close: false }),
    onboardingScreen("Onboarding · Wallet", "wallet", walletPage()),
    sheetOver(onboardingScreen("Onboarding · Wallet picker", "wallet", walletPage(true)), { height: 500, children: walletPicker() }),
    onboardingScreen("Onboarding · One-tap actions", "delegation", [...delegationIntro(), green("Approve in wallet"), skip("Not now")]),
    onboardingScreen("Onboarding · One-tap actions (confirming)", "delegation", [
      ...delegationIntro(),
      status("Confirm in your wallet", "Approve the transaction in your wallet app, then come back."),
      skip("Not now"),
    ]),
    onboardingScreen("Onboarding · Notifications", "push", pushPage()),
    onboardingScreen("Onboarding · Email", "email", emailPage()),
    onboardingScreen("Onboarding · Done", "done", donePage()),
  ];
}
