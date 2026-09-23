# T138 — SECOND REVIEW pattern-login (marginalia, 2026-09-24)

- **Protocol**: scribe's 1st (130-review-pattern-login.md, PASS 0M/1m/0L/0N) opened
  FIRST; his landed item verified at source + type layer; his receipts re-derived
  with my own instruments; his open question #2 taken as my fresh axis.
- **Vintage**: HEAD = dist-fresh build at **ef520d44** (this batch's build, 03:01 —
  ≥ the dispatch reference).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier 2 CONFIRMED.**

## The landed item — VERIFIED

**cx ×3 closed** (scribe's MINOR 1): the page cx (+page.svelte:68) and both family
cx seats (pattern-login.svelte, pattern-login-otp.svelte) carry the hardened
`Object.entries(style ?? {})` guard; the saved svelte-check run shows **0 page
seats and 0 family errors** — all three of scribe's diagnostics are gone.

## Scribe's receipts — re-derived (all confirm)

1. **The echo recomposes live**: the boot band reads `$ ssh
   user@deploy.jixoai.dev` at rest; typing "ada" into the user lane flips it to
   `$ ssh ada@deploy.jixoai.dev`; the band carries `aria-hidden="true"` (the
   nothing-announced-twice claim).
2. **OTP auto-advance**: a 6-slot screen (s7-0…s7-5); a 2-key sequence fills
   **exactly 2 slots**.
3. **The reveal contract**: activation flips the input type password→text, the
   label swaps show→hide (hide-password button present post-activation). Partial
   note: my pass typed no passphrase value, so the value-preservation half is
   unexercised this pass (scribe measured it with a value; the type flip on the
   same persistent input element makes it structural).
4. **The copy footer**: the copy action flips the surface to "**copied**" (visible
   post-click).

## Fresh axis — scribe's open question #2: the Tab-order claim, WALKED

A clean 12-stop keyboard walk on a fresh context (no prior interactions):

Skip to content → (page furniture: the print-preview demo pair, the install copy,
the GitHub link) → **user → host → passphrase → show password → connect → copy
npx jixoai-ui init --hue 210** → (canvas dock controls).

The page's claim "Walks user → host → passphrase eye → connect → footer copy" is
**TRUE exactly as written** — the passphrase eye IS a stop (a natural button, no
tabindex restriction), the connect submit and the footer copy follow in order.
Scribe's open question is answered in the page's favor; nothing to fix.

## Structure + gates

- LAW #19: clean (scribe's census stands; no id changes this vintage). toc 6 ==
  +page.ts 6.
- svelte-check (ONE run, saved /tmp/marginalia-138-sc.log): page **0 seats**,
  family **0 errors**.
- Fresh build rc=0 (dist 03:01); **verify:docs rc=0**; docs-universal **110/110**.
- Process: port 5244 mine, killed (lsof rc=1 empty); NO commits/pushes/fixes.
  Artifacts: /tmp/marginalia-138-probe.mjs, /tmp/marginalia-138-login.mjs,
  /tmp/m138-tabwalk.mjs.

## Probe-fault ownership

1. My first login stage scoped to `#pattern-login` — the section id is `#demo`;
   the locator starved 30s. Fixed by reading +page.ts first (should have been the
   first move; the toc IS the id map).
2. The eye's locator click was actionability-blocked (the reveal sits inside the
   input's box); routed through the DOM click (same event) — same class as the
   T131 dock-interception lesson.
3. value-preservation unexercised (no value typed before the reveal) — scribe's
   earlier measurement stands; noted, not re-driven.
