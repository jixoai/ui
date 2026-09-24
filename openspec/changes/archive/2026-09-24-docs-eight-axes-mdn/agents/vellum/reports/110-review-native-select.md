# T110 — SECOND REVIEW native-select.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 90 1st-review report opened FIRST;
  landed/retracted items verified at the real-path + DOM layers; fresh axes run.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/native-select.html/` over the
  native-select family, served live on :5242.
- **VERDICT: PASS — 0 MAJOR / 1 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 1** (per
  her proposal; nothing I measured contradicts it). Her MINOR 1 (color-scheme) stands
  RETRACTED — I reproduced the real path myself and it flips; the one diagnostic I
  carry is the standing page cx overload the eleven-family closure did not cover
  (downgraded to LOW — same recorded class, mechanical, fleet-level fix already the
  accepted direction). Her MINOR 2 (parity gate) stays W-next #22, Owner decision.

## MINOR 1 → LOW — the page cx overload the cx-closure wave missed

`svelte-check` page-scoped: **1 ERROR, :286:28** — the page-local cx overload
(`Object.entries(style)` rejects `{…} | undefined`; `filter(Boolean)` doesn't narrow).
This is the SAME diagnostic at the SAME seat marginalia 90 recorded ("the standing
Object.entries-undefined class — recorded, not chased"). I verified why it survived
the closure: f92d6555 ("close the remaining five cx-joiner clone diagnostics") and the
twelve before it closed FAMILY files (breadcrumb/command/tabs/list/hover-card/input/
toggle-group…, mirrored to registry twins) — **zero touches to the native-select page**
(git show --stat grep: 0). The page was simply outside the closure's lane. The transfer
type-predicate fix applied page-locally closes it; the fleet-level shared util (her own
recommendation) remains the real fix so the next copied page can't re-import the bug.
Counted LOW because it is mechanical, unchanged since her census, and the fix direction
is already the campaign's accepted one.

## Her MINOR 1 (color-scheme stuck light) — RETRACTION INDEPENDENTLY VERIFIED

I reproduced the REAL UI path myself (OS-signal emulation — exactly the signal the
site theme sync listens to), three states on one live page:

| State | html class | **inline** color-scheme | select computed color-scheme |
|---|---|---|---|
| light | `js` | **light** | light |
| OS dark | `js dark` | **dark** — the sync FLIPS the inline property | dark |
| light again | `js` | **light** — live two-way sync | light |

Her stuck-light was a class-injection artifact (injecting `dark` on `<html>` bypasses
the sync, which owns the inline style — the injected class never updates an inline
property it doesn't know about). The real path updates it every flip. The page teaches
nothing the retraction falsified: the page body carries no color-scheme prose claim
(text census ×0); the family header's "color-scheme follows the site theme"
(native-select.svelte :10) is now TRUE under the real path. The dark-popup consequence
is real: select computes color-scheme dark while the demo island's L2 pin keeps the
closed face light (oklch(1 0 0)) — pin paints the face, inherited color-scheme drives
the popup chrome, exactly the two-strata story.

## Her receipts — re-derived

- **Typeahead**: focus + real "f" → value `free` ✓. **Chevron**: computed
  backgroundImage is the inline-SVG data-URI under both schemes ✓ (dark re-check
  served the same data-URI law).
- **Error contract** (spot re-derive): aria-invalid true, describedby `s12-error`
  ("!plan is required"), dashed shell — unchanged ✓.
- **The T89 scroll-run tabindex arming**: her five-runs-all-armed census accepted;
  not re-walked (out of my fresh-axis budget, mechanism byte-verified earlier).

## Fresh axes (beyond her report)

- The three-state real-path receipt table above (her report measured only the two
  injected-class states; the flip BACK to light — proving a live two-way sync rather
  than a one-time stamp — is new).
- The face/popup strata split under OS dark (pin vs inherited property) — new.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 4c4ba4ff) | GREEN rc=0 (staged scope green) |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **1 ERROR :286:28** (MINOR 1 → LOW above); family lane unchanged |
| verify:parity | not re-run — her 5 failures are W-next #22's pair (harness-isomorphism + input hue), Owner decision, no page work owed; nothing on the page moved since her dist |

## Process evidence

- Port **5242**: wrapper 26755 / listener 26805; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. `emulateMedia` states reverted to light in-probe; every
  state change went through the OS-signal path, never class injection.
- Probe faults owned: my first theme-copy text census (`childElementCount === 0`
  filter) returned ×0 hits — confirmed by source grep that the page genuinely carries
  no color-scheme prose (the census was right, not blind).
- Artifacts: /tmp/t110/{probe-fb-ns.mjs,fb-ns-full.json,scheck.log,lsof-after.txt}.

## Open questions

1. The page cx overload (my LOW): close page-locally with the transfer type predicate,
   or fold into the fleet-level shared util — orchestrator's call; both receipts on file.
2. W-next #22 (parity harness class-isomorphism + input hue): unchanged, Owner decision.
