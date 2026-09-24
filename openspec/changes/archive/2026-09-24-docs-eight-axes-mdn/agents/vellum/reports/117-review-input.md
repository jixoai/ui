# T117 — SECOND REVIEW input.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 104 1st-review report opened FIRST,
  including her T106 record correction that withdraws her own LOW-1; landed items
  verified byte + served; headline receipts re-derived; fresh axes. NO commits,
  NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/input.html/` over the input family,
  served live on :5242, dist @ HEAD f4a36087.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 0 NIT.** **Tier ruling: Tier 2** (per
  dispatch). Her MINOR-1 (toc) LANDED as the 13-entry rebuild; MINOR-2 (radius) LANDED
  as the stamped-never-consumed teaching; LOW-1 WITHDRAWN by her own T106 correction
  (verified against the rendered table); LOW-2 (dock rung names) TRUED; LOW-3 (five
  family type errors) CLOSED MIRRORED. My LOW: the rebuilt toc's two leading entries
  are dead links in the live DOM.

## Her findings — disposition of all five

1. **MINOR-1 (toc 9-for-11, order stale) — LANDED as the rebuild.** +page.ts ships
   **13 entries in DOM order** (comment: "task 104: the rail now walks the page
   top-to-bottom — capabilities and picker-bridge were unrail-ed"); the served rail
   renders all 13, capabilities + picker-bridge included. Residual: see my LOW 1.
2. **MINOR-2 (radius stamped-never-consumed, demo misleads) — LANDED as the teaching.**
   Source :803: "Radius is STAMPED, NEVER CONSUMED (measured, task 104): the field
   stamps --jx-radius-effective while the shell hardcodes border-radius: 0 and no
   family sheet reads any --jx-radius-* var". Served re-derive: the universal seat's
   root stamps **`--jx-radius-effective: var(--jx-radius-medium)`** and both the shell
   and the native input compute **border-radius 0px** — the stamp without a consumer,
   exactly as now taught.
3. **LOW-1 (api table omits the axes) — WITHDRAWN (her T106 record correction), and I
   verified the withdrawal against the RENDERED surface**: the api section renders
   **two tables — 18 component rows + 8 universal-axis rows** (the [18, 8] census
   shape her correction measured). The fold phrasing: the two-table fold is the
   PropsTable `universal` channel; the page's own api summary describes the
   component-owned additions while the second table carries the axes — no omission
   exists to fix. Adding axis rows (her original fix shape) would have duplicated
   rendered rows; correctly not landed.
4. **LOW-2 (dock rung names stale) — TRUED**: source :781 now reads "auto / small /
   medium / large — the lane vocabulary".
5. **LOW-3 (five family type errors) — CLOSED, MIRRORED.** :174 now omits 'onselect'
   from the HTMLInputAttributes extend (the native-event collision severed);
   `chrome?: ControlChrome` declared (imported from control-chrome.svelte, :143/:273);
   the cx overload and both disabled-nullity seats gone — svelte-check on the family:
   **0 ERRORS, only the recorded :349 provideUniversalLanes warnings octet** (her
   "untouched alongside", exactly). Registry twin byte-mirrors the fix (twins scan: 0
   diagnostics).

## Headline receipts — re-derived

- **The count field**: native-setter drive of 你好𠀀👍 → DOM length **6 UTF-16 units**,
  readout **"4 / 20"** — the code-point claim, digit-true (my independent re-derive of
  her probe receipt).
- **Esc-on-search**: typed "grep me", real Escape → DOM value **""** ✓.
- **The [18, 8] rendered-table shape** (above) — the claim surface audited where it
  renders, per the banked lesson.

## LOW 1 — the rebuilt toc's two leading entries are dead links in the live DOM

The 13-entry toc opens with `{ id: 'true', label: 'The field, truly' }` and
`{ id: 'deploy', label: 'Deploy field' }` — but **no live element carries those ids**.
The only `id="true"` / `id="deploy"` occurrences in the served bytes are **code-sample
text** (the error-wiring demo's `id="true" aria-describedby="s40-error" /` snippet and
the datetime demo's `id="deploy" type="datetime-local" /` usage line) — my getElementById
probe returns null before AND after a full-scroll mount pass. The remaining 11 entries
(the real sections) all resolve. Net: the two flagship-demo entries never navigate (and
would have no scrollspy extent if they did — the ids name no section). Fix shapes: give
the two hero/demo wrappers those slugs, or drop the two entries to an 11-entry section
rail. Scored LOW: 11 of 13 links work, the order fix and the two previously-unreachable
sections (the actual finding) serve correctly.

## Fresh axes (beyond her report)

- The rendered-table withdrawal verification ([18, 8]) — the first audit of her
  corrected instrument on this page.
- The dead-link census of the rebuilt rail (getElementById across full-scroll mount).
- The stamped-never-consumed paint pair (stamped var present, computed 0 at BOTH the
  shell and the native element).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD f4a36087, rebuilt this session) | **GREEN rc=0** |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check page-scoped | **0 diagnostics**; family **0 errors** (the five seats closed; the :349 warnings octet recorded, untouched) |
| registry twins | **0 diagnostics** (mirror clean) |

## Process evidence

- Port **5242**: wrapper (/tmp/t117-wrapper.pid) + listener 27154; lsof-empty before;
  after gates killed BOTH by PID; `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines,
  rc=1 — port EMPTY after**. Siblings 5241/5243/5244/5230 untouched.
- NO commits, NO pushes. Drive states died with the probe browser.
- Probe faults owned: (1) my first radius-seat scan ran before the deep sections
  scroll-mounted — re-ran post-scroll; (2) my first "dangling" read fired at page top —
  the full-scroll re-check proved the ids are absent from the LIVE tree entirely
  (code-sample text), upgrading the observation to the LOW above; (3) the count drive
  needed the native-setter form (the standard lesson).
- Artifacts: /tmp/t117/{probe-a.mjs,probe-a2.mjs,a.json,a2.json,input-ssr.html,
  gate-docs.log,gate-universal.log,scheck.log,lsof-after.txt}.

## Open questions

1. The two dead rail entries (my LOW): slug the demo wrappers or drop to 11 — page
   authorship, orchestrator's call.
