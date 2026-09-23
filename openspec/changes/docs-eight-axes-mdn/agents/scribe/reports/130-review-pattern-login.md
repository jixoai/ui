# TASK 130 — pattern-login (docs page) — 1st eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 1 MINOR / 0 LOW / 0 NIT — Tier 2 proposed.**
Owner = marginalia; independent 1st audit. Dist = 2b06c0d5 (fresh build rc=0, this
review's own build). Port 5243 mine; killed after probes, lsof post rc=1, no orphans
(the remaining 5241/5244 listeners are siblings' t129/t-servers — untouched, verified
by pid ownership before sweeping).

## Delivery-shape taxonomy: COMPOSITION PRODUCT (the pattern lane)

Two components (PatternLogin + the named export PatternLoginOtp) composing Input (the
reveal, the labels, the error lanes), PressButton (connect/verify), input-otp (the slot
mechanics), and the clipboard footer. The pattern owns only the frame law, the echo line,
and the boot band — every behavior claim on the page is explicitly delegated ("the reveal
is the Input's contract", "input-otp owns the slot mechanics"). The hero summary is the
CATALOG lookup (fail-loud, served).

## Findings

**MINOR 1 — the page-scoped gate is red: 1 page + 2 family diagnostics, all the cx
overload class.** Page :68, pattern-login.svelte :158, pattern-login-otp.svelte :120 —
three `Object.entries` overloads, each the `?? {}` one-liner. Mechanical, zero behavior
change. (Saved-run receipt: /tmp/g130-scheck.txt, the batch's ONE svelte-check run.)

No LOW, no NIT. The claims I armed against all held (below).

## Verified-true (receipts against my armed suspicions)

- **The echo recomposes live**: typing "ada" into the user lane flipped the ssh echo from
  "$ ssh user@deploy.jixoai.dev" to "$ ssh ada@deploy.jixoai.dev" — and the echo band
  carries `aria-hidden="true"` (the page's nothing-announced-twice claim).
- **The reveal contract, on the served page**: the eye starts `aria-pressed="false"`
  (hidden — "the value is never revealed by default" ✓, input type=password at load);
  activation flips pressed→**true**, the aria-label swaps "show password"→"hide password",
  the input type flips password→text, and **value + focus stay put** (value "s3cret-value"
  preserved, activeElement the same input under programmatic activation). The
  pattern-local-toggle absence held: exactly one reveal control, the Input's own.
- **The copy footer**: the boot band's copy (aria-label "copy npx jixoai-ui init --hue
  210") puts the exact command on the clipboard (read back: "npx jixoai-ui init --hue
  210"), flips the surface to "…**copied**", and reverts to "…copy" within 1.9s (the
  taught 1.4s window).
- **OTP**: real typing auto-advances (2 slots filled from a 2-key sequence on a 6-slot
  screen). The incomplete-submits-empty join is input-otp's reviewed contract — not
  re-tested here (the family surface; noted, not a gap in this page's own claims).
- Structure: toc 6 == DOM 6; **LAW #19: clean** (page-wide census, zero duplicates); h1
  ×1; 0 undefined; the API table carries the universal marker and covers BOTH components
  (the PatternLoginOtp rows named as such).

## Standard battery + gates

- SSR 200 (440,862 bytes) · verify:docs **rc=0** · docs-universal **110/110**.
- Probe-fault ownership: (1) my first copy-click was intercepted by the canvas dock's help
  text at 1600w and my /copy/i locator matched the DOCK's install-copy button, not the
  card's footer — the aria-label-anchored re-probe is the receipt; the dock-over-demo
  hit-test overlap at this viewport is canvas-chrome interior (component-canvas family),
  not a page finding — recorded for the Owner's W-next #21 lane map if it recurs;
  (2) my first reveal read scoped to the password lane's immediate div (no buttons there —
  the eye lives in the Input's own structure) and then matched the canvas's "Toggle theme"
  button as a false eye — the aria-label anchor ("show password") is the receipt;
  (3) elementFromPoint returns garbage for off-viewport rects — scrollIntoView before every
  hit-test.
- Artifacts: /tmp/g130-{pl,pl2,pl3,pl4,pl5,pb-prose,final,final2}.mjs + /tmp/g130-*.log.

## Open questions for the code round

1. The archetype gaps: the rail (demo/otp/usage/a11y/axes/api) has no overview, no
   see-also; the universal section is a two-seat demo with no axis table. The dialog
   CODE-round pattern lands all of it.
2. The Tab-order claim ("Walks user → host → passphrase eye → connect → footer copy") was
   not key-walked this pass — the lanes are native inputs in DOM order and the eye sits
   between host and connect structurally; a keyboard battery is cheap for the code round.
