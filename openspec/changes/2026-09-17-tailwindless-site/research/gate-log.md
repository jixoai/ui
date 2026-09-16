# Gate log — the change-doc rounds (tw-gate, gpt-5.6-terra xhigh)

- **Round 1 — NO-GO 5.0/10**: seven architecture blockers (spec
  conflicts, non-exhaustive census, closed-set incoherence, Pfinal
  dependency gaps, mirror/pipeline gaps, pilot not consumer-proof,
  acceptance edges). → v2: hand-rolled jx-atoms sheet KILLED (the
  living placement law's stylex lane is the one atom mechanism);
  three-tier value rule; AST gate design; Pfinal enumeration;
  consumer fixture; acceptance matrix.
- **Round 2 — NO-GO 6.0/10**: prior items resolved; six new, more
  execution-level (route transform scope, corpus≠registry fixture,
  no machine-readable contract, P0/P1 token timing, matrix not
  reproducible, lane-2 text conflict + change IDs). → v3: surface
  modules under the transform root; separator as the ONE real
  registry family + clean-consumer spot receipt;
  research/tailwindless-allowlist.json schema committed; P0 creates
  tokens; matrix pinned; legacy-window clause; IDs named. Env
  repaired (css-laws + vite-plugin deps, dist rebuilt, www npm
  install) — verify:stylex-authoring + verify:stylex-payload both
  run GREEN in this worktree.
- **Round 3 — NO-GO 5.8/10, "设计方向可继续，P0 实现门不能放行"**:
  ALL remaining blockers are that P0 is not yet IMPLEMENTED (surface
  module absent, separator not in registry/payload, allowlist is
  schema not instance, tokens not landed, receipt absent, @utility
  growth gate not built, layer-law freeze pending). The design
  direction is cleared; this change proceeds to implementation —
  the seven items ARE the P0 worklist (tasks.md), and the
  implementation review (Gate-2 style) judges the landed receipts.
  Doc nits from round 3 fixed: consumer scenario wording ("registry
  families — separator first"), Pfinal canonical-prelude freeze
  (utilities tier removed; generator + negative test), verify:print
  provenance (it IS in verify-all's managed-server phase).
- **Round 4 (implementation review) — NO-GO 6.2/10, adversarial**: the
  review attacked the gate itself and found two real holes — (1) the
  allowlist's producers[]/semantics[] metadata was tamper-able
  (canonical format checked, content not re-verified against the
  script's authoritative definitions — Codex demonstrated a silent
  GREEN after rewriting legal/scope); (2) the stylex lane was
  trusted by filename suffix (a rogue .stylex.ts producer passed)
  and THEME_PROP_RE missed fontWeight/borderRadius/boxShadow/motion
  slots. Plus (3) the pilot's lane-2 <style> block lacked
  @layer components + :where() (placement-law contract), and (4) the
  pilot receipt's provenance wasn't bound to the commit (generated
  pre-commit, paths split between repo root and the change dir).
  Confirmed non-blocking: separator three-copy/payload/consumer
  receipts all real; a REAL registry-install fixture (shadcn add
  path) is recommended for P2. → fixes: gate hardening (authority
  re-verification + AST stylex.create validation + property schema
  extension, selftests g/h/i), lane-2 migration to
  lib/site/timeline-docs.css with a browser precedence probe, and
  probe provenance (SHA-bound receipts + --verify-receipt mode).
- **Round 5 (fresh adversarial reviewer, tw-gate2) — NO-GO 4.0/10**:
  the deeper attack pass demonstrated six more real bypasses — (1)
  receipt provenance (no dirty-tree check, content tamper passes,
  artifacts existence-only with 20 paths → 10 unique files);
  (2) the pinned budget can be RAISED (identity count 1→999 stays
  green — no monotone ratchet); (3) formsByFile has no independent
  ratchet; (4) a legal stylex.create module can smuggle arbitrary
  producer exports (module-level verification exempts every export);
  (5) tier-2 gaps (animationDuration/Delay/TimingFunction missing,
  fontWeight only integer-hundreds — 550 passes, quoted keys
  unparsed) and the grandfather ledger lacks the REVERSE check
  (stale entries after migration stay green); (6) the committed
  precedence receipt is stale (bound to d41dd6e9 with 9 dirty
  files); (7) hue assertions incomplete (checked once, not per-row,
  not post-shot). → fixes dispatched: script-internal monotone
  RATCHET constants + per-file forms ratchet + per-export stylex
  verification with a registered-helpers table + animation/weight/
  quoted-key coverage + grandfather reverse traversal (gate agent);
  fail-closed verify (dirty tree, git errors, SHA-256-bound
  artifact set, summaryHash content integrity) + per-viewport and
  post-shot hue assertions + precedence receipt provenance (probe
  agent). Note the score dipped 6.2→4.0 because the reviewer went
  DEEPER, not because the gate regressed — each round's fixes are
  cumulative and the bypass surface is visibly converging.
- **Round 6 (tw-gate2) — NO-GO 7.8/10**: every attack class from
  rounds 4–5 re-verified CLOSED (ten named reds), and exactly ONE P0
  blocker remained — found by reproduction in a temp worktree: the
  probes' startServer only waited for ANY 200 on the fixed :5198, so
  a stale server let the probe's own (already-dead, 'port in use')
  vite pass readiness and measure a FOREIGN tree green. → closed
  four ways: child exit/error watch (instant red), post-readiness
  lsof OWNERSHIP check (both pids named in the abort), RANDOM free
  port for the after side (5199 before-baseline untouched), and
  --ownership-selftest with a REAL HTTP-200 occupier (the hole's
  exact shape) — both probes PASS the negative. Receipts regenerated
  on the guarded probes (86/86 + 25/25), verify-receipt green on
  both paths. Non-P0 trust boundary noted by the reviewer: local
  receipts are self-signed — CI signing/immutable manifest for
  formal releases (Pfinal consideration).
