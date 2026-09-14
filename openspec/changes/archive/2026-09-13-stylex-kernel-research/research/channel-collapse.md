# R4 — the channel-collapse design (channel-collapse.md)

> Orthogonal intents: (1) answer RQ3 against the §1.2 inventory —
> which styling surfaces COLLAPSE under StyleX, which are law and
> stay; (2) the per-architecture distribution comparison for RQ4/D3
> (design-level; the 40-build measurement rides L3c on the corpus
> payload). Evidence base: r0-census receipts, L1 external intel,
> L3a spike (D2-08/09/10 prove var-consumption through stylex), F8
> (difficulty-not-cost), F9 (lawful layer order). Written by the
> orchestrator, 2026-09-13.

## §1 The collapse map

```
CHANNELS — KERNEL MARKUP VIEW                 today          StyleX GO
─────────────────────────────────────────────────────────────────────
(a) TW token utilities (text-primary…)        markup         ✂ COLLAPSES
    → typed atoms consuming sheet vars
    → @theme inline mapping region retires
      from the kernel sheet (jixoai.css:782-843, ~61 lines);
      consumers wanting token utilities for THEIR OWN markup
      generate their own @theme from the token sheet (a
      documented TW4 snippet — the sheet stays the single source)
(b) arbitrary-value var carriers               markup         ✂ COLLAPSES
    (px-[var(--jx-inset)] etc., 66+ sites)     → stylex.create values
    → the var bridge dies in markup; density scopes keep
      working (vars inherit through the DOM; the data-density
      attribute channel is spec law and untouched)
(c) law projections (.jx-control / mounts)     classes        = STAYS (law)
    13 laws, 5 projections, ONE typed source — projections are
    not duplication; kernel components consume mounts/aliases
    exactly as today; serializers untouched
(d) icon dual supply (virtual ≡ jx-pure slot)  2 copies       ~ partial
    the duplicate exists FOR the TW generate phase; kernel atoms
    consume --jx-icon-* vars directly; the sheet copy retires
    when the last TW-context needing generate-phase visibility
    is gone — exact timing deferred to implementation (site
    docs pages stay TW in phase 1, so BOTH copies initially stay;
    the retirement is queued for the site-migration phase)
(e) runtime channels (density 2-channel,       DOM/JS         = STAYS (law)
    hue, glass stamps, typography vars)        stamps         D2-08 proves
                                               inline-var precedence
                                               through stylex paint
(f) folder css (@container, keyframes-         css files      = STAYS (placement
    geometry, state residue, print whitelist)                law #2; StyleX
                                               has no container
                                               queries — L1 §9)
```

**Markup expression channels: 3 → 1** (typed StyleX atoms) + the
law-projection consumer channel + runtime stamps. The true-
duplication class (a)+(b) MERGES into one typed path; no fourth
channel is introduced. Token source remains THE SHEET (engine-
invariant OKLCH blocks); StyleX wraps it with typed accessors —
`var(--primary)` references are compile-proven legal (L1 §6) and
behavior-proven in D2-08/09/10.

## §2 What this means for the Owner's original complaints

1. **Render performance** → the per-page irrelevance measured by P2
   (68–78%) is structural to TW4's union-of-all-sources scanning
   (R2b recovered ~4% and regressed docs pages); atoms ship with the
   import graph, so per-page CSS becomes relevant-by-construction.
   The law-sheet share (~49%: jx-pure 103.2KB + jixoai tokens
   43.6KB) is engine-invariant and stays shared BY DESIGN.
2. **Context redundancy** → (a)+(b) collapse; the @theme mapping
   region retires from the kernel sheet; the surviving channels are
   law (density two-channel, law projections) or runtime stamps —
   each with a spec-law justification, none duplicated.

## §3 Distribution architectures (RQ4/D3 design-level)

| vector (Δ vs TW4 today) | A: consumer wires unplugin | B: @jixoai/ui-vite-plugin absorbs | C: precompiled css + classes |
|---|---|---|---|
| packages | +2 (stylex, unplugin; babel chain rides) | +1 (the plugin; its closure COUNTS per F5) | +1 (@stylexjs/stylex runtime for styleq/dynamic) |
| config files / lines | same vite.config / +5–8 | same vite.config / +1 | same vite.config / +1 css import |
| boilerplate | ~10 lines HMR snippet, HAND-COPIED | 0 (generated: F9 entry + layer statement + HMR wiring) | 0 |
| silent footguns (F9 evidence) | layer-order inversion, shorthand drops, $lib breakage — ALL live at the consumer | engineered out (the plugin emits the lawful order) | class-name coupling to OUR build artifacts |
| payload parity gates | source-copy unchanged | source-copy unchanged | hybrid: source + generated css per item — registry-payload-parity rework |
| rollback | per-family source revert | per-family source revert | per-family source revert + css artifact |

Design-level reading: **B is the only architecture that both fits
the vectors and deletes the F9-documented footgun class**; C's
distribution-model change is a bigger contract than this research
can sanction alone. L3c measures all three for real on the corpus
payload; the D3 verdict reads the measurement, not this table.

## §4 Open items queued for the follow-up change (if GO)

1. Icon dual-supply retirement timing (site-phase dependency).
2. Consumer-side @theme generation snippet (for consumers who keep
   TW for their own markup) — architecture B's generator owns it.
3. The mix-helper glue (Svelte 5 static+spread class non-merge tax)
   — a small lib item, part of the kernel runtime.
4. Shorthand→longhand discipline: the follow-up change should set
   babel `propertyValidationMode:'throw'` in kernel builds so a
   dropped shorthand is a BUILD error, never a silent paint loss.
