# T107b — SECOND REVIEW icon.html (quill)

**1st:** marginalia 88, PASS 0M/1m/0L/0N, Tier 1 (BOARD line 18). **2nd protocol:** her
report opened FIRST; landed items verified at served-DOM + source layers; headline receipts
re-derived with my own instruments; fresh probe axis hunted — and it produced a real
correction to her three-layer table. Target: `apps/www/src/routes/docs/components/icon.html/`
(scribe's CODE, legacy explicit-props W4) over the icon family.

## Verdict: PASS — page closes, Tier 1 confirmed (1 correction to her table's third row, 1 dev-mode flag — neither a page defect)

## Landed items — verified

1. **MINOR 1 (the rail entry)**: authored +page.ts toc now **6 entries** (type-safety /
   async-paths / usage / accessibility / universal-props / api); the served rail carries
   exactly those 6; all 6 anchors resolve on the DOM; the universal-props section serves
   with its canvas seat. **FRESH (behavior)**: clicking the landed rail link navigates
   (`#universal-props`) and scrolls the section into view — the fix works, not just exists.
2. **The :106 overload — gate zero**: full fleet svelte-check (fresh dist, HEAD da166454 ≥
   the 8254dd5c dispatch floor): **icon.html + +page.ts: 0 diagnostics** — and the
   headline her report led with HOLDS after the f92d6555 class closures: **ui/icon family
   ERRORs = 0** (9 standing `state_referenced_locally` warns, the W3-D3 class, unchanged).

## Her headline receipts — re-derived, concordant

- **Size ladder** (eye, keyed `(px)`): rendered widths 12/16/24/32 served.
- **Stroke ladder** (braces, 20px): stroke-width 1.5/2/2.5 served.
- **aria-hidden page-wide**: every rendered `svg[data-jx-icon]` carries `aria-hidden="true"`
  (census, 0 misses, >100 svgs).
- **The generated-set gate**: `node scripts/gen-icon-set.mjs --check` → GREEN fresh, "52
  icons, 1 chunk(s)" — matches the committed artifact; registry ⇄ www gen files `cmp`
  IDENTICAL.

## FRESH AXIS — the dock's option count is a dev-scanner transient, not a designed layer

Her three-layer table: union 54 / artworks 52 / **dock 44 ("the native names; the bridge
aliases are not offered")**. My probe contradicts the third row's interpretation:

- A FRESH dev server serves the dock with **44** options — but the set is
  **39 native + 5 lucide: aliases** (lucide:gauge IS offered), so "aliases are not
  offered" is false as a design statement.
- Poking the authoring pages grows it: after visiting `docs/icons.html` (where copy2,
  lucide:check, md:copy_all, md:home, ph:atom, rx:system:add-line are authored) and
  `timeline.html` (lucide:git-*), the same dock serves **54 options** and the PlayHelp text
  itself flips "union (44 today" → **"union (54 today"**.
- Mechanism (source receipt): the icon plugin's dev-time union is the **dev-incremental
  scanner** — "an EAGER project walk at buildStart in **build** mode", dev rides
  "a scanned-set change rides scheduleRefresh" (vite-plugin/src/icons/vite-plugin.ts:53-56,
  :369-370). In dev the scanned set grows per transformed module; a fresh server's dock is
  a transient subset until the authoring pages are visited. The committed artifact (54, gen
  gate GREEN) and the fresh build (dist reads "union (54 today") are the truth layers.

**Correction to file**: her table's third layer is real as a NUMBER but is the scanner's
transient state at probe time, not a designed native-only curation. Her open question 2
("if the playground should drive the aliases too, that is a seam question") dissolves —
the dock drives aliases once scanned (she herself drove lucide:gauge through it).

**Dev-mode flag for the orchestrator (not a page defect, no fix by me)**: on a fresh dev
server the icon page's playground select omits up to 10 legal union names and the page's
own comment ("the union IS the list") reads false until the authoring pages are visited.
Self-healing, dev-only, artifact + dist correct. If it ever bites authoring, the plugin's
dev scan going eager (or seeding from the committed artifact) is the owner-level lever.

## Gates (batch-shared runs, seat-receipted)

- svelte-check full fleet: icon.html **0**; ui/icon family **0 ERRORs** (9 standing warns).
- verify:docs-universal GREEN 110/110 (once per batch).
- verify:docs on the fresh dist: sole red = toast skeleton order (scribe's in-flight T71 —
  seat-attributed, NOT adopted); icon.html clean.
- gen-icon-set --check GREEN (52 artworks, 1 chunk).

## Process

Port 5241 (batch seat): pre-check rc=1; one restart during the fresh-axis hunt (kill by
PID: listener 10541 + wrapper 10485; cache clear `rm -rf node_modules/.vite`; restart
wrapper 23926) — the restart + cache clear is itself evidence: stale vite cache served a
48-name module, fresh cache serves the scanner-transient 44, converged 54 after page
visits. Probes /tmp/t107b-icon.mjs, t107b2-icon.mjs, t107b3-icon.mjs + SSR curls.
NO commits, NO product-tree edits. Probe faults owned: my rail filter caught the skip-link
#main (re-scoped to nav/aside); one grep counted LINES not occurrences on the single-line
SSR payload (the -o|wc -l instrument is the honest counter).
