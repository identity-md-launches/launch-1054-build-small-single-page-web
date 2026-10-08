# Validation and Better Interface review

Status: **Complete for the stated scope.** These are worker-run results, not independent network certification. Reviewed on 2026-10-08 against the supplied pinned Better Interface guide, including its workflow, core principles for all six domains, and implemented-design documentation method.

## Scope and assumptions

Built one new token allocation planner with a semantic single-page DOM, TypeScript, Vite, system fonts and CSS-generated graphics. Native controls suit the small interaction surface; there is no framework runtime or wallet dependency. The example supply and four fixed groups are ordinary illustrative planner inputs, not deployment addresses, actual token economics or owner-specific values. There was no missing essential requester input.

The export is `dist/`, with relative asset URLs and one page. Reviewed flows: editing supply/percentages, preset replacement, undo, chart/list updates, invalid inputs, incomplete and overallocated splits, local download, disclosure, keyboard navigation and iframe use. Only English and a light theme are implemented. No live financial data, account flow, wallet, backend, persistence, modal, media player, or separate routes exist.

## Six-domain coverage

| Domain | Coverage | Evidence and limits |
| --- | --- | --- |
| Accessibility | **Checked** | Bound native labels, named ranges with percentage value text, semantic headings/main, skip link, inline `aria-invalid`/descriptions, stable polite regions, redundant chart text, 44px fields/buttons and 28px ranges. Actual keyboard Tab/Enter/arrow flow completed. Visible focus inspected on supply and allocation controls; other stops' focus-visible/2px outline was computed. Axe scans at desktop/default and mobile/error: zero violations. Forced-colors rendering inspected; reduced-motion transition measured as 0s. No screen-reader session, physical-device testing or screenshot of every individual focus stop. |
| Layout | **Checked** | Production screenshots and width measurements at 320, 360, 768 and 1200px; 320px plus 200% text enlargement. No remaining document overflow. Preset/field/legend/action rows wrap, DOM reading order follows visual order. A 360px iframe scrolls and updates normally. Native browser zoom and unbounded host-specific iframe configurations were not tested. RTL/localization are **Not applicable** to the English-only brief. |
| Writing | **Checked** | Authored labels match actions; starting points explicitly illustrative; persistent hints state numeric bounds; errors give the remedy. The download result says “requested” rather than claiming host delivery. Visible paragraph explains the module and its purpose. Formula, refresh behavior and economic exclusions are disclosed. |
| Typography | **Checked** | Descending title/section/subheading hierarchy; tabular numerals; 16px percentage/select fields and 24px supply field; readable line heights and constrained copy. Mobile and enlarged text inspected, including the maximum supply. Full result values wrap; input scrolling is native. System font availability outside the supplied browser was not verified. The redundant decorative chart keeps its own annotation scale. |
| Colors | **Checked** | Semantic roles reviewed in source; foreground/background values read from rendered/computed styles and measured using WCAG relative luminance. Text pairs range from 5.13:1 to 12.62:1 among those recorded; control border 3.30:1; focus/editor 11.26:1 and focus/preview 9.85:1. Explicit labels duplicate chart colors. Axe's incomplete decorative arrow contrast result was measured at 5.32:1. Dark theme is **Not applicable**; none is implemented. |
| UI | **Checked** | Native select/details/range behavior, disabled initial undo, changed/custom preset, complete/empty/error chart states, download feedback, stable flat surfaces and local icons inspected. Primary-button motion is limited to 120ms and disabled under reduced motion. Forced colors preserves controls and numeric alternatives. No loading state is needed because work is synchronous/local. Animation replay at 10% speed and physical touch feedback were not performed. |

## Findings and fixes

Locations refer to final source.

| Severity / owner | Source | Reproduction and impact | Fix and recheck |
| --- | --- | --- | --- |
| Medium / Layout (also accessibility, typography) | `src/styles.css:46`, `src/styles.css:110`, `src/styles.css:117`, `src/styles.css:137`, `src/styles.css:153` | At 320px with root text set to 200%, rem gutters consumed the available width, fixed-size chart geometry escaped it, and the unwrapped total heading left almost no space for long numbers. Document width was 323px; controls and totals were cramped. | Kept gutters at their implemented pixel values, made control/list/action rows wrap, let percentage fields scale in em, bounded chart geometry and retained a fixed decorative annotation scale. Rebuilt; 320px at 200% text now has document width 320px with no overflowing element. Inspected `text-200.png`; ordinary layouts rechecked at 360/768/1200px. |
| Low / Writing | `index.html:22`, `src/styles.css:193` | When the introductory line break became hidden at narrow widths, “split.Turn” ran together. | Added real whitespace at the break. Rebuilt and visually confirmed separation in final mobile/tablet screenshots. |
| Low / Typography | `src/styles.css:164`, `src/styles.css:176`, `src/styles.css:224` | The export instruction, privacy line and footer used 11px text, below the chosen reusable caption size. | Reused the 12px caption token and checked default and enlarged text renders. |

No unresolved primary-flow defect was observed. A separate scratch-only iframe harness initially requested a nonexistent favicon (404); an explicit favicon was added and the later harness run had no resource error. The sandbox harness still produced Chromium's warning about combining `allow-scripts` and `allow-same-origin` on a same-origin frame. It did not block functionality and does not originate in the shipped module; see `iframe-console.txt`. The final standalone export's console is clean. The attempted cross-origin test still reported localhost for both frame and host, so an actual cross-origin production-host test is **Not verified**.

## Build and calculation checks

