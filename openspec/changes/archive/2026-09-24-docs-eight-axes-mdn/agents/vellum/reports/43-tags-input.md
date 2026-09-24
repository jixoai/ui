# T43 — tags-input.html (CODE, the eight-axes archetype)

**Tier: 2 — archetype completion + the law-heaviest receipt pass** (keyed-list mutations ×
combobox announcements on one surface). The page was deep but pre-restructure: no
install/overview/see-also, outline-era toc (demo/rtl listed last, universal-props missing),
the universal-props section still generic W3-A, the page-side `cx` carrying the
Object.entries overload class. The 613-line family (combobox-law chips + faceless form
bridge) is untouched.

## Delivery-shape taxonomy: SELF-STAMP (own-element)

The root `.jx-field` div carries the §11 carriers + `data-density` + `class:dark`; the parts
(bridge, label, shell, panel) read their paint from the family's own atoms and the ambient
density scope. No composed root, no observer — the separator/spin base case, on an input.

## The watch-items, measured

**KEYED-EACH double weight (the LAW #18 worst case) — HELD by construction.** The chips each
keys `${tag.value}#${index}` — the composite makes duplicate tag VALUES structurally unable
to collide (the constant add/remove/reorder of a tags field cannot produce duplicate keys).
**Mutation census on real keys** (the demo field, deltas against its own start):
- type + Enter → **+1 chip** (a new tag committed);
- committing an existing value → **+0 chips** and the existing chip carried the flash class
  (`jx-tags-flash`, border resolved, cleared within 300ms) — duplicates flash, not add;
- **Backspace on empty input → −1 chip** (the last removable);
- comma-split: inserting `deno, bun` → **+2 chips** (one commit per part).
- No hydration abort at any step (the page stayed fully interactive through the sequence —
  svelte-check and the runtime agree with the composite-key design).
One family-level flag: the SUGGESTION rows key on `suggestion.value` alone — a consumer
passing duplicate suggestion values could collide (the page's own catalog is unique). Not a
defect on this page; noted for the family ledger.

**Combobox contract (announcements, not textContent):**
- typing 's' → `aria-expanded="true"`, `aria-activedescendant="…-sug-0"` resolving to a REAL
  row id in the `aria-controls` listbox, `aria-autocomplete="list"`;
- the filtered rows (rust, websocket for 's') carry `role=option`;
- Enter commits the highlighted suggestion (chip count grew);
- chip × buttons announce **"remove svelte" / "remove typescript"** (measured live);
- chips are `role=option aria-selected="true"` inside the shell's horizontal `role=listbox`.
- Error wiring measured: the error instance's input carries `aria-invalid="true"` +
  `aria-describedby` → the rendered error id exists.

**Density — the ONE consumed axis.** The field's metrics ARE the kernel lanes
(--jx-hit/--jx-row-min/--jx-text/--jx-gap/--jx-inset): the density seat's shell hit height
measured **48px at lg → 32px at sm** across the 48rem viewport key, with `data-density`
flipping lg → sm on the root.

**Theme-split: root-pinned alias (shape #2), the spin/tabs receipt reproduced.** Chip ink
token chain: light `--jx-muted` = `--muted` = oklch(0.9551 0 0); under a **scoped .dark
island** `--muted` flipped to oklch(0.2178 0 0) while `--jx-muted` **HELD** 0.9551 and the
chip background stayed light — frozen; **root-level html.dark re-derived** the alias
(chip background flipped to oklch(0.2178 0 0)). Zero --jx-*-effective readers over
ui/tags-input/ (grep); size and color are consumed at the PASSTHROUGH boundary (§1 —
intercepted from rest, never native attributes), not as axis reads.

**EXTRA-lane by name** (the api tables): tags ($bindable), suggestions, name (the form
bridge's JSON-array submission), placeholder, label, error, maxTags, allowDuplicates,
disabled, variant (the literal own 'auto') + the Tag shape (value/label/removable). The
...rest passthrough lands on the typing input — with the §1 intercepts documented.

## Structure (toc == DOM, LAW #18/#19)

hero (h1 ×1) → #install → #overview (new) → #live-demo → #demo → #rtl → #types → #usage →
#theming → #api → #universal-props → #accessibility → #see-also (new). **toc: 10 entries ==
DOM == SSR rail, chrome OUT** (was: 7 entries with demo/rtl listed last and universal-props
missing). **LAW #19**: duplicate ids NONE page-wide. **LAW #18**: the keyed mutations above;
the suggestion rows key on value (unique in this page's catalog).

## Gates

- `verify:tailwindless` rc=0 — VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42`.
- `verify:docs` rc=0 · `verify:docs-universal` rc=0 (110/110).
- page-scoped svelte-check: **0 diagnostics on tags-input.html/+page.(svelte|ts)** (fleet
  rc=1 = the pre-existing keyed debt elsewhere — unchanged files).
- Ambient solos (apps/www): batch2-components + docs-structure + docs-nav-filter = **3 files,
  56/56, exit 0**. In-flight siblings (keyed, untouched): quill's progress fixtures,
  marginalia's system-dialog review artifacts, scribe's stack work.

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 35587 + listener 35617; killed BOTH by
  PID after gates; lsof AFTER: empty, **rc=1**.
- NO commits, NO pushes. Probe DOM injections (.dark island, class reads) restored in-probe.
- Two probe-side faults caught before conclusions: the mutation census initially counted all
  four demo fields' chips (fixed to seat-relative DELTAS — the absolute expectations were the
  bug), and the duplicate-flash sample fired after the 200ms flash expired (re-sampled
  immediately).
- Artifacts: /tmp/ti-probe.mjs, ti-probe2.mjs, /tmp/g43-*.txt, /tmp/ti-vite.log.

## Open questions

1. **Suggestion rows key on value alone** (tags-input.svelte:583) — a consumer-supplied
   duplicate suggestion value would abort hydration page-wide (LAW #18). The chips each
   already use the composite `value#index` fix; the suggestion each is the same one-word
   hardening. Family file — flagged for the orchestrator.
2. The DensityDemo + the density seat together demonstrate the consumed kernel, but the
   family has NO density own (no provider) — the demo scope does the work. Correct per the
   no-opinion slot law; noting so the next auditor doesn't call the stamp orphaned.
3. The removed `color: var(--terminal-foreground)` reads in the suggestion rows confirmed
   the terminal-token family (the select law's rows) — terminal tokens are :root aliases
   like the rest; no separate mechanism.
