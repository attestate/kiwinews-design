// The Submit tab (KiwiNative/Screens/SubmitView.swift), the site's /submit:
// title field with a character count, Link / Text tabs, the URL field and
// "Upload Image" (or the text editor), the kiwi green Submit button, and
// the link preview once the URL's metadata loaded.
import { frame, vstack, hstack, text, ref, component, uid } from "../../lib/pen.mjs";
import { type } from "../tokens.mjs";
import { screen } from "./shell.mjs";

const TITLE_LIMIT = 80;
const TEXT_LIMIT = 2048;

export function components() {
  return [
    // Bordered text field: surface fill, 1pt text-secondary hairline, 2pt
    // corners, 8pt padding, ≥ 44pt tall. The text is the placeholder
    // (text-muted) until filled (text-primary).
    component("text-field", hstack({
      width: "fill_container", height: 44, padding: 8, cornerRadius: "$radius", fill: "$color.surface",
      stroke: "$color.text-secondary", strokeWidth: 1, alignItems: "center", clip: true,
    }, [text("Enter or paste article URL", { id: "tf-text", width: "fill_container", fill: "$color.text-muted", fontSize: 16 })])),

    // "Link" / "Text" tab (SubmitTabButton): 15pt, 2pt underline when active.
    component("submit-tab", vstack({ height: 44, justifyContent: "end" }, [
      vstack({ id: "st-label-pad", padding: [8, 0], justifyContent: "center" }, [
        text("Link", { id: "st-label", fill: "$color.text-primary", fontSize: 15, fontWeight: "600" }),
      ]),
      frame({ id: "st-underline", width: "fill_container", height: 2, fill: "$color.text-primary" }),
    ])),

    // Link preview (SubmitPreviewCard): 2:1 image, title (15 medium, ≤ 3
    // lines), domain.
    component("submit-preview", vstack({
      width: "fill_container", fill: "$color.card", stroke: "$color.card-border", strokeWidth: 1, cornerRadius: "$radius", clip: true,
    }, [
      ref("image-placeholder", { id: "sp-image", height: 180 }),
      vstack({ id: "sp-text", width: "fill_container", padding: 12, gap: 4 }, [
        text("Fusaka is live: PeerDAS brings 8x more blob space to Ethereum", {
          id: "sp-title", width: "fill_container", fill: "$color.text-primary", ...type.bodyMedium, lineHeight: 1.3,
        }),
        text("blog.ethereum.org", { id: "sp-domain", fill: "$color.text-secondary", ...type.meta }),
      ]),
    ])),
  ];
}

// The design system's outlined (secondary) and compact green buttons.
const uploadButton = () => ref("button-outlined", { id: uid("upload") }, { "bo-label": { content: "Upload Image" } });

const submitButton = () => ref("button-compact", { id: uid("submit") }, { "bc-label": { content: "Submit" } });

function titleSection(title) {
  const remaining = TITLE_LIMIT - title.length;
  return vstack({ id: uid("title-section"), width: "fill_container", gap: 6 }, [
    text("Title:", { id: uid("title-label"), fill: "$color.text-primary", ...type.bodyMedium }),
    ref("text-field", { id: uid("title-field"), height: title ? "fit_content" : 44 }, {
      "tf-text": title
        ? { content: title, fill: "$color.text-primary", fontSize: 19, lineHeight: 1.25 }
        : { content: "Enter title", fontSize: 19 },
    }),
    text(`Characters remaining: ${remaining}`, { id: uid("title-count"), fill: remaining <= 0 ? "$color.alert" : "$color.text-secondary", ...type.meta }),
  ]);
}

function tabs(active) {
  const tab = (label, on) => ref("submit-tab", { id: uid("tab") }, {
    "st-label": { content: label, fill: on ? "$color.text-primary" : "$color.text-secondary", fontWeight: on ? "600" : "400" },
    "st-underline": { fill: on ? "$color.text-primary" : "#00000000" },
  });
  // The 1pt hairline under the tabs (Theme.borderSubtle, black/white 10%).
  return vstack({ id: uid("tabs"), width: "fill_container" }, [
    hstack({ id: uid("tabs-row"), width: "fill_container", gap: 20 }, [tab("Link", active === "link"), tab("Text", active === "text")]),
    frame({ id: uid("tabs-line"), width: "fill_container", height: 1, fill: "$color.button-background" }),
  ]);
}

function linkSection(url) {
  return vstack({ id: uid("link-section"), width: "fill_container", gap: 10 }, [
    ref("text-field", { id: uid("url-field") }, url ? { "tf-text": { content: url, fill: "$color.text-primary" } } : undefined),
    uploadButton(),
  ]);
}

function textSection(body) {
  return vstack({ id: uid("text-section"), width: "fill_container", gap: 6 }, [
    vstack({
      id: uid("text-editor"), width: "fill_container", height: 188, padding: [12, 9], cornerRadius: "$radius", fill: "$color.surface",
      stroke: "$color.text-secondary", strokeWidth: 1,
    }, [
      text(body || "Enter your text content here...", {
        id: uid("text-editor-text"), width: "fill_container", fill: body ? "$color.text-primary" : "$color.text-muted", fontSize: 16, lineHeight: 1.3,
      }),
    ]),
    text(`Characters remaining: ${TEXT_LIMIT - body.length}`, { id: uid("text-count"), fill: "$color.text-secondary", ...type.meta }),
  ]);
}

function submitScreen(name, { title = "", url = "", mode = "link", body = "", preview = false }) {
  const s = screen(name, {
    nav: null, tab: "tab-submit",
    contentProps: { padding: [16, 16, 120, 16], gap: 16 },
    content: [
      titleSection(title),
      tabs(mode),
      mode === "link" ? linkSection(url) : textSection(body),
      submitButton(),
      ...(preview ? [ref("submit-preview", { id: uid("preview") })] : []),
    ],
  });
  // The tab root shows only the logo (no menu or search).
  s.children.splice(1, 0, ref("nav-bar", { id: uid("nav"), justifyContent: "center" }, {
    "nav-menu": { enabled: false },
    "nav-search": { enabled: false },
  }));
  return s;
}

export function screens() {
  return [
    submitScreen("Submit", {}),
    submitScreen("Submit · Filled", {
      title: "Fusaka is live: PeerDAS brings 8x more blob space to Ethereum",
      url: "https://blog.ethereum.org/2025/12/03/fusaka",
      preview: true,
    }),
    submitScreen("Submit · Text", {
      mode: "text",
      title: "Ask Kiwi: best resources to learn ZK circuits in 2026?",
      body: "I know Solidity and some Rust. Looking for something hands-on, ideally with Noir or Circom, that goes beyond hello-world proofs.",
    }),
  ];
}
