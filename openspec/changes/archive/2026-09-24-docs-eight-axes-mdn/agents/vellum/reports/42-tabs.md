# T42 — tabs.html (CODE, the eight-axes archetype)

**Tier: 2 — archetype completion + the ARIA/keyboard receipt pass.** The page was deep and
mostly strong but pre-restructure: outline-era toc (5 entries, one pointing at a nonexistent
#types... which DID exist — the toc missed seven real sections instead), no
install/overview/see-also, flush in the wrong order, universal-props still the generic
W3-B text, and two rt-atom references that never existed in the surface map. The family
itself (the four-file composition with the 634-line keyboard/indicator engine) is untouched.

## Delivery-shape taxonomy: SELF-STAMP (own-element) + context-first composition

The root stamps the §11 carriers + `data-density` + `class:dark` on its own root div — but
the root is `display: contents` (box-tree transparent), so the stamp is INHERITED through
it rather than painted on it (the size-axis consequence below). The list/trigger/panel parts
carry their own state through context, not DOM stamps. Classified: **SELF-STAMP with a
contents root** — the stamp cascades, the box does not exist.

## The watch-items, measured (announcement discipline — REAL key events)

**The ARIA chain, proven on real interaction** (Playwright keyboard on the live demo):
- Census: 29 tablists page-wide; the demo tablist carries 4 triggers, **exactly one
  aria-selected="true"**, list `tabindex="-1"` (deliberately out of the Tab order),
  `aria-orientation="horizontal"`.
- **ArrowRight (real key)**: focus moved preview→raw AND aria-selected flipped (automatic
  activation) AND the roving tab stop followed (tabindex 0 on raw, −1 elsewhere) AND the
  indicator translated 0→92px. Second ArrowRight → diff. **End with `audit` disabled:
  stayed on diff** (the walk skips the disabled trigger — the APG skip law on real keys).
  **Home → preview** (indicator back to 0). Wrap + skip receipted in one sequence.
- **Panels**: inactive panels carry the `hidden` ATTRIBUTE with their content UNMOUNTED
  ({#if active} — element children absent, measured); each panel `aria-labelledby` pairs its
  trigger id; panels are `tabindex="0"` per APG.
- **Roving tabindex census**: exactly one `tabindex=0` per tablist at every probe state.

**Indicator transition-frame** (the timing claim, multi-sample):
- computed `transition-duration: 0.24s, 0.24s, 0.24s` (transform/width/height),
  cubic-bezier(0.2, 0.8, 0.2, 1) authored.
- **rAF-sampled transform through one selection**: x passes 0 → 25.6 → 73.9 → 80.0 → 88.5 →
  91.7 → 92 — **9 distinct mid-travel positions**, the decelerate envelope visible. (An
  immediate single mid-read measured NOTHING — the sample fired before the render; the
  on-screen rAF sweep is the honest instrument here, the T34 single-capture lesson again.)
- **RM (emulated)**: `transition-duration: 0s` and the same selection reads a SINGLE position
  start-to-end — the bar JUMPS. Both states measured on the rebuilt page.

**Density — the ONE consumed axis (not the separator/spin zero-reader class).** The root
stamps `data-density` AND the triggers ride the density kernel scope lanes
(--jx-hit/--jx-inset/--jx-gap/--jx-text): **measured, the seat trigger's min-block-size is
48px under the lg rung and 32px under sm** as the viewport crosses 48rem. The root also
PROVIDES density (inherit-then-provide; the panel's own prop beats it). The 8th-axis
carriers: ZERO --jx-*-effective readers over ui/tabs/ (grep).

**Theme-split: root-pinned alias (shape #2) + a THIRD mechanism found.** Three states
measured on the seat trigger's token chain (the seat sits OUTSIDE any canvas scope):
- light: `--jx-foreground` = `--foreground` = oklch(0 0 0);
- scoped **.dark island**: `--foreground` flipped to oklch(1 0 0) while `--jx-foreground`
  **HELD** oklch(0 0 0) — the :root alias substitutes before inheritance (frozen);
- **root-level html.dark**: the alias re-derived (oklch(1 0 0) down the whole chain).
PLUS the third theming mechanism, discovered by walking the chain: the ComponentCanvas demo
stages carry **`data-theme="light"`** on their scroll wrapper — in-page demos are
LIGHT-SCOPED BY AN ANCESTOR ATTRIBUTE, so site dark cannot repaint them (correct scoping,
not a freeze: `--muted-foreground` reads 0.3211 inside the canvas and 0.8452 above it, in
the same document, simultaneously). Attribute-scoped re-declaration joins defineVars pins
and root-pinned aliases as the theme mechanisms the ledger tracks.

## Structure (toc == DOM, LAW #18/#19)

hero (h1 ×1) → #install → #overview (new) → #tabs-demo → #indicators → #anatomy → #layouts
→ #tabs-vertical → #custom-indicator → #types → #usage → #theming → #api →
#universal-props → #accessibility → #see-also. **toc: 13 entries == DOM == SSR rail, chrome
OUT** (was: 5 entries missing seven real sections). **LAW #19**: duplicate ids NONE
page-wide. **LAW #18**: the layout runs key their letter triggers (alpha…mu, 12/12 per run —
uniqueness-guaranteed strings).

## Other fixes (all page-file)

- cx filter predicate (the Object.entries overload class — page-side, like T38/T40).
- **Two nonexistent rt atoms fixed**: `rt.tabsGradPill` and `rt.tabsMd2` were never in the
  surface map (pre-existing type errors at HEAD — the classes rendered as nothing). The
  custom-indicator paint now carries its gradient inline (matching the demo's own snippet
  documentation: `linear-gradient(90deg, var(--primary), var(--accent))`); the types-section
  wrapper uses the real `gridSm2` atom.
- universal-props rebuilt: measured rows + receipts + the density query seat (full-width
  ground, the T40/T41 lesson) + the existing panels canvas kept.
- The api section's three PropsTables preserved verbatim (see process evidence).

## Gates

- `verify:tailwindless` rc=0 — VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42`.
- `verify:docs` rc=0 · `verify:docs-universal` rc=0 (110/110).
- page-scoped svelte-check: **0 diagnostics on tabs.html/+page.(svelte|ts)** (fleet rc=1 is
  the pre-existing keyed debt: the family's own state_referenced_locally warnings in
  ui/spin/tooltip-style lanes, scenes, etc. — unchanged files).
- Ambient solos (apps/www): tabs-adjacent battery — batch2-components + docs-structure +
  docs-nav-filter = **3 files, 56/56, exit 0** (run twice: pre- and post- the last two atom
  fixes). No test/tabs.spec.ts exists (the family rides batch2) — noted. In-flight siblings
  (keyed, untouched): quill's table.html pair, the ambient vocabulary matrix.

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 95942 + listener 95975; killed BOTH by
  PID after gates; lsof AFTER: empty, **rc=1**.
- NO commits, NO pushes. Probe class/attribute injections restored in-probe.
- **An artifact-destroying fault, owned**: a bash-heredoc receipts-note edit ended with a
  "verify" line whose `open(p, 'w')` TRUNCATED the page file to zero bytes. Recovered by
  `git checkout` of the HEAD page + a SINGLE scripted replay of all nine edits with read-only
  assertions at every step (/tmp/tabs-replay.py). The replay itself then needed two fixes
  (a single-line usage block locator; a nearest-closer block extractor — my two-candidate
  version let the universal-props block swallow the api section, dropping its three
  PropsTables — caught by the PropsTable count assertion and restored verbatim). The final
  structure walk is the receipt: 15 ids exact, 87/87 divs, 13/13 SectionCards, 4 PropsTables.
- Artifacts: /tmp/tabs-probe.mjs, tabs-diag.mjs, tabs-diag2.mjs, tabs-diag3.mjs,
  tabs-final.mjs, tabs-island.mjs, tabs-replay.py, /tmp/g42-*.txt, /tmp/tabs-vite.log.

## Open questions

1. **The canvas light-pin is a FLEET posture** (every ComponentCanvas demo stage pins
   data-theme="light"?) — worth a one-line note in the theming-mechanisms ledger: demos on
   this site are light-scoped BY SCOPE, so axis/theme receipts measured inside canvases
   describe the light ground unless the probe leaves the canvas (both my T41 and T42 seats
   now ride full-width grounds outside canvases for exactly this reason).
2. The tabs family's own density comment (spin's stale-comment cousin): the root DOES stamp
   data-density while parts of the family docs describe density as stamp-nothing — same
   drift class as T41's catch, flagged for your integration-time family-comment pass.
3. The inactive-panel innerHTML contains Svelte's `<!---->` anchors — inert and correct, but
   any future "content rendered?" probe must count ELEMENTS, not innerHTML length (my own
   first metric did exactly that wrong thing; the refined element-presence check is the
   receipt).
