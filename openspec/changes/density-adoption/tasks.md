# tasks — density-adoption

> Packet-ordered (design §4/§6); the exact lists are packet-manifest.md.
> Subagents NEVER commit; the orchestrator merges by exact path list
> — overlap is a merge stop.

- [ ] 1. **Barrier** — record clean-baseline status (17ef509 proven:
  492/492 · kernel 61/61 · ruler 18/18 · matrix 37/37 · pure 65/65 ·
  manifest 297 pairs) without touching unrelated dirty files; capture
  the pre-K0 visual baselines (geometry JSON + screenshots, design §8).
- [x] 2. **K0 contract/substrate** — fallback-aware resolver + tests;
  list-item `size`→`density` rename with ALL compatibility paths
  removed (`ItemSize`/`controlSize`/`data-size`/policy `size`);
  `--jx-d-ctl-*` aliases in the canonical theme pair; the §7
  residuals (optical consumed, inset prose; grouped layout=media
  measurable rides F's media probes); adoption registry + verifier
  COMPLETE (K0 rows full, public/-serving fallback, used-value
  normalization) — `--packet K0` 4/4.
  *Gate: K0 focused tests + kernel 61 + ruler 18 + matrix 37 + the
  FULL apps/www suite green + exact source/mirror checks; no
  manifest/registry-index edits. A–E dispatch is BLOCKED until this
  checklist and F's are both green.*
- [x] 3. **F jx-pure v2** — rebuild on the control aliases; Tier-2
  renames (no aliases); range size classes die; docs/blueprint within
  F ownership; parity tests + canonical fixture.
  *Gate: complete 65/65 pure gate + F-focused tests + the FULL
  apps/www suite green + mirror equality.*
- [x] 4. **A form-text** (subagent) — exact packet-manifest A list; aliases
  replace footprint literals; density-stamped roots.
  *Gate: shell/OTP/chip/stepper hit rectangles at xs/default/lg +
  packet tests + `verify-density-adoption.mjs --packet A` green + mirror equality.*
- [x] 5. **B form-boolean** (subagent) — exact B list; physical hit
  lanes separated from glyph paint; toggle/range/color geometry
  derived; color-map structure allowlisted.
  *Gate: wrapper activation ≥ ctl-hit with squares = ctl-icon +
  toggle equations + packet tests + `verify-density-adoption.mjs --packet B` green + mirror.*
- [x] 6. **C buttons/navigation** (subagent) — exact C list; ctl-hit
  bodies with press/bevel/focus/link/pagination laws preserved.
  *Gate: packet tests + `verify-density-adoption.mjs --packet C` green + mirror equality.*
- [x] 7. **D menus** (subagent) — exact D list; trigger/frame/panel
  stamps; row hit floors; roving/dismiss/motion/alignment green.
  *Gate: four scopes + root-default + inherited-parent probes +
  packet tests + `verify-density-adoption.mjs --packet D` green + mirror.*
- [x] 8. **E data/status** (subagent) — exact E list; Table fallback
  sm without shadowing inherited lg; structural exceptions
  registered.
  *Gate: packet tests + `verify-density-adoption.mjs --packet E` green + mirror equality.*
- [x] 9. **Orchestrator merge** — per-packet `git diff --name-only`
  vs the exact P(...) lists (overlap = stop); full Vitest + all three
  wave gates + ruler + matrix + parity; payload/manifest regenerated
  ONCE with reviewed diffs; build site + blueprints.
- [ ] 10. **G Owner handoff** — default/sm/lg/xs evidence ladders +
  screenshots for the Owner's browser acceptance; Codex implementation
  review round(s); verify the K0 residual proofs remain green; archive
  with review records (G never absorbs packet repairs).
