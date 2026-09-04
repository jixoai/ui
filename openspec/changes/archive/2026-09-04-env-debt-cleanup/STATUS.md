# STATUS — 2026-09-04-env-debt-cleanup

**DONE — implemented, verified, merged to main (f118306 + b498f81).**

- codex change review: 8 rounds, 5.5 → 7.2 → 7.7 → 7.8 → 7.6 → 7.2 → 7.6 → **8.7 READY**.
- waves: pages A (12) + B (11+1) — 24 files, exactly one line each, all rows from the
  matrix fixture; Purposes C + D — six specs, keyword anchors all hit.
- drift pin: docs-ambient-vocabulary.spec.ts **171/171** (schema / per-row pins /
  own↔defaults lock / synthetic-source negatives / bijection / meta-side / exemptions).
- verify:shadcn-add: **×2 exit 0, 53 checks each, 5 cases ALL GREEN** (first since
  2026-09-02); version chain printed 4.19.0/4.19.0; five frozen contract assertions.
- verify:all: green through verify:docs; verify:meta stops ONLY at the adjudicated
  card-grid in-flight staleness (the foot-mode agent's uncommitted battlefield —
  pre-existing, untouched); verify:print 35/35 standalone.
- full serial vitest **2011/2011**; openspec --specs 15/15, six placeholder warnings gone.
- process notes: two gate runs were mutually wiped by a concurrent deployment-agent
  instance — root-cured with the single-instance scratch lock (a lesson from
  orchestrating parallel agents in one worktree); npm cache corruption (277 entries)
  was repaired by the deployment agent mid-flight.
- carry-overs: none from this change. Adjacent fixed in the same push: the vite-plugin
  package-lock lucide sync (b498f81, heals all four CI workflows) + the
  B-consumer-icons baseline recording fb665cf's landed growth.