Final commands (external dependency location respects the repository's `node_modules/` restriction):

```sh
PATH=/tmp/token-split-deps/node_modules/.bin:$PATH npm run typecheck
PATH=/tmp/token-split-deps/node_modules/.bin:$PATH npm run build
npm run test
npm run check:export
```

The typecheck and production build exited 0. Build output: four files (HTML, JavaScript, CSS, favicon), approximately 30 KB uncompressed. The exact sizes and SHA-256 hashes are in `submission.json`. The final build log is `build-and-tests.log`.

All five `node:test` cases passed: strict whole-supply parsing, percentage bounds and precision, exact arithmetic at the maximum supply, fractional supply conservation, and rejecting malformed/incomplete/overallocated exports. The amount calculation uses integer tenths of a percent and BigInt thousandths of a token; it does not round via floating-point arithmetic.

The initial npm metadata lookup failed because the default user cache was read-only. Moving the npm cache and dependency installation under `/tmp/` succeeded. The first attempt to find the supplied tool-managed preview descriptor found no `test/scratch/browser/preview.json`; the checks used a bounded foreground Python HTTP preview session, serving `dist/` under `/preview/`, and closed it afterward. No preview or browser infrastructure is a runtime dependency or a required build input.

## Production browser interaction checks

All checks used the actual built export over local HTTP at a subpath, with the provided Chromium/Playwright browser tool. Native fill/select/click/keyboard operations drove the flows; page evaluation asserted values and measured geometry.

| Check | Actual result |
| --- | --- |
| Initial 1,000,000 supply, 50/20/15/15 | 100% ready; 500,000 / 200,000 / 150,000 / 150,000 |
| Supply 7, percentages 33.3/33.3/33.3/0.1 | 100% ready; exact amounts 2.331 / 2.331 / 2.331 / 0.007 |
| Download fractional plan | Actual browser download completed; inspected text retained in `download-example.txt` |
| Change first percentage to 50 | 116.7% sum; message “Remove 16.7%”; chart paused; download action returned focus to the percentage field with a remedy |
| Undo that edit | Restored 33.3 and the completed plan |
| Start empty | All amounts zero; 100% left; unallocated amount 7 |
| Empty/zero supply; 20.55 or 101 percent | Invalid fields named and described; unavailable amounts shown as em dashes; export focuses first invalid field |
| Equal split with maximum supply at 320px | Exact 249,999,999,999,999.75 in each group; full values remained reachable; no document overflow |
| Keyboard-only sequence | Skip link → supply → native preset → percentage → range; ArrowRight moved 25 to 25.1; ArrowLeft restored it; Tab visited remaining controls; Enter invoked undo/download/disclosure |
| Method disclosure | Opened and closed with native details/summary; explanation remained in normal flow |
| Iframe at 360px | Supply 2000 produced Community 1000; actual native download completed; document width equaled iframe width |
| Reduced motion | `prefers-reduced-motion: reduce` true; computed primary transition 0s |
| Forced colors | System control boundaries/ranges visible; labels and numeric list carried all information when chart color disappeared |
| Resource/console inspection | Final standalone page: four local 200 responses, zero console errors or warnings; no remote requests |

## Evidence

- `desktop.png`: final default at 1200px.
- `mobile.png`: final default at 360px.
- `tablet.png`: final two-panel arrangement at 768px.
- `mobile-errors.png`: invalid supply and percentage, expanded explanation at 360px.
- `text-200.png`: corrected 320px layout with 200% root text enlargement.
- `keyboard-focus.png`: visible range focus in the allocation editor.
- `forced-colors.png`: browser-emulated forced colors.
- `accessibility.json`: two actual axe-core 4.11.1 results, each with 29 passing rules and zero violations; one incomplete decorative-glyph check.
- `contrast.json`: eleven identified foreground/background pairs, measured from computed styles using the WCAG 2 luminance formula.
- `iframe.json`, `iframe-console.txt`, `reduced-motion.json`, `console.txt`, `network.txt`: observed browser results.
- `submission.json`: export integrity, hashes and conservative payload size.

Screenshots were actually opened and inspected, not inferred from snapshots. The browser's accessibility tree was reviewed for labels and states; that is not a screen-reader session. Axe was loaded only by the scratch audit server after the initial runtime-request check; it is absent from source, dependencies and production export.

## Remaining limits and delivery

Only the supplied Chromium environment was tested. Safari, Firefox, physical touch devices, screen-reader behavior, browser-native zoom, actual cross-origin host integration, and every possible viewport remain unverified. The 200% check enlarged the root text size; it does not establish browser-native 200% zoom. The tool uses fixed group names, whole input supply and 0.1% steps, with up to three fractional token digits in results. It does not enforce a real token's decimals or execute an allocation. Drafts last only until reload; the download is the persistence mechanism.

`dist/` is present beside source, manifest and lockfile and is not ignored. Nothing in `.git/`, `.github/`, `.env` or repository `node_modules/` was modified. The task runner handles Git submission; no Git mutation was attempted. Dependency installations/caches and temporary archives live outside the repository. The only disposable local test harness is under ignored `test/scratch/`, and removing it does not affect install, build, unit tests or static publishing. No dependency archives, caches or submodules are included in the deliverable.

A temporary uncompressed tar of all 40 deliverable files measured 1,239,040 bytes, well below 8,388,608 bytes. The archive was created under `/tmp/` for measurement and deleted. `submission.json` also reserves report and archive-header overhead in its conservative size check; it does not read Git metadata or claim to measure the task runner's future Git pack.
