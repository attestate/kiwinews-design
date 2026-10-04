// Reusable components of the native app, built after the SwiftUI views in
// KiwiNative/UI (StoryRow.swift, Components.swift, Theme.swift) and the iOS
// 26 system bars. Screens use them via ref(); parts have short, stable ids
// so instances can override texts and hide parts (`enabled: false`).
import path from "path";
import { fileURLToPath } from "url";
import {
  frame, vstack, hstack, text, rect, ellipse, icon, pathNode, ref, component, image, readSVG,
} from "../lib/pen.mjs";
import { type } from "./tokens.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const asset = (name) => path.join(here, "..", "..", "assets", name);
// Icons come from the app's asset catalog (a kiwinews-ios checkout next to this repo).
export const xcassets = path.join(process.env.KIWINEWS_IOS ?? path.join(here, "..", "..", "..", "kiwinews-ios"), "KiwiNews", "Assets.xcassets");
const svgIcon = (name) => readSVG(path.join(xcassets, name));

// The website's 20px Phosphor line icons (asset catalog), as paths so they
// stay editable and take the vote color.
const heart = svgIcon("IconHeart.imageset/icon-heart.svg");
const heartFill = svgIcon("IconHeartFill.imageset/icon-heart-fill.svg");
const chats = svgIcon("IconComments.imageset/icon-comments.svg");
const share = svgIcon("IconShare.imageset/icon-share.svg");
const wordmarkKiwi = readSVG(asset("wordmark-kiwi.svg"));
const wordmarkNews = readSVG(asset("wordmark-news.svg"));

/** A Phosphor line icon (256 viewBox, 16 stroke → 1.25pt at 20pt). */
function lineIcon(id, svg, color = "$color.vote-default", size = 20) {
  return pathNode(svg.geometry, {
    id, name: id, width: size, height: size, viewBox: svg.viewBox,
    stroke: color, strokeWidth: 1.25, strokeLinecap: "round", strokeLinejoin: "round",
  });
}

export const W = 393; // iPhone 16/17 Pro width in points
export const H = 852;

