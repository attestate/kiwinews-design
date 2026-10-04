# Kiwi News design

`kiwi-news.pen` is the whole Kiwi News design in one [pen.dev](https://www.pen.dev)
file, in three areas on the canvas:

- **iOS app:** colors, type, components, and every screen in light and dark mode.
- **Website:** news.kiwistand.com on desktop and mobile.
- **Newsletter:** the weekly digest email (light and dark, wide and narrow) and its building blocks.

This repository is the source of truth: whatever is in `kiwi-news.pen` on
`main` is the current design.

## For designers: working without Git

You need pen.dev (desktop app) and a free GitHub account that has been
added to this repository. You don't need Git or a terminal.

**1. Get the latest file.** Open
[`kiwi-news.pen`](https://github.com/attestate/kiwinews-design/blob/main/kiwi-news.pen)
on GitHub and click the download button (“Download raw file”, top right of
the file). Always start from a fresh download, never from an old copy.

**2. Design.** Open it in pen.dev and work as usual.
- iOS: **Variables** (colors, radius, spacing) have a light and a dark
  value; change one and every screen follows. **Components** are on the
  left; screens are built from them, so editing a component updates every
  screen. The **dark** screens copy the light ones, so design in the light row.
- Website and newsletter are captures of the live pages. Edit them freely;
  they are a starting point, not components.
- Images are placeholders unless they're part of the brand. If you add an
  image, keep it in the `assets` folder next to the file.

**3. Hand it back.** On the repository page, click **Add file → Upload
files**, then drag in `kiwi-news.pen` (and any new images, into `assets/`).
- The file must be called exactly `kiwi-news.pen`. If your download is
  named `kiwi-news (1).pen`, rename it first.
- Below, write one line about what you changed and choose **“Create a new
  branch for this commit and start a pull request”**, then **Propose
  changes** and **Create pull request**.

A check then runs on the file and comments with preview images of the
screens you changed. Tim reviews the pull request and merges it into `main`.

**One person edits at a time.** The file can't be merged like text: if two
people edit at once, the later upload replaces the earlier one. Say in the
chat when you take the file and when your pull request is up.

## For developers

```
kiwi-news.pen               # the design (edited in pen.dev; don't regenerate it)
assets/                     # images the design uses (logo, wordmark, email banner, …)
tools/
  check.mjs                 # validates the file (CI)
  render.mjs                # renders screens to PNG without pen.dev (CI previews)
  changed-screens.mjs       # which screens a pull request changed
  capture-website.mjs       # captures news.kiwistand.com into the Website area
  capture-newsletter.mjs    # captures the newsletter emails into the Newsletter area
  build-ios.mjs             # the original code-generated iOS import (writes to out/)
  ios/                      # its tokens, components and screens, mirroring the SwiftUI views
  lib/                      # .pen helpers, the DOM → .pen capture, the HTML preview renderer
```

```
npm install
npm run check                 # is kiwi-news.pen intact?
npm run preview               # PNGs of every screen in out/preview
npm run capture:website       # re-capture the website (replaces only the Website area)
npm run capture:newsletter    # re-capture the newsletter (replaces only the Newsletter area)
```

Notes:
- **Capture scripts:** they expect checkouts of
  [kiwistand](https://github.com/attestate/kiwistand) and
  [kiwinews-ios](https://github.com/attestate/kiwinews-ios) next to this
  repository; set `KIWISTAND` or `KIWINEWS_IOS` to use other paths.
- **Newsletter:** export it first, in `kiwistand/newsletter`, with
  `npm run export:sample`.
- **Website and Cloudflare:** Cloudflare's bot check blocks most pages from
  datacenter IPs (CI and cloud machines), so run `capture:website` from a
  normal connection. Pages that are blocked keep their previous capture.
  `ONLY="New,Best"` re-captures just those pages.
- **Chromium:** if Playwright's own browser isn't installed, set
  `PLAYWRIGHT_CHROMIUM` to a Chromium binary. Behind an HTTPS proxy, also
  set `NODE_USE_ENV_PROXY=1`.

Captures only replace their own area (node ids starting with `web-` or
`mail-`), so edits elsewhere in the file are kept. Editing inside those
areas is lost on the next capture of that page, so re-capture before a
designer starts on them, not after.

Format reference: https://docs.pen.dev/for-developers/the-pen-format
