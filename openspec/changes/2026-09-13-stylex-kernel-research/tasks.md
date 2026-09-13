# Tasks: stylex-kernel-research

> Status legend: [x] done · [~] in flight · [ ] todo. Research change —
> no production code tasks; every task's output lands in this folder.

## R0 — repo census (pre-change orientation)

- [x] Tailwind dependency-surface census (which packages declare it;
      class-token distribution registry/ui/routes/site; build chain;
      css-laws relationship; the context-redundancy five receipts;
      authoring patterns; www framework shape) — input to design §1.

## R1 — external intel (L1)

- [~] StyleX state-of-art dossier: versions/maintenance, non-React
      boundary, Vite path, Svelte precedents, SSR/SSG extraction,
      theming/vars, cascade+layers, perf data, capability gaps,
      adoption; + competitor quick-scan (RQ7 top-2 fallbacks deep
      enough to rank). Output: `research/external-stylex.md`.

## R2 — repo baseline (L2)

- [ ] P1 sheet attribution: built www CSS split by origin (TW
      utilities / preflight / jixoai.css / jx-pure.css / folder css /
      site modules) — bytes + rule counts.
- [ ] P2 per-page used-selector ratio on 3 representative pages.
- [ ] P3 dev cold-start + HMR timings (www scale).
- [ ] P4 recalc-surface heuristic (rule count × dynamic-class census).
- [ ] Null-hypothesis pricing notes: what sheet splitting/pruning
      would close in place (qualitative + byte estimates from P1).
- [ ] Output: `research/baseline.md` (numbers + repro commands).

## R3 — spike lab (L3)

- [ ] `spike/minimal`: Svelte5+Vite8+StyleX no-React — transform
      path, dev injection, prod output, TS. Record toolchain choice.
- [ ] `spike/ssg`: adapter-static prod CSS delivery path + per-page
      bytes (RQ1 verdict evidence).
- [ ] `spike/coexist`: TW4+StyleX; probes (i) consumer-utility-override
      (ii) Tier-2-unlayered-wins (iii) state-machine carve-out
      (iv) print whitelist — computed-style assertions.
- [ ] Stretch: kernel-excerpt re-authoring (press-button variant
      table + one law face + one density consumer) if R1 names a path.
- [ ] Output: `research/spike-report.md` + committed runnable spikes.

## R4 — theming/channel-collapse design (L4, after L1+L3)

- [ ] RQ3 fusion design: which of channels (a)–(d) collapse, which
      stay; var() reference legality settled by spike evidence.
- [ ] RQ4 distribution architecture A/B/C comparison table with
      install-surface numbers.

## R5 — migration census (L2)

- [ ] RQ6 per-family effort table (variant tables, cn() sites,
      arbitrary-value carriers, forced-colors, kernel couplings,
      affected gates); risk register.

## R6 — synthesis & decision (L4)

- [ ] Decision matrix D1–D7 with weights; GO/NO-GO verdict; if NO-GO,
      fallback ranking + revisit conditions; if GO, follow-up change
      blueprint (spec deltas it would carry, phased task shape).
- [ ] Output: `research/decision.md`.

## R7 — review gates (remix)

- [ ] Gate 1: Codex reviews THIS change doc set before execution
      (herdr async).
- [ ] Gate 2: Codex reviews the full dossier; iterate to stable
      verdict; score + reasons recorded (0–10 per repo convention).

## R8 — closeout

- [ ] Cross-check subagent friction reports; write back skill/brief
      fixes.
- [ ] Commit change folder (+spikes) on stylex-integration branch;
      archive only after Owner sees the decision (research changes
      archive with their verdict).
