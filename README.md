# Token Split

A small allocation planner for Ethereum token communities and the IMD ecosystem. Enter a supply, adjust four groups, and download a complete text plan. The visible note below the planner explains what was built and why.

This complements the existing conversion, tower-game and monitoring modules with an offline tool for discussing a new token or community draft. The product name and geometric mark are original; the example allocations do not represent an existing token.

## Use it

1. Set a whole-token supply, from 1 to 999,999,999,999,999.
2. Choose Community first, Equal split, or Start empty. Edit percentages with the fields or sliders; arrow keys change sliders by 0.1%.
3. Bring the sum to exactly 100%, then select **Download plan**. **Undo change** restores earlier edits or a replaced preset, up to 30 snapshots.

An unfinished split displays its unallocated tokens. An overallocated split pauses the chart rather than rescaling it. Invalid values show a correction beside the field and prevent exporting a misleading plan. The exported text includes all percentages, exact amounts, and the model's limits.

All calculations run in the tab. There are no accounts, wallet APIs, transactions, remote APIs, analytics, third-party scripts, cookies, or persistent storage. Once the static files have loaded, the tool needs no network. It does not install a service worker or promise an offline reload. Refreshing resets the draft.

## Install and develop

Use Node.js 22.18+ (validated with Node 24.21.0 and npm 11.19.0).

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Dependencies are build tools only: Vite 8.0.3 and TypeScript 6.0.2, pinned by `package-lock.json`. Native TypeScript/DOM code keeps this small module free of framework runtime dependencies.

The assignment forbids changes to the repository's `node_modules/`. During this build, dependencies were installed outside the repository:

```sh
mkdir -p /tmp/token-split-deps
cp package.json package-lock.json /tmp/token-split-deps/
npm --prefix /tmp/token-split-deps --cache /tmp/token-split-npm-cache ci
PATH=/tmp/token-split-deps/node_modules/.bin:$PATH npm run typecheck
PATH=/tmp/token-split-deps/node_modules/.bin:$PATH npm run build
```

No build depends on that particular temporary directory. The normal `npm ci` workflow above is for an unrestricted development checkout. Generated dependency/cache directories are excluded at every nesting level by the budgeted `.gitignore`; the complete `dist/` export is included.

## Rebuild and preview

```sh
npm run typecheck
npm run test
npm run build
npm run check:export
npm run preview
```

`npm run test` uses Node's built-in test runner; it needs no browser dependency. `npm run build` replaces `dist/`. `npm run preview` serves that production export. Use HTTP(S), not a `file://` URL, for ES modules.

Source map:

- `index.html`: semantic page, visible product note, disclosure, CSP, local entry points.
- `src/main.ts`: controls, live results, validation, undo and local download.
- `src/model.ts`: exact supply/percentage parsing, arithmetic and text export.
- `src/styles.css`: tokens, components and responsive rules.
- `tests/model.test.ts`: boundary and conservation checks.
- `scripts/check-export.mjs`: relative-asset, dependency hygiene and payload budget checks.
- `dist/`: ready-to-publish HTML, CSS, JavaScript and favicon.
- `DESIGN.md` and `artifacts/validation.md`: implemented design and actual check coverage.

## Publish and embed

Publish **the contents of `dist/`**, including its `assets/` directory and favicon, to any static HTTP(S) host. The publisher can use the included export directly without installing or rebuilding. Vite's `base: './'` makes all entry asset URLs relative, including when hosted at a nested module path. There is one page and no server-side routing. Serve JavaScript and CSS with their normal MIME types; allow the page to be framed by the host site.

For a same-origin static preview:

```html
<iframe
  src="./dist/"
  title="Token Split allocation planner"
  style="width:100%;height:900px;border:0"
></iframe>
```

Set `src` to the actual publication path when integrating. The frame scrolls vertically at narrow widths; do not disable scrolling or assume a fixed content height. No parent-page script or messaging is needed. For a sandboxed frame on a separate module origin, enable `allow-scripts allow-same-origin allow-downloads`; without permission for downloads, calculations still work but the host can block the exported file. Browser modules require a usable origin. The local sandbox test used these permissions; its same-origin sandbox warning is documented in validation.

## Actual validation

Production build and TypeScript check exited 0 after the final source changes. All 5 model tests passed. The production export was served under `/preview/` and inspected with the provided Chromium/Playwright browser tool at 320, 360, 768 and 1200 CSS pixels, plus 200% text enlargement at 320px. No horizontal document overflow remained in those checks.

Native form edits, preset selection, keyboard sliders, undo, invalid-input recovery, under/overallocation, exact fractional amounts, disclosure and actual text downloads were exercised. Iframe editing and downloading also worked. Two axe-core 4.11.1 scans reported zero violations, with one decorative-glyph contrast result needing manual review; its computed pair was measured at 5.32:1. The final standalone page had zero console errors/warnings and only four successful local resource requests. Screenshots and measured contrast pairs are in `artifacts/`.

Limits: Chromium only; no physical devices, Safari/Firefox, native browser 200% zoom, or screen-reader session. Text enlargement is a separate test, not a claim of native zoom. No onchain validation or financial modeling: the four fixed categories and presets are illustrative; token-specific decimal restrictions, vesting, prices and voting power are outside scope. Detailed coverage, findings, fixes and command results are in [the validation record](artifacts/validation.md).

## Guidance attribution

Design review applied the supplied, pinned Better Interface reference (MIT), and the documentation method adapted from Impeccable (Apache-2.0). Original license and copyright notices are retained in [GUIDANCE-LICENSE.txt](artifacts/GUIDANCE-LICENSE.txt). Source records: Better Interface at `267330e1adfc66a718fb65fa6918c1f06d0a689e` in `https://github.com/jakubkrehel/skills`; Impeccable at `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8` in `https://github.com/pbakaus/impeccable`. The site and its documentation were written for this assignment; the guidance itself is not shipped as runtime code.
