# Report 24 — hero-section, REVIEW (2nd, marginalia) — the ADJUDICATION

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/hero-section.html/` (current tree =
d45a58ec, quill's double-MAJOR disposition) · coder quill · reviewer #1:
vellum (1st review: PASS carried a MAJOR — "the query theme demo never
flips" — which quill non-reproduced) · this review = the designated
TIEBREAKER. Protocol executed as dispatched: BOTH instruments run by me on
the served page, then the standard 2nd-review pass.

## Verdict: PASS — vellum's MAJOR is NON-REPRODUCED (probe-medium artifact)

**0 BLOCKER · 0 MAJOR · 0 MINOR · 0 NIT** on the page as served. Both
instruments ran with my own hands; the raw-SSR read shows the §9.1
unconditional base and the live hydrated probe flips both directions with
the exact ink signatures quill reported. **hero-section closes** (page
#18/#19/#20 per the race); **LAW #16 enters the law library**.

## The adjudication — both instruments' receipts

### Instrument A — the raw-SSR / pre-hydration read
curl of the served page (1,080,257 bytes): the RENDERED query hero
section (the `<section>` whose eyebrow paragraph reads "responsive ·
v1", immediately inside the query canvas after the
`hero-section-query-demo.svelte` code card) opens
`<section class="x12h1iku x1nah20r xvueqy4 xh8yej3 …">` — **no `.dark`
class anywhere in the section tag**. The §9.1 first-paint-base law holds:
SSR renders before any media can answer, so the raw bytes are ALWAYS the
light base at every viewport. A raw-bytes or pre-hydration instrument can
never see the flip — by design, not by defect.

### Instrument B — the live hydrated probe (LAW #14 settles)
Real browser, the rendered query hero (located by its eyebrow paragraph,
scrolled to center, hydrated + entrance-cascade settled), viewport
resized with 750ms settles at each step:

| viewport | matchMedia ≥48rem | `.dark` on hero | eyebrow ink |
|---|---|---|---|
| 1280px | true | **true** | oklch(0.7044 0.1872 27) |
| 600px | false | **false** | oklch(0.55 0.12 56) |
| 1280px | true | **true** | oklch(0.7044 0.1872 57) |

The flip is live, both directions, tracking the media query — and the ink
signatures match quill's receipt exactly (dark accent = the dark --primary
formula L 0.7044 / C 0.1872; light accent = oklch(0.55 0.12 …)). Note the
absolute hue rotating across my own reads (27 → 56 → 57) — the brand-hue
wall-clock, visible again: L/C + class state are the invariants, absolute
hue never is.

**Adjudication: vellum's MAJOR NON-REPRODUCED.** The discrepancy between
the two 1st-pass instruments was the probe medium, exactly per quill's
false-negative vector: §9.1 makes the raw/pre-hydration read blind to any
query flip.

### LAW #16 (candidate text, enters the law library)
> **query demos serve the unconditional base in raw SSR (§9.1)** — a
> raw-bytes or pre-hydration read always sees the base state and can
> never observe a query() flip. Hydrated probes (real viewport resize,
> settle > transition duration) are the ONLY valid instrument for flip
> claims. **Name your medium in every probe report**: a flip claim
> without its medium named is unfalsifiable, and a falsification from
> the wrong medium is a false negative.

## The standard 2nd-review pass (four re-derivations)

1. **The emission-form split — re-derived at the axes canvas.**
   hero-light vs hero-dark specimens, one evaluate: the RAW accents flip —
   eyebrow oklch(0.55 0.12 29) → **oklch(0.7044 0.1872 25)** (the dark
   --primary-text formula, drift −4° visible 29→25) — while the summary's
   muted ink is byte-identical oklch(0.3211 0 0) both sides. The
   declaring-scope receipt: `--muted-foreground` (raw) **flips on the
   section** 0.3211 → 0.8452 while `--jx-muted-foreground` (the stylex
   alias) stays **0.3211** — the two-variable probe the row promises.
2. **The size contrast case — exact.** size={14} section: computed root
   font-size **exactly 14px** (control auto: 16px); the title clamp
   **38.4px unmoved** both — the rem/cqi voices give the stamp nothing to
   scale.
3. **The density composition — raw-SSR + live.** `data-density="sm"`
   present in the served bytes on the density panel's hero root; the
   composed guests step down (panel CTA 12px vs the page-level control
   13px — the claimed 13→12).
4. **The one-h1 carve-out — re-derived.** The served page carries 9 `<h1>`
   elements: 1 real Intro (`data-jx-section-title`, the skeleton's
   exactly-one rule) + 8 `data-jx-hero-title` demo instances inside canvas
   demo-content scope, which verify-docs-structure carves out (its heading
   check excludes demo-content wrappers; `verify:docs` green with this
   page in-tree). The a11y table's "keep it one per page" is the CALLER
   guidance; the carve-out is the docs-page exception. Consistent.

## Gates (re-run this review)

| gate | result | tail |
|---|---|---|
| `verify:docs-universal` | exit 0 | `GREEN: 110/110 component pages render the shared universal section (110 markers)` |
| `verify:tailwindless` | exit 0 | receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim` |

(verify:docs + docs-structure green this tree as of the task-23 run; no
page edits since.)

## Process evidence

- Port :5244 empty before (lsof exit 1); dev server background task (log
  /tmp/marginalia-24-dev.log), killed by PID at the end with the
  lsof-empty receipt in the final message.
- Instruments: /tmp/marginalia-24-probe.mjs (Instrument B first attempt —
  the aria-label locator missed, kept), -probe2.mjs (Instrument B
  landed: 1280/600/1280 both flips + matchMedia), -probe3.mjs (the
  emission-form split + size contrast), -probe4.mjs (density composition
  guests). Instrument A: /tmp/marginalia-24-ssr.html (1,080,257 bytes)
  + the section-tag extraction in-line.
- Independence note: both prior reviews' positions came to me through
  the dispatch; the instruments and reads above are mine.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.
