# The migration playbook — every agent brief points here

## The two pilot references (READ FIRST)

1. **Component family**: `registry/files/ui/separator/` —
   `separator.stylex.ts` (static atoms; structural constants lawful,
   theme-able values ride `var(--jx-*)`/typed tokens), the component
   consuming them via the `cx()` joiner ( NEVER a raw
   `class={styles.x}` interpolation — stylex members are objects,
   raw interpolation renders `[object Object]`), the css shrunk to
   lane-2 residue (pseudo/at-rule/mask geometry only).
2. **Page/surface**: `apps/www/src/lib/surface/timeline-docs.stylex.ts`
   + `lib/site/timeline-docs.css` — atoms under the transform root +
   registered semantic rules (canonical layer statement, `@layer
   components`, `:where()` wrappers, native pseudo for hover/focus,
   semantic media rules for breakpoint parity).

## The value rule (tier-2 — the gate enforces, selftest reds)

- STRUCTURAL constants: lawful (`display: 'flex'`, `flexDirection`,
  `position`, atom-local geometry like `blockSize: '1px'`, gradient/
  mask geometry strings).
- THEME-ABLE values MUST ride tokens: color roles, spacing steps,
  font sizes/tracking/lineHeight (numeric too), fontWeight (1..1000
  both forms), radii, shadows, motion duration/easing/animation*.
  A literal in these slots is RED unless it sits in the frozen
  TIER2_GRANDFATHER ledger — do NOT add new ledger entries; promote
  the value to a token step (jixoai.css "site voice scale" + typed
  tokens) if no step fits — but for WAVE batches, PREFER existing
  steps (report missing steps instead of editing the shared sheets;
  the orchestrator applies token additions serially between waves).
- Existing sheets already carry: `--jx-text-micro/label/label-lg/
  small/base`, `--jx-track-label/wide`, `--jx-space-{4..40}`,
  `--jx-hairline`, `--jx-shell-w/--stage-w`, color roles via
  `--muted-foreground` etc., `--jx-icon/--jx-gap/--jx-stack` density
  steps.

## The composition rules

- `cx(...)` joiner (separator's, exported from the family's stylex
  module or the surface module) for multi-atom joins + conditional
  members. `cn()` still exists (its tailwind-merge core is a no-op
  once utilities are gone) — new code uses `cx()`; leave existing
  `cn()` call sites that compose ONLY non-utility classes alone
  (W4 swaps the seam).
- Variant maps (VARIANT_CLASS): each variant's classes become atoms;
  the map maps variant → atom group; dynamic class STRINGS built
  from data must resolve to registered identities (the gate's
  producer rules) — prefer mapping to atoms at module scope.
- `class:` directives and ternaries: the atom expression lands in
  the class attribute's expression slot — static semantic classes
  stay in the static part (Svelte scoped-style pruning bites
  classes hidden inside expressions — pilot gotcha #4).
- Responsive seams: `sm:`/`lg:`/`min-[N]` → semantic media rules at
  the ORIGINAL thresholds (breakpoint parity — pilot ruling);
  `hover:`/`focus:` → native pseudo inside the semantic rule (NOT
  JS data-attr).
- Arbitrary values (`text-[13px]`, `max-w-[62ch]`): map to the
  nearest EXISTING step; report unmappable values.

## The mirror + integration discipline (agents)

- `registry/files/ui/<fam>/**` ⇄ `apps/www/src/lib/ui/<fam>/**` must
  end byte-identical (cmp) — including the new `.stylex.ts`.
- The tokens import in registry-tree stylex modules:
  `../../tokens.stylex` (the bridge copy resolves it; www mirror
  resolves its own) — follow separator exactly.
- Agents DO NOT touch: registry.json, migration-ledger.json,
  research/tailwindless-allowlist.json, jixoai.css/tokens sheets,
  package.json, any build. Report: files changed, tokens MISSING
  (name+value+where), ledger entries needed, semantic rules
  proposed, per-file identity before→after (from
  `node scripts/verify-tailwindless.mjs --check` output or the
  allowlist), receipts (batteries run per package where they exist).
- The orchestrator serially: applies token steps + ledger +
  registry.json entries, rebuilds payload + manifest, re-pins the
  allowlist (decreases only), runs the full chain.
