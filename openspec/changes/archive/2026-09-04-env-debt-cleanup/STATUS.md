# STATUS — 2026-09-04-env-debt-cleanup

**DONE — implemented, verified, merged to main.**

- codex change review: 8 rounds, 5.5 → 7.2 → 7.7 → 7.8 → 7.6 → 7.2 → 7.6 → **8.7 READY**.
- the FULL merge chain on main: f118306 (implementation) + b498f81 (vite-plugin
  lock sync) + cf00ce6 (card-grid meta catch-up — the adjudicated in-flight
  battlefield resolved as a legitimate local scope expansion) + cbaf4bf + dde8fbc +
  2abb6bf (ghostty tip re-pin, manual catch-up) + a8e5482 (verify-print portable) +
  3a0e613 (version-chain reorder) — the deployment unblocking series.
- CI: run **33879892495 conclusion=success** — the composite gate green END-TO-END
  for the first time in the change's life (the card-grid staleness that once stopped
  verify:meta was fixed by cf00ce6 before that run); Pages deployed, live URLs 200.
- waves: pages A (12) + B (11+1) — 24 files, exactly one line each, all rows from the
  matrix fixture; Purposes C + D — six specs, keyword anchors all hit.
- drift pin: docs-ambient-vocabulary.spec.ts green (schema / per-row pins /
  own↔defaults lock / synthetic-source negatives / bijection / meta-side / exemptions).
- verify:shadcn-add: **×2 exit 0, 53 checks each, 5 cases ALL GREEN** (first since
  2026-09-02); version chain printed 4.19.0/4.19.0; five frozen contract assertions.
- full serial vitest **2011/2011**; openspec --specs 15/15, six placeholder warnings gone.
- process notes: two gate runs were mutually wiped by a concurrent deployment-agent
  instance — root-cured with the single-instance scratch lock (a lesson from
  orchestrating parallel agents in one worktree); npm cache corruption (277 entries)
  was repaired by the deployment agent mid-flight.
- carry-overs: none from this change.
- impl review (2026-09-04 later that day, codex gpt-5.6-terra xhigh): **6.0/10 REVISE**
  — three contract-level findings (scratch-lock TOCTOU, process-group reaping gaps,
  bijection Set-degeneration + post-archive spec path) were accepted and fixed in the
  same day's follow-up commits; see the drift spec's bijection section and
  scripts/lib/child-lifecycle.mjs + the --lifecycle-self-test mode for the re-verified
  state.
