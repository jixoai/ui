# T41 — spin.html (CODE, the eight-axes archetype)

**Tier: 2 — archetype completion + measured axes.** The page was rich but pre-restructure:
outline-era toc (listing a **nonexistent #types** and missing half the page), no overview,
no live-demo id, flush in the wrong order, the universal-props section still the generic
W3-B text with no measured rows and no seat. The family itself (spin.svelte 541 lines, the
flat CSS engine) is untouched.

## Delivery-shape taxonomy: SELF-STAMP (own-element), two postures

Carriers + `class:dark` + `data-density` land on the OUTERMOST root (the inline span / the
wrap grid div) — never on the SMIL-driven svg (its binding belongs to the engine). Same
base case as separator, with a two-posture wrinkle: the wrap posture adds `aria-busy` and
the scrim owns pointers.

## The watch-items, measured

**Pulse-in-pixels (the motion discipline).** The observable channel is OPACITY and only
opacity:
- rAF-sampled computed opacity of a mid frame oscillates the full range (max 1, 7/32
  samples nonzero on the growVertical seat — its 'both' slot shape holds ~a quarter cycle);
  **computed-style negatives**: `transform: none`, `background: transparent`,
  `transition-duration: 0s` — no gradient, no transform, no transition anywhere.
- The flat engine's parameter fill, computed: `animation-name:
  jx-spin-f10-i120-l120-both`, duration 1.2s (10 frames × 120ms), delay **−0.84s**
  (negative = the timeline is mid-cycle at mount), timing linear, infinite. The shared
  registry: exactly **one** `<style data-jx-spin-frames>` in head holding **12** accumulated
  @keyframes rules (the dots rule `jx-spin-f10-i80-l160-end` among them) — idempotent by
  name, as authored.
- **RM measured live, BOTH named channels**: emulated reduce → text frame animation-name
  'none' with the base face (frame 0 opacity 1, frame 5 opacity 0 — static, zero JS);
  simultaneously the svg lane's `animationsPaused()` flipped **true**, and back to **false**
  on un-reduce — the matchMedia listener pauses the SMIL clock live.
- SSR: all frames prerender in the HTML (first paint = frame 0 via the base rules).

**Theme-split: the root-pinned alias, separator's shape #2 — now with numbers.** The ink
reads `--jx-primary: var(--primary)` (:root alias; 116 `: var(` chains in the token table —
the grep recipe). Measured: light `oklch(0.6489 0.237 154)`; under a **scoped .dark island**
the inherited `--primary` re-derived to the drifted dark value (oklch 0.7044-family) while
the computed ink **HELD** 0.6489 and `--jx-primary` stayed 0.6489 — **frozen** (the alias
substitutes at :root, before inheritance); under **root-level html.dark** the ink flipped to
`oklch(0.7044 0.1872 150)` — re-derived. Same drift numbers as progress's frozen-ink
instance. class:dark stamps for composed descendants.

**Delivery of the seat — the lanes-vs-passthroughs boundary, again.** spin's `size` is the
family's OWN hybrid (`number | string`): the defaults doc records "named/auto/query lanes
are NOT adopted on the loader", and typecheck rejects QueryResult on it. My first seat
(size={query(...)}) therefore stamped NOTHING (silently — dev runtime does not typecheck).
The seat moved to the **density lane's rung stamp**: `query<{ md: DensityLane },
DensityLane>({ md: 'large' }, 'small')` (the alert page's two-generic form) — **data-density
"lg" at 1280 → "sm" at 600**, measured; the flip receipts the machinery while nothing in the
family reads the lane. Also visible in the same receipt: the scaffold's ambient rungs (xs
runners in the toc rail, default in the header) — the broadcast working fleet-wide.

**Other receipts**: omission census (bare inline posture = `role` + `aria-label` + class +
data-jx-spin-inline only — no density attr, no style attr when carriers resolve absent);
density managed stamp (`data-density="sm"` under density="small"); the ruler (absent-size svg
paints `width: var(--jx-icon); height: var(--jx-icon)` inline — attrs cannot carry var());
whitespace-pre (`white-space: pre` computed — the box never breathes); grep receipts (zero
--jx-*-effective readers over ui/spin/). **LAW #19**: duplicate ids NONE. **LAW #18**: the
gallery each is keyed by name and mounts 11/11 cursors.

## Structure (toc == DOM)

hero (h1 ×1) → #install → #overview (new) → #live-demo → #gallery → #linger-trail →
#svg-lane → #postures → #usage (moved) → #theming → #api → #universal-props →
#accessibility → #see-also. **toc: 11 entries == DOM == SSR rail, chrome OUT** (was: 5
entries, one pointing at a nonexistent #types).

## Gates

- `verify:tailwindless` rc=0 — VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42`.
- `verify:docs` rc=0 · `verify:docs-universal` rc=0 (110/110).
- page-scoped svelte-check: **0 diagnostics** (two found mid-task were mine and fixed: a
  literal `<style …>` inside the receipts prose parsed as a real element; the query seat's
  generic needed the two-parameter form `query<{ md: DensityLane }, DensityLane>(…)` — the
  alert page's precedent).
- Ambient solos (apps/www): batch2-components + docs-structure + docs-nav-filter = **3 files,
  56/56, exit 0**. There is NO test/spin.spec.ts (the family rides batch2) — noted so the
  "missing file" exit is not mistaken for a red gate. In-flight siblings (keyed, untouched):
  quill's table.html pair, the ambient vocabulary matrix.

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 69886 + listener 69917; killed BOTH by
  PID after gates; lsof AFTER: empty, rc=1.
- NO commits, NO pushes. Probe media emulations restored in-probe.
- Artifacts: /tmp/spin-probe.mjs, spin-diag.mjs, spin-verify2.mjs, /tmp/g41-*.txt,
  /tmp/spin-vite.log.

## Open questions

1. **Spin's size vs query()**: the family deliberately does not adopt the named/auto/query
   lanes on `size` (recorded in spin-defaults) — but the docs page previously invited
   `query()` nowhere and my first seat tripped on it. If a future family wants a responsive
   size seat, that's a FAMILY contract change (adopt the lanes), not a page trick.
2. The defaults file's density comment ("the indicator never stamped data-density and does
   not start now") is STALE — the component stamps data-density on both postures today.
   Family-doc drift, one line, left for the orchestrator (family file, not my page scope).
3. The keyframes registry accumulates one rule per distinct (frames × interval × linger ×
   type) set — 12 on this page — bounded by rendered variety, but a page rendering hundreds
   of custom timings would grow it linearly. Probably fine forever; noting the bound.