export function components() {
  return [
    // iOS status bar (time, signal, wifi, battery).
    component("status-bar", hstack({
      width: W, height: 54, padding: [18, 32, 0, 44], justifyContent: "space_between", alignItems: "start",
    }, [
      text("9:41", { id: "sb-time", fill: "$color.text-primary", fontSize: 17, fontWeight: "600", fontFamily: "SF Pro" }),
      hstack({ id: "sb-icons", gap: 6, alignItems: "center", padding: [3, 0, 0, 0] }, [
        icon("signal", { id: "sb-signal", size: 18 }),
        icon("wifi", { id: "sb-wifi", size: 18 }),
        icon("battery-full", { id: "sb-battery", size: 24 }),
      ]),
    ])),

    // Glass circle button in the nav bar (menu, search, back).
    component("glass-button", frame({
      width: 44, height: 44, cornerRadius: 22, fill: "$color.glass", justifyContent: "center", alignItems: "center",
      stroke: "$color.glass-border", strokeWidth: 0.5,
      effect: { type: "shadow", offset: { x: 0, y: 4 }, blur: 16, color: "#0000001A" },
    }, [icon("menu", { id: "gb-icon", size: 20 })])),

    // Kiwi icon + "kiwi" (text color, flips in dark mode) + "news" (olive).
    component("logo", hstack({ gap: 4, alignItems: "center" }, [
      rect({ id: "logo-icon", width: 29, height: 29, fill: image("./assets/kiwi-icon.png", "contain") }),
      frame({ id: "logo-wordmark", layout: "none", width: 88, height: 22 }, [
        pathNode(wordmarkKiwi.geometry, { id: "logo-kiwi", x: 0, y: 0, width: 88, height: 22, viewBox: wordmarkKiwi.viewBox, fill: "$color.text-primary" }),
        pathNode(wordmarkNews.geometry, { id: "logo-news", x: 0, y: 0, width: 88, height: 22, viewBox: wordmarkNews.viewBox, fill: "$color.wordmark-green" }),
      ]),
    ])),

    // Header: menu (left), logo (center), search (right).
    component("nav-bar", hstack({ width: W, height: 56, padding: [6, 16], justifyContent: "space_between", alignItems: "center" }, [
      ref("glass-button", { id: "nav-menu" }),
      ref("logo", { id: "nav-logo" }),
      ref("glass-button", { id: "nav-search" }, { "gb-icon": { icon: "search" } }),
    ])),

    // Back button + centered title (pushed screens: Story, Profile, Settings).
    component("nav-bar-back", hstack({ width: W, height: 56, padding: [6, 16], justifyContent: "space_between", alignItems: "center" }, [
      ref("glass-button", { id: "navb-back" }, { "gb-icon": { icon: "chevron-left" } }),
      text("Title", { id: "navb-title", fill: "$color.text-primary", ...type.navTitle }),
      frame({ id: "navb-spacer", width: 44, height: 44 }),
    ])),

    // Floating iOS 26 tab bar: Home, New, Submit, Notifications.
    component("tab-bar", hstack({
      width: 361, height: 62, padding: 4, cornerRadius: 31, fill: "$color.glass", stroke: "$color.glass-border", strokeWidth: 0.5,
      effect: { type: "shadow", offset: { x: 0, y: 8 }, blur: 24, color: "#0000001F" }, justifyContent: "space_between", alignItems: "center",
    }, [
      tabItem("tab-home", "house", "Home", true),
      tabItem("tab-new", "radio", "New"),
      tabItem("tab-submit", "square-pen", "Submit"),
      tabItem("tab-activity", "bell", "Notifications"),
    ])),

    // Segmented control (Hot / New / Best, and Best's periods) with the
    // brand's 2pt corners.
    component("segmented", hstack({
      width: "fill_container", height: 32, padding: 2, cornerRadius: "$radius", fill: "$color.segment-track", alignItems: "center",
    }, [
      segment("seg-1", "Hot", true),
      segment("seg-2", "New"),
      segment("seg-3", "Best"),
      // Best's period picker has five; enable these for it.
      { ...segment("seg-4", "Week"), enabled: false },
      { ...segment("seg-5", "Day"), enabled: false },
    ])),

    // Filled kiwi green button (Connect, Continue, Submit, Create profile).
    component("button-primary", hstack({
      width: "fill_container", height: 50, padding: [0, 20], cornerRadius: "$radius", fill: "$color.accent",
      stroke: "$color.accent", strokeWidth: 1, justifyContent: "center", alignItems: "center",
    }, [text("Continue", { id: "bp-label", fill: "$color.accent-text", fontSize: 16, fontWeight: "500" })])),

    // Compact green button (Try again, Connect to comment).
    component("button-compact", hstack({
      height: 44, padding: [0, 14], cornerRadius: "$radius", fill: "$color.accent", stroke: "$color.accent", strokeWidth: 1,
      justifyContent: "center", alignItems: "center",
    }, [text("Try again", { id: "bc-label", fill: "$color.accent-text", ...type.bodyMedium })])),

    // Outlined secondary button (social / feed buttons).
    component("button-outlined", hstack({
      height: 44, padding: [0, 14], cornerRadius: "$radius", fill: "$color.surface", stroke: "$color.text-secondary", strokeWidth: 1,
      justifyContent: "center", alignItems: "center",
    }, [text("Share", { id: "bo-label", fill: "$color.text-primary", ...type.bodyMedium })])),

    // The site's brown button ("Upload Image" on Submit).
    component("button-brown", hstack({
      height: 44, padding: [0, 16], cornerRadius: "$radius", fill: "$color.brown-button", justifyContent: "center", alignItems: "center",
    }, [text("Upload Image", { id: "bb-label", fill: "$color.brown-button-text", ...type.bodyMedium })])),

    // Square avatar with 2pt corners (circle variant: override cornerRadius).
    component("avatar", frame({
      width: 32, height: 32, cornerRadius: "$radius", fill: "$color.button-background", clip: true,
      justifyContent: "center", alignItems: "center",
    }, [icon("user", { id: "av-icon", size: 16, fill: "$color.text-muted" })])),

    // Small karma pill.
    component("pill", hstack({ padding: [2, 6], cornerRadius: "$radius", fill: "$color.button-background" }, [
      text("1,234 🥝", { id: "pill-label", fill: "$color.text-primary", fontSize: 9, fontWeight: "600" }),
    ])),

    // Placeholder for link preview images (designers drop real ones in).
    component("image-placeholder", frame({
      width: "fill_container", height: 185, fill: "$color.placeholder", justifyContent: "center", alignItems: "center",
    }, [icon("image", { id: "ip-icon", size: 32, fill: "$color.placeholder-icon" })])),

    // Domain badge on preview images.
    component("domain-badge", hstack({ height: 18, padding: [0, 4], gap: 4, cornerRadius: "$radius", fill: "$color.surface", alignItems: "center" }, [
      icon("globe", { id: "db-favicon", size: 10, fill: "$color.text-secondary" }),
      text("arstechnica.com", { id: "db-domain", fill: "$color.text-primary", ...type.caption }),
    ])),

    // Tweet / cast / Bluesky post in place of the title.
    component("embed-card", vstack({ width: "fill_container", padding: [18, 16], gap: 12, fill: "$color.embed-background" }, [
      hstack({ id: "ec-author", gap: 8, alignItems: "center" }, [
        ref("avatar", { id: "ec-avatar", width: 20, height: 20, cornerRadius: 10 }, { "av-icon": { width: 10, height: 10 } }),
        text("@SlowMist_Team", { id: "ec-name", fill: "$color.embed-text", fontSize: 14, fontWeight: "600" }),
      ]),
      text("🚨SlowMist TI Alert🚨\n\n💸 @aave v3 Loop Safe Module Loss: ~114.09 ETH\n\n🔍 Root Cause: FlashLoopAdapter's open()/close() access control only checks ISafe(msg.sender).isModuleEnabled(address(this)), which is spoofable via a fake Safe…", {
        id: "ec-text", width: "fill_container", fill: "$color.embed-text", fontSize: 15, lineHeight: 1.4,
      }),
      ref("image-placeholder", { id: "ec-image", height: 180, cornerRadius: "$radius" }),
    ])),

    // Like · comments · share · more, each centered in a quarter of the row.
    component("action-bar", hstack({ width: "fill_container", height: 48, padding: [2, 16], alignItems: "center" }, [
      hstack({ id: "ab-like", width: "fill_container", height: 44, gap: 6, justifyContent: "center", alignItems: "center" }, [
        lineIcon("ab-like-icon", heart),
        text("3", { id: "ab-like-count", fill: "$color.vote-default", ...type.small }),
      ]),
      hstack({ id: "ab-comments", width: "fill_container", height: 44, gap: 6, justifyContent: "center", alignItems: "center" }, [
        lineIcon("ab-comments-icon", chats),
        text("2", { id: "ab-comments-count", fill: "$color.vote-default", ...type.small }),
      ]),
      hstack({ id: "ab-share", width: "fill_container", height: 44, justifyContent: "center", alignItems: "center" }, [
        lineIcon("ab-share-icon", share),
      ]),
      hstack({ id: "ab-more", width: "fill_container", height: 44, justifyContent: "center", alignItems: "center" }, [
        icon("ellipsis", { id: "ab-more-icon", size: 20, fill: "$color.vote-default" }),
      ]),
    ])),

    // Last comment under a story card.
    component("comment-preview", hstack({ width: "fill_container", padding: [12, 16], gap: 10, fill: "$color.comment-strip", alignItems: "start" }, [
      ref("avatar", { id: "cp-avatar" }),
      vstack({ id: "cp-body", width: "fill_container", gap: 3 }, [
        hstack({ id: "cp-header", gap: 4, alignItems: "center" }, [
          text("timdaub.eth", { id: "cp-name", fill: "$color.text-primary", ...type.smallMedium }),
          text("• 2h ago", { id: "cp-time", fill: "$color.text-secondary", ...type.meta }),
        ]),
        text("Really cool write-up, the threat model section is worth reading in full.", {
          id: "cp-text", width: "fill_container", fill: "$color.text-primary", ...type.small, lineHeight: 1.35,
        }),
      ]),
    ])),

    // The story card (row.mjs): media, title, "by name • 5h", actions,
    // last comment. Variants via overrides: hide `sc-media`, swap it for an
    // embed-card, hide `sc-comment`.
    component("story-card", vstack({
      width: "fill_container", fill: "$color.card", stroke: "$color.card-border", strokeWidth: 1, cornerRadius: "$radius", clip: true,
    }, [
      vstack({ id: "sc-media", width: "fill_container", clip: true }, [
        ref("image-placeholder", { id: "sc-image", width: "fill_container", height: 185 }),
        ref("domain-badge", { id: "sc-domain-badge", layoutPosition: "absolute", x: 16, y: 159 }),
      ]),
      vstack({ id: "sc-text", width: "fill_container", padding: [12, 16, 0, 16], gap: 6 }, [
        text("OpenAI says planned GPT-6.1 is too insecure to release", {
          id: "sc-title", width: "fill_container", fill: "$color.text-primary", ...type.title, lineHeight: 1.3,
        }),
        hstack({ id: "sc-meta", gap: 6, alignItems: "center", opacity: 0.8 }, [
          text("by", { id: "sc-by", fill: "$color.text-secondary", ...type.meta }),
          text("mishaderidder.eth", { id: "sc-author", fill: "$color.text-primary", ...type.meta, fontWeight: "600" }),
          text("•", { id: "sc-dot1", fill: "$color.text-secondary", ...type.meta }),
          text("5h", { id: "sc-ago", fill: "$color.text-secondary", ...type.meta }),
          text("•", { id: "sc-dot2", fill: "$color.text-secondary", ...type.meta, enabled: false }),
          text("ethereum.org", { id: "sc-domain", fill: "$color.text-secondary", ...type.meta, enabled: false }),
        ]),
      ]),
      ref("action-bar", { id: "sc-actions" }),
      ref("comment-preview", { id: "sc-comment" }),
    ])),
  ];
}

function tabItem(id, iconName, label, selected = false) {
  return vstack({
    id, width: "fill_container", height: 54, gap: 2, cornerRadius: 27, justifyContent: "center", alignItems: "center",
    fill: selected ? "$color.tab-selected" : "#00000000",
  }, [
    icon(iconName, { id: `${id}-icon`, size: 22, fill: "$color.text-primary" }),
    text(label, { id: `${id}-label`, fill: "$color.text-primary", fontSize: 10, fontWeight: "500" }),
  ]);
}

function segment(id, label, selected = false) {
  return hstack({
    id, width: "fill_container", height: 28, cornerRadius: "$radius", justifyContent: "center", alignItems: "center",
    fill: selected ? "$color.segment-thumb" : "#00000000",
    ...(selected ? { effect: { type: "shadow", offset: { x: 0, y: 3 }, blur: 8, color: "#0000001F" } } : {}),
  }, [text(label, { id: `${id}-label`, fill: "$color.text-primary", fontSize: 13, fontWeight: selected ? "600" : "500" })]);
}

export { ellipse };
