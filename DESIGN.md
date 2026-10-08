# Token Split design

## Overview

Token Split is a one-page workbench for people sketching token allocations. It pairs an editable plan with an immediate visual summary. The implemented character is a warm paper surface, restrained green actions, an editorial serif title, and a precise, quiet form. This is an independent module identity, not a reproduction of the host site's branding.

The main composition is one bordered workbench with two tonal sections: edit first, preview second. Space groups related controls; lines divide only the major regions and totals. At narrow widths the DOM order becomes the visual order. The visible explanation below the workbench is part of the product.

## Colors

Canonical definitions are in `src/styles.css:1`. Primitive hex values feed semantic tokens; components use the semantic names. There is one light theme and a system forced-colors fallback.

| Semantic token | Value | Role |
| --- | --- | --- |
| `--color-bg` | `#f5f3ea` | Page background |
| `--color-surface` | `#fffef9` | Editor and fields |
| `--color-preview` | `#edf0e5` | Preview panel and chart center |
| `--color-text` | `#252e26` | Main text |
| `--color-muted` | `#60665b` | Hints, captions, secondary copy |
| `--color-border` | `#d4d7c9` | Structural rules and chart guides |
| `--color-control-border` | `#898f7f` | Distinguishable form boundaries |
| `--color-accent` | `#3f5630` | Download button |
| `--color-accent-hover` | `#304225` | Download hover |
| `--color-on-accent` | `#fffef9` | Text on primary fill |
| `--color-focus` | `#263f36` | 2px focus perimeter, 4px offset |
| `--color-success` / `--color-success-bg` | `#304225` / `#dce5d5` | Complete-allocation message |
| `--color-error` / `--color-error-bg` | `#8f3727` / `#f7e8df` | Error text and status |
| `--chart-community` | `#263f36` | Community segment, swatch and range |
| `--chart-liquidity` | `#c2a45d` | Liquidity segment, swatch and range |
| `--chart-contributors` | `#ae725a` | Contributors segment, swatch and range |
| `--chart-treasury` | `#849980` | Treasury segment, swatch and range |
| `--chart-empty` | `#d4d7c9` | Unallocated supply and paused chart |

Category colors are supplemented by group names, numeric percentages and amounts. Status messages include a symbol and text. There is one filled primary action. Exact measured contrast pairs are in `artifacts/contrast.json`: body/page 12.62:1, muted/editor 5.86:1, muted/preview 5.13:1, primary button 8.04:1, success 8.39:1, error status 6.40:1, inline error 7.58:1, control border/editor 3.30:1. These are specific rendered/computed pairs, not a blanket compliance claim.

## Typography

`--font-body` is `'Segoe UI', Arial, sans-serif`; `--font-display` is `Georgia, 'Times New Roman', serif`. These are system fonts, so no font files or font network requests are needed. Font metrics may vary by platform; the browser checks establish rendering in the supplied Chromium environment, not font availability on every OS. Synthesis is disabled. Body requests 400; field emphasis 500; headings and labels 600; the wordmark requests 650. The serif title and its italic phrase use 400.

| Role | Implemented size and behavior |
| --- | --- |
| Main title | `--text-display: clamp(2.7rem, 4.6vw, 3.8rem)`, line height 1.1, tracking −0.055em |
| Section heading | `--text-section: 1.125rem`, line height 1.3, tracking −0.025em |
| Body and controls | `--text-base: 1rem`, body line height 1.55; percentage fields and select stay at least 16px by default |
| Labels / primary action | 0.875rem, weight 600 |
| Supporting copy / subheadings | `--text-sm: 0.8125rem`, explanatory paragraphs line height 1.65 |
| Hints / status / export note | `--text-xs: 0.75rem`, line height at least 1.5 |
| Supply input | 1.5rem, weight 500, tracking −0.02em |
| Decorative chart | Center numeral 59px (53px below 26rem); suffix 29px; guides/labels 10px, caption 11px |

The chart is redundant with the text status and definition list, and is hidden from assistive technology. Its annotation scale stays inside the illustration during text enlargement; the equivalent text outside it scales normally. The eyebrow and offline badge also use compact mobile display sizes. These are deliberately smaller than reading copy.

Headings balance, prose uses `text-wrap: pretty`, explanatory text is capped at 70ch, and changing numeric values use tabular figures. Full amounts wrap instead of being truncated; editable long supply values use normal native input scrolling and repeat in the preview caption. Useful text remains selectable.

## Layout

