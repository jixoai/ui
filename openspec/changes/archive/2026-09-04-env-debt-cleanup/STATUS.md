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
- impl review r2 (later 2026-09-04, codex gpt-5.6-terra xhigh): **6.3/10** — r1's
  fixes confirmed closed, but deeper probes found the owner-publish race, leader-only
  reaping and soft timeouts. Processed same-evening: staging+rename atomic publish
  with token-bound release (the contention probe caught release's rmSync racing a
  concurrent publish — release is now a rename of its own inode), group-liveness
  reaping (immune-descendant fixture), bounded per-group reap on every deadline,
  self-test failures routed through the spine, segment-based batch parsing with
  violation negatives, universal lock-trio schema with RED fixtures, the
  registry/test mirror enforced by verify:all step 4b (14 drifted files synced).
- the r2 follow-up chain: 8a976cf (B1-B3+S1-S4) → 1455fcf (manifest catch-up for
  the parallel line's 1fbd1e8) → 16b4cde (lock parent bootstrap, CI-only ENOENT;
  run 33886869056 green) → this commit.
- impl review r3 (2026-09-05 00:14, codex gpt-5.6-terra xhigh): **7.6/10** — the r2
  blockers independently verified closed (codex's own 8×100 lock-contention probe:
  holders=0, max=1; immune-descendant group reap ~1.3s, leaked=[]; drift bijection
  honored "no self-certification"). One residue blocker (fixed in the follow-up
  commit): the self-test's fixed marker filenames let a second run read the first
  run's readiness markers and TERM a half-booted sleeper — markers are now unique
  per run with a startup sweep; plus the r3 suggestions: Buffer.equals mirror
  comparison, registry entry retirement after reap (pid-reuse guard), the timeout
  reap participates in promise resolution (pipe-hostage 'close' can no longer
  stretch a budget), STATUS records ca3de59's CI 33892150033.
- impl review r4/r5 (2026-09-05, codex gpt-5.6-terra xhigh): r4 7.7 — the r3
  retire was reference-identity and removed nothing (call sites pass equal-valued
  ad-hoc objects; reap() never visited naturally-exited entries); fixed in 3452d53
  (key-based retire + full-registry sweep + leaked-retention + two self-test
  assertions proving both failure modes). 09d8627: the ghostty tip assets drifted
  AGAIN within hours (999241→999503 / 739911→739918) — the documented emergency
  catch-up, offline sentinel GREEN. **r5: 9.2/10 READY** — codex's independent
  probes: ad-hoc and natural-exit retire both leave entries=[]; 3× self-test
  (9 fixtures each) with zero marker/lock/staging residue; 8×100 lock contention
  holders=0 max=1; drift 179/179; its own full-harness run hit the 600s npm
  budget under hostile network and the hard-budget spine terminated in ~4s,
  fail-loud, zero residue — the B3 contract proven in the wild. CI 33896492498
  green end-to-end on 09d8627.
