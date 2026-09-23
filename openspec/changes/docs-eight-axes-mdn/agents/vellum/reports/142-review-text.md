# T142 — SECOND REVIEW text.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 131 NEEDS-WORK 1M/1N + quill's 135
  CODE round both opened FIRST; every landed item verified at byte + dist-sheet +
  served-computed layers; her clean receipts re-derived; fresh axes. NO commits, NO
  pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/text.html/` over the text family +
  the shared kernel `$lib/text-style.svelte.ts` (inline-code shares it), served live
  on :5242, dist @ HEAD **27b072f9** (fresh build — newer than the c95b40b8 floor;
  noted).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier ruling: Tier 2 CONFIRMED**
  (her "re-tier after the sheet lands" — the sheet has landed; the archetype and the
  family both hold).

## The MAJOR's landed fix — verified at every layer she proved it broken

Her MAJOR was sheet-level and she proved it four ways; each proof now runs in the
positive direction:

1. **The rest seat's failing triple computes**: the modifier playground seat (classes
   `leading-[1.5] font-medium tracking-normal [font-size:14px]`) computes
   **font-weight 500 / font-size 14px / line-height 21px (1.5 × 14)**, tracking normal
   — her failing triple (400 / 16px / no move), all green at the exact numbers the
   dispatch named.
2. **The raw injected div computes at sheet level**: an in-page injected
   `div.font-medium.[font-size:14px].leading-[1.5]` computes **500 / 14px / 21px** —
   the sheet-level proof, positive.
3. **The vocabulary serves in the dist sheet**: the built asset
   (`dist/_app/immutable/assets/0.Be5S9Gbo.css`) greps
   **`.font-medium{font-weight:500}`** and **`.font-\[450\]{font-weight:450}`** — and
   the SOURCE feed block (app.css :47-103, @layer components, "text-modifier kernel
   feed (T135 code round)") carries the FULL emittable vocabulary: weight ×9 named +
   `font-[450]`/`font-[550]`, `.italic`, tracking ×6, `leading-[1]`…`[2]`, the three
   bracket font-family tokens, font-size `[11px]`…`[16px]` — bracket-INCLUSIVE
   selector escapes (`.\[font-size\:14px\]`), exactly the correction her code round
   documented.
4. **The strong row MOVES**: the weight select (vocabulary
   normal/medium/semibold/bold/450/550, rest value **medium**) driven to bold → the
   playground's strong row computes **700** with class `font-bold`, the seat itself
   **500 → 700** — her failure symptom ("strong stays 600 through every drive") is
   dead; the beats-ambient claim now demonstrates.

## The NIT + the mechanism record — landed

- **"preflight-reimplemented" ×3 seats** served (TreeWalker receipts: the matrix
  notes + the prose) — and my scoped matrix read confirms the mechanism the wording
  names: sub/sup compute **fontSize 10.5px, vertical-align baseline, position
  relative, top 2.625px / -5.25px** — the shift IS the app's own preflight rules
  (position-relative + top), not the UA vertical-align, paint-verified.
- **The page comment's true-mechanism record** (:205): "comment blocks feed nothing:
  app.css is read raw, svelte content comments are not" — the stale scanner-feed
  story replaced by the mechanism.

## Her clean receipts — re-derived (scoped to the #matrix seat)

- **The matrix 8/8**: p (P, 400/normal/none) · strong (STRONG, **600** — the recorded
  settle over the UA's 700) · em (EM, italic) · del (line-through) · mark (MARK,
  ground **oklab(0.6489 −0.00413619 −0.236964 / 0.18)** — her hue 0.135938 has drifted
  with the brand rotation; the 0.18 alpha law identical) · ins (underline) ·
  sub/sup (10.5px, family adds nothing). Every element the semantic tag with its
  `data-jx-text` hook, all at the 14px ambient ✓.
- **Mark's box arithmetic**: paddingTop **0.7px = 0.05em × 14px** ✓, paddingInline
  **3.5px = 0.25em × 14px** ✓ — the 0.05em/0.25em box exact.
- **Sugar ≡ base**: three `[data-jx-text="em"]` seats, ALL `EM` tags with the SAME
  class (`x1k4tb9n` — her receipt's class) ✓.
- **Absent-ambient at class level**: the rest seat's class list carries NO italic and
  NO font-family token — the kernel emits nothing for those channels ✓.

## Fresh axes (my pick, both run)

1. **The inline-code shared feed**: the page carries 27 `code` chips; the kernel-
   carrying chip (`font-medium`) computes **font-weight 500** — inline-code shares the
   feed and computes, per the code round's claim (a spot check then; the walk census
   now: 1 chip carries modifier classes and it computes — the other chips carry no
   kernel classes by authorship, so there is nothing for the feed to do on them).
2. **The bracket-token vocabulary edge**: all six probed tokens compute at sheet
   level — `[font-family:var(--font-mono)]` → JetBrains Mono,
   `[font-family:Georgia,serif]` → Georgia, `[font-size:11px]` → 11px/16.5px,
   `[font-size:16px]`, `leading-[2]` → 32px = 2 × 16 ✓. The feed's authored set and
   the kernel's emittable tokens agree at the edges. (Note: `[font-family:var(
   --font-sans)]` resolves to the mono face on this page — the page's own ambient
   --font-sans scope, the token computing faithfully.)

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 27b072f9, fresh build) | **GREEN rc=0** |
| verify:docs-universal | **GREEN rc=0 (110/110)** |
| svelte-check (ONE saved run) | **text page 0 / text family 0 / kernel 0 / inline-code family 0** — her 0/0 standing preserved through the feed edit |
| fresh build | rc=0 (27b072f9 > c95b40b8 floor; noted) |
| dist sheet | the feed rules grep-verified in the built asset |

## Process evidence

- Port **5242**: wrapper (/tmp/t142-wrapper.pid) + listener 85383; after gates killed
  BOTH by PID; `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY
  after**. Siblings untouched.
- NO commits, NO pushes; zero product-tree edits (this is a 2nd review).
- Probe faults owned: (1) my first matrix/strong reads swept the whole page and caught
  a 16px text-family demo (yellow mark ground, 0px padding, weight 700) — NOT the
  matrix seat; scoped to `#matrix` the receipts land exactly on her digits (the
  scoped-read discipline, third lane this campaign); (2) my first strong-row drive
  read a page-global select set — re-scoped to `#modifiers` selects (the weight
  vocabulary matched by options) with the seat + row read post-drive.
- Artifacts: /tmp/t142/{probe-text.mjs,probe-matrix.mjs,text.json,gate-docs.log,
  gate-universal.log,scheck.log,lsof-after.txt}, /tmp/t142-build.log.

## Open questions

1. The `[font-family:var(--font-sans)]` token resolving to the mono face on this page
   — the page's own ambient scope deciding it; faithful token computing, no action
   needed. Noted so the next prober doesn't read it as a feed miss.
2. The universal-props seats' drift-census (16px stamps at the coincident pair — the
   pattern-faq NIT class) does not apply here: text's seats read 14/18px distinct.
