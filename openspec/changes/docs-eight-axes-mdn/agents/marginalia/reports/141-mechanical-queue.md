# T141 — VERIFICATION BATCH: the mechanical queue (marginalia, 2026-09-24)

- **Scope**: five ledgered next-round items — probed/read, exact seats + fix shapes
  filed. **No edits, no commits** — everything below is for the orchestrator to land.
- **Vintage**: HEAD 1bdbd388 (T138 banked); probes over dev :5244 (killed after,
  lsof rc=1 empty); the ONE saved svelte-check run this turn:
  /tmp/marginalia-141-sc.log. **verify:docs rc=0** (staged scope green).

## 1. pagination :93 residual — the clean shape is a SPLIT, not a cast

Current state: two fix attempts landed (the cx `?? {}` at :61; the `as
Record<string, string>` cast at :93) and the error persists because the cast is
UNSOUND, not mis-spelled — `HTMLAnchorAttributes & { class: string }` has no index
signature, so TS refuses the direct conversion (saved-run receipt:
pagination-link.svelte **93:16**, exact TS text in the log).

Root: ONE derived `linkProps` (:72-85) is anchor-typed by contract (the child
escape is ANCHOR-form only — the file's own "single concrete element-kind law"),
and the button branch (:93) reuses it through the cast.

**FILED FIX (recommended — no cast, and it repairs a latent HTML wart):** split the
branches and enumerate the button-legal members:

```svelte
{:else}
  <button
    data-jx-page={linkProps['data-jx-page']}
    data-jx-page-current={linkProps['data-jx-page-current']}
    aria-current={linkProps['aria-current']}
    class={linkProps.class}
    onclick={onclick}
    type="button"
  >{#if children}{@render children()}{:else}{page}{/if}</button>
{/if}
```

This kills the :93 error AND stops the current `...rest` spread from landing
anchor-only attrs (`href`, `target`, `rel`, `download`-class) on a `<button>` —
invalid HTML the cast was silently laundering. Behavior caveat to note in the Props
comment: anchor-only rest attrs apply on the href branch; the button form carries
data hooks / aria-current / class / onclick. REJECTED alternative:
`as unknown as Record<string, string>` compiles but launders the type and keeps the
invalid spread. (Adjacent, out of scope: the blueprint scene
`blueprints/scenes/pagination.svelte` :26 still carries the fleet cx-overload class
— the scenes lane, not this family.)

## 2. scroll-run chips tabindex — FILED: true the teaching (two rewords)

Current state unchanged (scroll-chrome.svelte :282/:294 `tabindex="-1"`). The
design is deliberate and self-consistent: the run itself joins the Tab order
exactly when scrollable (the machine's tabindex=0 verdict stamp, WCAG 2.1.1 —
measured live in my T131), so the chips are pointer shortcuts and the `-1` is
right. The two page seats teaching the opposite are the defect:

- a11y table aria row: "Each chevron chip is a **real focusable button**; its
  accessible name is the consumer's call…" → reword to: "Pointer shortcut buttons —
  deliberately out of the Tab order; keyboard travel rides the run itself (Arrow
  keys scroll it natively). Accessible names still required."
- srun-law paragraph: "the two chevron chips as **real focusable buttons** wired to
  nudgeRun" → "the two chevron chips wired to nudgeRun (pointer shortcuts; the run
  is the keyboard path)".

(REJECTED alternative: deleting the two `tabindex="-1"` lines — it would add two
Tab stops per scroll run fleet-wide and duplicate the run's own keyboard path.)

## 3. terminal-header Components → Docs — FILED: two one-word rewords

Seats verified still stale at :193 and :205 (the literal grep misses them because
the em tag splits the phrase — search "Components" not "Components pill"):

- :193 `click the <em>Components</em> pill in the real header above` → `click the
  <em>Docs</em> pill in the real header above` (the live bar's tree trigger is
  labeled Docs — measured in my T131 probe: pills are Overview/Docs).
- :205 `click the <em>Components</em> pill above` → same replacement.

NOT stale (do not touch): :54 (`NavigationMenuTrigger current>Components` — the
composed USAGE sample legitimately shows its own site's Components trigger) and
:82 (the ASCII diagram illustrating that sample).

## 4. result warning seat — FILED: complete the union in the types canvas

Current: the types canvas (+page.svelte :122) renders success + error only; info
rides the DensityDemo at :125; warning is taught (the :122 summary names all four)
but never served — scribe's ledgered NIT, still open at this vintage (my T138
census: 4 "warning" mentions, zero rendered seats).

FILED serve shape — extend the :122 canvas grid to the full union:

```svelte
<div class={cx(rt.rsGridMd2)}>
  <Result status="success" title="Deployed" />
  <Result status="error" title="Build failed" />
  <Result status="warning" title="Budget at 90%" />
  <Result status="info" title="No changes" />
</div>
```

The warning seat renders the "!" glyph on the neutral rung (the same lookup as
info — iconBorder/glyphColor at result.svelte :132/:138) — the honest paint; no
new hue work. Folding info in completes the union in one canvas; the DensityDemo
stays as-is.

## 5. icon-button tooltip — SETTLED: the contract holds on both halves

Quill's T133 runner could not open the tooltip (synthetic + real-mouse). My clean
re-derive on my runner:

- **Keyboard focus opens it**: focusing the icon-only "deploy" button shows ITS
  tip (`role="tooltip"`, popover=manual, **visibly rendered**, describedby wired).
- **Real-mouse hover opens it too — at a viewport where the button hit-tests to
  itself** (1720×1400, button clear of the dock: `opened: true`, exactly one
  popover open).
- The failure mode both runners hit at ~1280×1000: `elementFromPoint` at the
  button's center returns the **canvas dock DIV, not the button** — the pointer
  lands on the overlay and the trigger's enter events never fire. Synthetic
  dispatch can't rescue it (the wiring is pointer-listener based).

VERDICT: no component defect; **quill's end-to-end receipt stands**. The recurring
root — the canvas dock/stage hit-test overlap at common viewports — has now hit
THREE reviewers (scribe T130 copy-click, marginalia T131 demo controls + T119 dock
note, quill T133 tooltip hover + my reruns). Recommendation to the Owner: promote
the W-next #21 lane-map note to a real ledger entry (component-canvas interior:
the dock's pointer-events geometry over the stage at ≤~1280 widths).

## Gate record

- **verify:docs rc=0** (staged scope green) — no dist changes this task (no edits).
- svelte-check: ONE run saved (/tmp/marginalia-141-sc.log), grep-scoped: the
  pagination-link **93:16 residual re-confirmed** at the current vintage (the
  queue's premise verified fresh).
- Process: port 5244 mine, killed (lsof rc=1 empty, no orphans); sibling ports
  untouched. NO commits, NO pushes, NO product-tree edits. Artifacts:
  /tmp/marginalia-141-iconbutton.mjs, /tmp/m141-diag.mjs, /tmp/m141-diag2.mjs,
  /tmp/marginalia-141-{docs,dev,sc}.log.