The spacing tokens `--space-1` through `--space-7` are 4, 8, 12, 16, 24, 32 and 48px. These fixed gutters leave space for enlarged text; text itself uses rem sizes. Local optical spacing is documented directly in `src/styles.css` rather than pretending every value belongs to the token scale.

`.shell` is at most 1184px including its 32px inline padding. `.workbench` and `.underbench` use `1.06fr 1fr`. Desktop panels use 32px inline padding. Controls have at least 44px height, except ranges, whose 28px interactive box exceeds the 24px baseline and has a 44px text-field alternative. Touch targets do not overlap.

Breakpoints in `src/styles.css:191`:

- At 62rem (992px with the default browser font), the introduction stacks and panel padding becomes 24px.
- At 47rem (752px), the workbench and explanation stack; the preview gets a top divider and bottom corner radii. The masthead loses its secondary edition text. Shell padding becomes 24px.
- At 26rem (416px), shell and panels use 16px padding, secondary header text stays hidden, chart width becomes 254px, legend percentages move to a second line, and footer messages stack.

Preset rows, allocation rows, breakdowns and the primary action wrap as content needs. The chart uses aspect ratios and a maximum width of 100%; no fixed content height is imposed on the iframe. Default renders were inspected at 320, 360, 768 and 1200px, with separate 200% root text enlargement at 320px. Browser-native zoom was not tested.

## Elevation & Depth

Surfaces are flat; there are no decorative card shadows or overlays. A 1px boundary structures the workbench and fields. The range thumb has a 1px outline-like shadow to separate it from its track. Preview tint distinguishes output from input. The skip link uses z-index 2 only while focused; the rest of the page is normal document flow.

## Shapes

Controls use `--radius-control: .375rem` (6px by default); the workbench uses `--radius-panel: .75rem` (12px). Steps use 4px, status badges 5px, and swatches 2px. The original four-square mark has an 8px wrapper radius. Charts and range thumbs are circles. The preview corners follow whichever edges form the outer panel at the current breakpoint.

## Components

These are native DOM/CSS patterns, not a framework component library.

| Pattern and source | Behavior and states |
| --- | --- |
| Supply field, `index.html:27`, `.supply-control` | Persistent label, numeric keyboard, grouping on blur, inline bounds error, focus-visible ring |
| Preset select, `index.html:33` | Three authored examples; disabled Custom split option reflects edits; native keyboard operation; replacement is undoable |
| Allocation row, `src/main.ts:20` | Authored label/hint, exact percentage field, equivalent range with percentage value text, per-field error; every group has a stable color token |
| Preview, `src/main.ts:69` | Live chart and text list; remainder for underallocation; paused chart for malformed/overallocated percentages; no normalization |
| Status, `index.html:44` | Stable polite live region with neutral, complete and error states; icons and text duplicate color meaning |
| Primary action, `src/main.ts:191`, `.primary-button` | Always available for validation; focuses the first invalid control, requires 100%, downloads a local text Blob; visible and announced feedback |
| Undo, `src/main.ts:175`, `.text-button` | Up to 30 snapshots; disabled at start; restores supply, percentages and preset; announces restoration |
| Explanation, `index.html:55`, `.method` | Native details/summary with plus/close affordance; Enter/Space and pointer supported |
| Skip link, `index.html:13`, `.skip-link` | First keyboard target; moves to the workbench without changing route |

All text controls have real labels and native keyboard behavior. Focus uses an explicit 2px outline. Hover colors are limited to hover-capable devices. Only the download button animates: 120ms background/transform and a 0.96 pressed scale, gated by `prefers-reduced-motion: no-preference`. Reduced motion removes that transition. Forced colors restores native ranges and system control/focus boundaries. No loading state, modal, tooltip or auto-playing media is needed.

## Do's and Don'ts

- Reuse the shell, section heading, field, status and primary-button patterns; keep source order input → result → explanation.
- Add semantic color roles before using new raw colors in components. Keep category colors paired with text labels.
- Keep exact integer arithmetic in `src/model.ts`. Do not normalize an overallocated chart or silently round an export.
- Allow text and rows to wrap; preserve 16px input text, visible focus, descriptive errors and keyboard alternatives.
- Keep assets local and the one-page relative export intact. Do not add runtime fonts, wallet SDKs or analytics.

For another small section in this module, start with a labeled native section inside `.shell`, use the existing type/spacing tokens, choose one of the existing control patterns, and verify narrow layout plus enlarged text before documenting any new token. The current two-panel arrangement is specific to this planner, not a requirement for all future tools.
