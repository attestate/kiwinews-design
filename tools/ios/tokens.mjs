// Design tokens of the native app, from KiwiNative/Core/Theme.swift (which
// mirrors kiwistand's news.css). Colors switch with the "mode" theme axis.
import { themed, rgba } from "../lib/pen.mjs";

export const themes = { mode: ["light", "dark"] };

export const variables = {
  // Type
  "font.family": { type: "string", value: "Inter" },

  // Backgrounds
  "color.page": themed("#FFFFFA", "#1E1E1E"),
  "color.background0": themed("#F6F6EF", "#1A1A1A"),
  "color.card": themed("#F6F6EF", "#242424"),
  "color.surface": themed("#FFFFFF", "#2A2A2A"),
  "color.comment-strip": themed(rgba(166, 110, 78, 0.06), rgba(200, 160, 120, 0.08)),
  "color.button-background": themed(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.12)),
  "color.hover-minimal": themed(rgba(0, 0, 0, 0.02), rgba(255, 255, 255, 0.02)),
  "color.embed-background": themed("#FFFFFF", "#222222"),
  "color.header-beige": themed("#FAFAFA", "#252525"),

  // Text
  "color.text-primary": themed("#000000", "#F5F5F5"),
  "color.text-secondary": themed("#828282", "#D0D0D0"),
  "color.text-tertiary": themed("#666666", "#C0C0C0"),
  "color.text-muted": themed("#888888", "#B0B0B0"),
  "color.contrast": themed(rgba(166, 110, 78, 0.75), rgba(200, 160, 120, 0.6)),
  "color.embed-text": themed("#12212B", "#E0E0E0"),

  // Borders
  "color.border": themed(rgba(166, 110, 78, 0.15), rgba(200, 160, 120, 0.2)),
  "color.border-thin": themed(rgba(166, 110, 78, 0.1), rgba(200, 160, 120, 0.15)),
  "color.card-border": themed(rgba(166, 110, 78, 0.3), rgba(200, 160, 120, 0.3)),
  "color.separator": themed(rgba(60, 60, 67, 0.29), rgba(84, 84, 88, 0.6)),

  // Accents
  "color.accent": { type: "color", value: "#AFC046" },
  "color.accent-text": { type: "color", value: "#000000" },
  "color.kiwi-green-light": themed(rgba(175, 192, 70, 0.1), rgba(175, 192, 70, 0.15)),
  "color.wordmark-green": { type: "color", value: "#A6B052" },
  "color.voted": { type: "color", value: "#A6B052" },
  "color.vote-default": themed("#536471", "#A0B4C8"),
  "color.brown-button": themed("#8B6F47", "#A89968"),
  "color.brown-button-text": { type: "color", value: "#F5F5F5" },
  "color.fresh": { type: "color", value: rgba(0, 186, 124, 0.15) },
  "color.notification-dot": themed("#3DC617", "#5EE432"),
  "color.alert": themed("#FF0000", "#FF6B6B"),
  "color.link": themed("#007BFF", "#4DABF7"),
  "color.farcaster": themed("#7C65C1", "#B8A8E8"),

  // iOS chrome (iOS 26 "Liquid Glass" bars, segmented controls)
  "color.glass": themed(rgba(255, 255, 255, 0.82), rgba(40, 40, 40, 0.82)),
  "color.glass-border": themed(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1)),
  "color.tab-selected": themed(rgba(0, 0, 0, 0.07), rgba(255, 255, 255, 0.12)),
  "color.segment-track": themed(rgba(118, 118, 128, 0.12), rgba(118, 118, 128, 0.24)),
  "color.segment-thumb": themed("#FFFFFF", "#636366"),
  "color.placeholder": themed("#E9E7DD", "#333333"),
  "color.placeholder-icon": themed(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.3)),

  // Shape and spacing
  "radius": { type: "number", value: 2 },
  "radius.modal": { type: "number", value: 8 },
  "space.feed-side": { type: "number", value: 11 },
  "space.card-side": { type: "number", value: 16 },
  "space.feed-gap": { type: "number", value: 20 },
};

/** Text styles used across the app (font sizes from the Swift views). */
export const type = {
  title: { fontSize: 16, fontWeight: "500" },
  body: { fontSize: 15, fontWeight: "400" },
  bodyMedium: { fontSize: 15, fontWeight: "500" },
  small: { fontSize: 13, fontWeight: "400" },
  smallMedium: { fontSize: 13, fontWeight: "500" },
  meta: { fontSize: 12, fontWeight: "400" },
  caption: { fontSize: 10, fontWeight: "400" },
  heading: { fontSize: 22, fontWeight: "700" },
  navTitle: { fontSize: 17, fontWeight: "600" },
};
