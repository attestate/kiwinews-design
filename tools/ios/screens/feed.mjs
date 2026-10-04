// Home (Hot), New and Best feeds (KiwiNative/UI/FeedView.swift).
import { vstack, ref, uid } from "../../lib/pen.mjs";
import { screen } from "./shell.mjs";

// The app hides a count of 0 (no likes shown when logged out, no comments yet).
const counts = (likes, comments) => ({
  "sc-actions/ab-like-count": likes ? { content: String(likes) } : { enabled: false },
  "sc-actions/ab-comments-count": comments ? { content: String(comments) } : { enabled: false },
});

const stories = {
  image: (title, author, ago, domain, likes, comments, comment) => ref("story-card", { id: uid("story") }, {
    "sc-title": { content: title },
    "sc-author": { content: author },
    "sc-ago": { content: ago },
    "sc-domain-badge/db-domain": { content: domain },
    ...counts(likes, comments),
    ...(comment
      ? { "sc-comment/cp-name": { content: comment.name }, "sc-comment/cp-time": { content: `• ${comment.ago} ago` }, "sc-comment/cp-text": { content: comment.text } }
      : { "sc-comment": { enabled: false } }),
  }),
  // No preview image: the domain moves into the meta line.
  text: (title, author, ago, domain, likes, comments) => ref("story-card", { id: uid("story") }, {
    "sc-media": { enabled: false },
    "sc-title": { content: title },
    "sc-author": { content: author },
    "sc-ago": { content: ago },
    "sc-dot2": { enabled: true },
    "sc-domain": { enabled: true, content: domain },
    ...counts(likes, comments),
    "sc-comment": { enabled: false },
  }),
  // Tweets / casts replace media and title with the embed card.
  embed: (author, ago, domain, likes, comments) => ref("story-card", { id: uid("story") }, {
    "sc-media": { id: uid("embed"), type: "ref", ref: "embed-card" },
    "sc-title": { enabled: false },
    "sc-author": { content: author },
    "sc-ago": { content: ago },
    "sc-dot2": { enabled: true },
    "sc-domain": { enabled: true, content: domain },
    ...counts(likes, comments),
    "sc-comment": { enabled: false },
  }),
};

function segmented(selected, labels = ["Hot", "New", "Best"]) {
  const ids = ["seg-1", "seg-2", "seg-3", "seg-4", "seg-5"];
  const descendants = {};
  ids.forEach((id, i) => {
    if (i >= labels.length) return;
    const on = i === selected;
    if (i >= 3) descendants[id] = { enabled: true };
    descendants[id] = on
      ? { ...(descendants[id] ?? {}), fill: "$color.segment-thumb", effect: { type: "shadow", offset: { x: 0, y: 3 }, blur: 8, color: "#0000001F" } }
      : { ...(descendants[id] ?? {}), fill: "#00000000", effect: [] };
    descendants[`${id}-label`] = { content: labels[i], fontWeight: on ? "600" : "500" };
  });
  return ref("segmented", { id: uid("seg") }, descendants);
}

// `top`: space between the nav bar (menu, logo, search) and Hot/New/Best.
// FeedView.pills: .padding(.top, 12).
const feedContent = (selected, extra = [], top = 12) => [
  vstack({ id: uid("pills"), width: "fill_container", gap: 8, padding: [top, 0, 0, 0] }, [segmented(selected), ...extra]),
  stories.image("OpenAI says planned GPT-6.1 is too insecure to release", "mishaderidder.eth", "5h", "arstechnica.com", 3, 2, {
    name: "timdaub.eth", ago: "2h", text: "Really cool write-up, the threat model section is worth reading in full.",
  }),
  stories.text("Introducing zkAPI: private usage credits for any API", "mishaderidder.eth", "8h", "ethereum.org", 2, 0),
  stories.embed("0xC0B3…3D80", "9h", "x.com", 2, 1),
  stories.image("Introducing the Larva Labs Catalog", "mishaderidder.eth", "1d", "larvalabs.com", 2, 0),
];

const contentProps = { padding: [0, 11, 120, 11], gap: 20 };

export function screens() {
  return [
    screen("Home · Hot", { tab: "tab-home", content: feedContent(0), contentProps }),
    screen("New", { tab: "tab-new", content: feedContent(1), contentProps }),
    screen("Home · Best (week)", {
      tab: "tab-home",
      content: feedContent(2, [segmented(3, ["All", "Year", "Month", "Week", "Day"])]),
      contentProps,
    }),
  ];
}
