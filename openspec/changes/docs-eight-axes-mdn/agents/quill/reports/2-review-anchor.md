# Report 2 — quill REVIEW of scribe's anchor page

- agent: quill · date: 2026-09-22 · reviewed: commit `0183770e` —
  `apps/www/src/routes/docs/components/anchor.html/+page.svelte` + `+page.ts`
- review law: `openspec/changes/docs-eight-axes-mdn/skills/mdn-doc-style.md` §5
- scribe's report read (`agents/scribe/reports/1-anchor.md`) but every claim
  below was re-derived from the code/page/SSR/CSSOM, not from the report.

## Verdict: NEEDS-WORK (1 MAJOR — the theme-axis consumption claim is false in effect; 1 MINOR; 3 NIT)

The bones are genuinely good: tier 2 was the right call, the archetype order
is exact, and seven of the eight axis rows verified REAL against the family
source, the frozen schema, and the CSS. But the theme row + section summary +
theme demo together claim the rail consumes the theme axis, and the rendered
page proves it does not — the exact "invented axis behavior" the review law
exists to catch, on the heart-of-the-refactor section.

## What verified CORRECT (checked, not trusted)

- **Tier**: 2 was right. Old page (`0183770e^`): duplicate usage blocks
  (#anchor-usage + #usage), PropsTable last, no overview/install/see-also, no
  axis table — but canvas, same-source drawer, aside rail, style zone all
  alive. Restructure-and-fill, not rewrite.
- **Archetype §2 order**: hero → install → overview → usage → live canvas →
  props → eight axes → accessibility → see-also; monotonic skeleton six holds.
  `+page.ts` ToC ids all exist in DOM, in order.
- **Steps/units**: all eight rows match `universal-props.schema.ts` verbatim
  (density small·medium·large/coefficient; shape no-number; radius px; color
  hue; theme light·dark·system; elevation dp; motion coefficient; size px).
- **Carrier names**: `data-density` rung + `--jx-density-coefficient`,
  `--jx-size-effective`+root font-size, `--jx-shape-effective`·
  `--jx-radius-factor-effective`, `--jx-radius-effective`,
  `--jx-color-effective`, `.dark` class, `--jx-elevation-effective`,
  `--jx-motion-effective` — all real in `defaults.svelte.ts`
  `stampCarriers` + `anchor.svelte` + `anchor.stylex.ts`.
- **Density/size mechanism claims vs CSS ground truth**: density scopes in
  `jixoai.css` re-scope `--jx-stack/--jx-hit/--jx-inset/--jx-text/--jx-line`;
  the channels are rem-based (`--jx-unit: 0.25rem`, `--jx-text-base:
  0.8125rem`), so the size row's honest callout ("labels do not follow size")
  is CORRECT — computed proof: sm rail 4px gap/12px text vs lg rail 8px/15px.
- **Census**: anchor is in the 13 sweep holes → D5, and the "declaration-only
  density posture retired" row is verbatim census text.
- **SSR ground truth (:5241 dev curl, 200 / 939 KB)**: universal marker ×1,
  install ×1, see-also ×1; panels stamped exactly as captioned — ambient: no
  attrs; density="small" → `data-density="sm"`; "large" → `"lg"`; dark →
  `class="… dark"`; responsive → `data-density="sm"` at SSR, resolving to
  `"lg"` at 1440px (≥64rem) client-side. The query() demo note is literally
  true.
- **Props rows** match source (label 'on this page', offset 96, required
  children, `...rest` both parts); universal section renders from
  `universalRows()` → `UNIVERSAL_AXES` shared artifact (generated, never
  hand-written).
- **Scribe's flagged follow-ups, adjudicated**: (1) size claim — correct vs
  CSS; the wrong artifact is `anchor.svelte`'s own JSDoc ("the rail's links
  scale with the root" — false, channels are rem); family untouched, flag to
  Owner. (2) multiple rails/spies per page — per-instance context, no
  cross-talk; fine. (3) svelte-check — confirmed absent from apps/www
  (no bin); campaign-wide gate mismatch, orchestrator's call.

## Findings

1. **MAJOR — theme axis: "the rail consumes it / changes the rail's own
   paint" is false in effect.**
   `+page.svelte:131-136` (theme row: "The other axis the rail consumes: a
   resolved dark puts .dark on the nav and flips every semantic token the
   rail reads"), `+page.svelte:331` (summary: "Only density and theme change
   the rail's own paint"), `+page.svelte:375-382` (the `theme="dark"` panel
   presented as a working demo).
   Evidence (computed, headless Chrome on :5241): the `.dark` class DOES
   land on the nav and the RAW token layer DOES flip at the nav scope
   (`--muted-foreground` → `oklch(0.8452 0 0)`, `--foreground` → white,
   `--primary` drifts −4°) — but the link's paint is
   `color: var(--jx-muted-foreground)` (CSSOM rule `.xowzrx4`), and that
   stylex ink var is declared only at `:root, .xbpgcew` (light scope) and
   `.x13ei35y.x13ei35y` (stylex dark theme scope class). A plain `.dark` on
   the nav never re-substitutes it: the dark rail's computed link color is
   `oklch(0.3211 0 0)` — byte-identical to the ambient rail's. Screenshot:
   the "dark rail" panel is visually indistinguishable from light. Fix:
   rewrite the row to the honest mechanism — "the .dark class bridge stamps
   on the nav and flips the raw token layer there, but the rail's paint reads
   the stylex ink indirection (`--jx-*` theme scopes), so the rail follows
   the SITE theme, not this lane" — and either drop the theme panel or
   recaption it the way the six documented-absence rows are captioned. The
   honest consumed-axis count on this family is density ONLY; the summary
   clause and the "consumed vs stamp-and-supply" split (scribe's own best
   idea) must be corrected to match.
2. **MINOR — per-axis table rides PropsTable's Property/Type/Default/
   Description headers** (`+page.svelte:334`): axes appear under "Property",
   mechanism strings under "Type", and named steps/number lane live only
   inside the Description prose — §2.5 wants them as table facts and §1
   wants enumerable facts scannable. Reusing the machinery is the right call
   under the no-new-page-machinery law; add one lead-in sentence mapping the
   columns ("each row: axis · what it stamps here · default · steps, unit,
   and consumption on this family") so the reader doesn't have to infer it.
3. **NIT — size row overclaims "The labels do not follow"** (`+page.svelte:106-107`):
   font-size/line-height genuinely don't follow (rem channels, verified), but
   the label's letter-spacing is em-based (`--jx-track-wide` = 0.08em), so a
   size stamp micro-scales tracking. Suggest "the label size and line height
   do not follow".
4. **NIT — density row omits the legacy rung spellings** (`+page.svelte:96-100`):
   `xs · 2xs · sm · default · lg` remain directly addressable per the schema's
   §4 alias note. One clause ("the five kernel rung spellings also address
   lanes directly") makes the row complete.
5. **NIT — 吃也供 in the axes summary** (`+page.svelte:331`): glossed Chinese
   shorthand in English prose (§4 English-prose law). Five existing pages
   (toc, pattern-faq/login/cta/pricing) share the idiom, so house precedent
   currently sides with scribe — flagging for a campaign-wide ruling, not a
   page-local fix.

## Gates (my own runs, log-file + $? discipline)

| gate | result | evidence |
|---|---|---|
| `verify:tailwindless` | GREEN | receipt UNMOVED verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` (/tmp/quill-anchor-tl.log) |
| `verify:docs-universal` | GREEN 110/110 | /tmp/quill-anchor-du.log (dist anchor.html fresh, carries the axes section + marker ×1) |
| `verify:docs` | GREEN | skeleton lint staged scope green (/tmp/quill-anchor-vd.log) |
| dev-smoke :5241 | PASS | SSR 200 / 939 KB; marker + stamp greps above; screenshot of #anchor-axes captured, non-triviality verified (880×2374, 1243 unique colors, 7.97% non-white) before judging (/tmp/quill-anchor-axes.png) |
| scoped svelte-check | n/a | not installed in apps/www (confirmed) — covered by SSR render + gates; campaign flag stands |

## Process receipt

vite dev on :5241 started via launcher PID 37867 (node listener PID 37908),
killed by PID after the smoke; `lsof -i :5241 -sTCP:LISTEN` → empty (exit 1);
both PIDS confirmed gone via `ps -p`. Capture helper chromium fully exited
(no ms-playwright processes; the host's unrelated agent-browser/ai-fly Chrome
processes left untouched). Headless captures for this review live in /tmp
(`/tmp/quill-anchor-axes.png`, `/tmp/quill-anchor-dark-panel.png`,
`/tmp/quill-anchor-resp-rail.png`); no repo files touched by the capture.

## Highlights (what this page does better than my blockquote)

Recorded in `agents/quill/experience.md` under "Highlights found in others'
pages": SSR-stamp captions as verifiable demo claims; the consumed-vs-supply
split as the table's spine with the census paragraph directly under it;
TokenTable defaults as equations instead of copied px literals; the inbound
deep-link audit before dropping ToC ids; the query() demo teaching the SSR
contract inline. Upgrade target committed: **blockquote**.
