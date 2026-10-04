// Settings (KiwiNative/Screens/SettingsView.swift): an inset-grouped Form
// on the white page (Theme.surface) with beige rows (Theme.card), logged in.
import { vstack, hstack, frame, text, rect, ref, component, uid } from "../../lib/pen.mjs";
import { screen } from "./shell.mjs";

const ROW = { fontSize: 15 }; // RootView sets .font(.kiwi(15)) for the whole app.

export function components() {
  return [
    // One Form row: label, optional value / trailing control, 44pt high.
    component("settings-row", hstack({
      width: 361, height: 44, padding: [0, 16], gap: 8, justifyContent: "space_between", alignItems: "center",
    }, [
      text("Label", { id: "sr-label", fill: "$color.text-primary", ...ROW }),
      text("Value", { id: "sr-value", fill: "$color.text-secondary", ...ROW, enabled: false }),
    ])),

    // iOS 26 switch (64×28 track, 38×24 knob); on = kiwi green.
    component("toggle", frame({
      width: 64, height: 28, cornerRadius: 14, fill: "$color.accent", padding: 2, justifyContent: "end", alignItems: "center",
    }, [
      rect({ id: "toggle-knob", width: 38, height: 24, cornerRadius: 12, fill: "#FFFFFF",
        effect: { type: "shadow", offset: { x: 0, y: 2 }, blur: 6, color: "#00000026" } }),
    ])),
  ];
}

const separator = () => hstack({ id: uid("sep"), width: "fill_container", padding: [0, 0, 0, 16] }, [
  rect({ id: uid("sep-line"), width: "fill_container", height: 0.5, fill: "$color.separator" }),
]);

/** A row; `value` shows a trailing secondary text, `color` tints the label. */
const row = (label, { value, color, trailing } = {}) => {
  const descendants = { "sr-label": { content: label, ...(color ? { fill: color } : {}) } };
  if (value) descendants["sr-value"] = { enabled: true, content: value };
  if (trailing) descendants["sr-value"] = trailing;
  return ref("settings-row", { id: uid("srow"), width: "fill_container" }, descendants);
};

/** A section: optional header, rows on a rounded beige card, optional footer. */
const section = (header, rows, footer) => vstack({ id: uid("section"), width: "fill_container", gap: 0 }, [
  ...(header ? [hstack({ id: uid("sh-wrap"), width: "fill_container", padding: [0, 16, 7, 16] }, [
    text(header.toUpperCase(), { id: uid("sh"), fill: "$color.text-secondary", fontSize: 13 }),
  ])] : []),
  vstack({ id: uid("card"), width: "fill_container", fill: "$color.card", cornerRadius: "$radius", clip: true },
    rows.flatMap((r, i) => (i === 0 ? [r] : [separator(), r]))),
  ...(footer ? [hstack({ id: uid("sf-wrap"), width: "fill_container", padding: [7, 16, 0, 16] }, [
    text(footer, { id: uid("sf"), width: "fill_container", fill: "$color.text-secondary", fontSize: 13, lineHeight: 1.3 }),
  ])] : []),
]);

const textField = (placeholder, button) => hstack({
  id: uid("field"), width: "fill_container", height: 44, padding: [0, 16], gap: 8, justifyContent: "space_between", alignItems: "center",
}, [
  text(placeholder, { id: uid("ph"), fill: "$color.text-muted", ...ROW }),
  ...(button ? [text(button, { id: uid("btn"), fill: "$color.text-muted", ...ROW })] : []),
]);

export function screens() {
  return [
    screen("Settings", {
      nav: { back: "Settings" },
      tab: "tab-home",
      background: "$color.surface",
      height: 1620,
      contentProps: { padding: [12, 16, 120, 16], gap: 30 },
      content: [
        section("Account", [
          row("Logged in as", { value: "0x5D1C…3D80" }),
          row("Create .kiwinews.eth profile"),
          row("Log out", { color: "$color.alert" }),
        ]),
        section("Muted words", [
          row("airdrop"),
          row("memecoin"),
          textField("Add a word", "Add"),
        ], "Stories and comments containing these words are hidden on this device."),
        section("Blocked users", [
          row("0xA1b2…9F3c"),
        ], "Swipe left to unblock."),
        section("Hidden posts", [
          row("Show hidden posts again"),
        ]),
        section("Notifications", [
          row("Open notification settings"),
          textField("Enter your email"),
          row("Subscribe", { color: "$color.text-muted" }),
        ], "Get an email when someone replies to your comments or stories."),
        section("Privacy", [
          row("Share usage analytics", { trailing: { id: uid("toggle"), type: "ref", ref: "toggle" } }),
        ], "Anonymous usage data (screens viewed, likes, comments) helps us improve Kiwi News. Once you're logged in it's linked to your address. No ads, no cross-app tracking."),
        section("About", [
          row("Guidelines"),
          row("Privacy Policy"),
          row("Terms of Use"),
          row("Contact"),
          row("Version", { value: "1.4.0" }),
        ]),
        section(null, [
          row("Delete account", { color: "$color.alert" }),
        ], "Your wallet itself isn't affected."),
      ],
    }),
  ];
}
