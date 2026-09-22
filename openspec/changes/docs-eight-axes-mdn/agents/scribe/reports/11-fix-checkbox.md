# scribe task 11 — fix checkbox (docs-eight-axes-mdn)

Agent: scribe · 2026-09-22 · consolidated fix round, main dir, no commits.
Files: `apps/www/src/routes/docs/components/checkbox.html/+page.svelte`,
`apps/www/src/lib/ui/props-table/docs/checkbox.docs.ts`,
`apps/www/test/props-table-meta-drift.spec.ts`,
`apps/www/test/canvas-same-source.spec.ts` (3 snapshot stubs).

## Per-finding fixes

1. **MAJOR (quill) — the bare contrast cell had no stamps.** The wrapped
   contrast cell now passes `density="lg"`: SSR shows its root carrying
   `data-density="lg"` + `--jx-density-coefficient: 1`, and the box steps
   to the lg rung — the prose's "where the stamps land" promise is now
   byte-true and visually legible (24px wrapped vs 20px bare twins).
   Prose updated to state the pass.
2. **MAJOR (marginalia) — the stale tailwind-era form drawer.** The
   drawer file ran `class="flex flex-col gap-4"` /
   `text-muted-foreground text-[12.5px]` while the stage runs cx(rt.*)
   atoms. Rewritten to the stage's real composition: `cx(rt.col16)`,
   `cx(rt.wrapRow12, rt.pt4)`, `cx(rt.inkMuted, rt.text125)`, with the
   cx idiom + `rt` import defined in the sample so it stays
   copy-paste-runnable. Extraction was the alternative, but the form's
   interactive payload (`onsubmit={onSubmit}`, `{#if result}`) are page
   consts the F4 self-containment guard rejects — the hand file is the
   honest fallback, now mechanism-matched. Kept un-id'd (an id would
   claim same-source falsely).
3. **NIT (marginalia) — the density co-stamp story.** Density row now
   states the co-stamp AND its activity: a named rung stamps
   data-density AND co-stamps `--jx-density-coefficient: 1` — an active
   pin inside the scope (every channel composes base × coefficient, so
   the pin stops any OUTER coefficient at the boundary; an outer ×3
   wrapper moves a pin-less box 24 → 72px) — that is what makes explicit
   rung = exact rung true. The NUMBER-lane inertness clause retained
   (declaring-element law, measured). TokenTable's coefficient row moved
   the pin wording into the VISIBLE default cell — discovered en route:
   **TokenTable never renders its `description` field** (component
   renders name/default/source only; the field is dead surface —
   reported as a separate observation, affects every page's token
   descriptions incl. alert's).
4. **NIT (marginalia) — partial same-source.** states, query, and bare
   canvases now carry ids and compose their drawers via
   `usageFile`/`resolveRawCode`; the hand-mirrored literals are deleted.
   axes already id'd. The form canvas deliberately stays hand (see 2).
   Checkbox was already a PILOT; the snapshot count grew 1 → 4
   (states/query/bare added, `-u` once, then green).
5. **NIT (marginalia) — the unreachable CHECKBOX_DOCS.density text.**
   Removed the override (the row splits into the shared Universal
   section whose description comes from the schema — 0 SSR matches
   confirmed before removal). Drift-spec conscious snapshot edits: the
   checkbox LEGACY density row now rides AXIS_ROWS (the select
   precedent, comment recorded) and the curation-accountability matrix
   drops `density: ['description']`. The curation header documents the
   retirement.
6. **NIT (quill) — --corner-shape wording.** Both the shape row and the
   supply-only prose now read: `var(--corner-shape, bevel)` — an
   undeclared customization seam whose bevel fallback wins today; the
   axis never bridges it.
7. **NIT (quill) — bare drawer/stage name drift.** Died with same-source:
   the bare drawer IS the stage markup (bare-plain / bare-inert
   throughout); `task-alpha`/`task-beta` are gone from the SSR.

## Receipts

- **SSR (:5243, 200): 10/10** — fix 1: wrapped-contrast root carries
  `data-density="lg"`; fix 3: co-stamp row prose + visible token pin;
  fix 6: seam wording ×2; fix 2: `cx(rt.col16)` in the drawer, stale
  tailwind classes 0 hits; fix 4: three composed drawers present; fix 7:
  bare stage names unified, task-alpha 0 hits; marker ×1.
- **One mid-flight self-catch**: the TokenTable `description` field is
  never rendered by the component — my first pin wording landed there
  and greped 0 in SSR; moved to the visible `default` cell. The dead
  field is filed as an observation for the orchestrator (it silently
  eats every page's token descriptions).
- **One wiring miss self-caught**: the states canvas still pointed at
  the deleted `checkboxStatesDemo` (500 on first fetch) — wired to
  `statesFiles`.

## Gates

| gate | result |
|---|---|
| canvas-same-source solo | **72/72** (69 + 3 new breadcrumb-of-the-round snapshots; `-u` once, then green) |
| props-table specs solo (drift + render + composition) | **38/38** — density retirement consistent across curation + LEGACY + matrix |
| full four-file spec run | **115/115** |
| verify:tailwindless | receipt UNMOVED — files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 (pre- and post-build) |
| verify:docs-universal (fresh build exit 0) | **110/110** (110 markers) |
| verify:docs | ✓ staged scope green |
| openspec validate --strict | valid |
| page-scoped svelte-check | total 1648 (concurrent-tree drift); my files = the same pre-existing set (checkbox page cx idiom :83; meta-drift ×2; render-spec ×5 `.cells` idiom — my lines add zero) |

## Processes

- Port 5243: lsof empty before start; dev server killed by listener PID
  + wrapper PID — `listeners=0 wrappers=0` receipt; build AFTER the
  kill (exit 0).
- Scratch /tmp only: scribe-11-dev.log, -ssr.html, -build.log,
  -svelte-check.log. Repo writes: the four files above + this report +
  experience.md.
- Multi-writer discipline held: re-read both spec files immediately
  before editing (canvas-same-source and meta-drift are shared); all
  snapshot edits are checkbox-scoped.
- Self-caught: (1) stale `checkboxStatesDemo` reference after the
  drawer refactor (500 → wired to statesFiles); (2) the dead
  TokenTable description surface (receipt grep saved the wording from
  being invisible).
