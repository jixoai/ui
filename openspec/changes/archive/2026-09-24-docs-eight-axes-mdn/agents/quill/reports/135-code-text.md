# T135 — CODE ROUND: text's scanner-feed MAJOR (quill)

**Finding source:** marginalia T131 (NEEDS-WORK 1M/1N, Tier 2 proposed) — the one systemic
finding of the final wave. Target: `apps/www/src/routes/docs/components/text.html/` +
the shared kernel `$lib/text-style.svelte.ts` (Text AND inline-code consume it). No
commits — consolidation is yours.

## The root cause (why the utilities never reached the sheet)

Two stacked facts, both verified empirically:

1. **The site is TAILWINDLESS** (app.css header, W4 2026-09-18: "the Tailwind engine
   RETIRED — no @import 'tailwindcss'"). There is no scanner and no generator anymore:
   a utility class exists ONLY where a real CSS rule is authored. The kernel emits
   tailwind-dialect class STRINGS (`font-medium`, `[font-size:14px]`) that nothing
   compiles — correct strings, zero matching rules, exactly her sheet-level proof.
2. **The page's "scanner-feed" was a JS comment block** — and comment blocks feed
   nothing here. The empirical split that proves it: the cited app.css jx-html block
   IS a comment too, and `jx-html-input` DOES appear in the built main sheet — because
   `.jx-html-input` is a REAL RULE authored in jixoai.css (:1552, @layer components);
   the comment only documents it. Meanwhile the text page's bracket candidates
   (`leading-[1.5]`, `[font-size:14px]`, `font-medium`…) — authored only in a .svelte
   comment — were absent from BOTH her vintages and mine. Comment blocks in app.css
   "work" only when a real rule exists behind the name; svelte content comments feed
   nothing at all.

## The fix (landed — app.css, the cited precedent's seat)

`apps/www/src/app.css` — a new **@layer components** block directly after the jx-html
comment block: **"text-modifier kernel feed (T135 code round)"** — real rules for the
kernel's full emittable vocabulary, the set = the kernel's named maps + the
playground's arbitrary domains:

- **weight**: the nine named map entries (font-thin…font-black) + the playground's
  arbitrary `font-[450]` / `font-[550]`
- **italic**: `.italic`
- **tracking**: the six named (tighter…widest)
- **leading**: the playground's five unitless ratios (`leading-[1]`…`leading-[2]`)
- **font-family**: the three bracket tokens (`[font-family:var(--font-mono)]`,
  `[font-family:var(--font-sans)]`, `[font-family:Georgia,serif]`)
- **font-size**: the five lengths (`[font-size:11px]`…`16px`)

@layer components = the jx-html tier exactly: the consumer's own (unlayered) classes
still win the cascade — the kernel's "modifier lands after the form's utilities"
contract preserved. The page's stale comment block now points at the landed rules and
records the mechanism ("comment blocks feed nothing: app.css is read raw, svelte
content comments are not"). **The kernel is untouched** (her "the pure resolver is
correct and stays"). **inline-code shares the feed** (same kernel, same classes — one
chip seat measured carrying font-medium and computing).

Two build rounds were needed and the second is instructive: my first authoring escaped
the font-size/family selectors as `.font-size\:14px` — but the kernel's token INCLUDES
the brackets (`[font-size:14px]`), so the selector must escape the whole token:
`.\[font-size\:14px\]`. After the correction: `.font-medium{font-weight:500}` and
`.font-\[450\]{font-weight:450}` grep-verified in the fresh main sheet.

## Verification (fresh build, dist-served, real drives)

- **The playground seat at rest** (classes `leading-[1.5] font-medium tracking-normal
  [font-size:14px]`) now COMPUTES: **font-weight 500, font-size 14px, line-height 21px
  (the 1.5 ratio at 14px)**, tracking normal — her failing triple, all green.
- **The raw injected div** (`font-medium [font-size:14px] leading-[1.5]`) computes
  500/14px — her sheet-level proof, now in the positive direction.
- **The drives move the render**: weight=bold → computes 700; weight=450 →
  `font-[450]` computes 450; **the strong row MOVES** (500 at rest with the medium
  modifier → 700 driven) — her failure symptom was "strong stays 600 through every
  drive"; the explicit-replaces-600 claim now demonstrates.
- **inline-code shares the feed** (a chip seat carries font-medium and computes).
- **NIT landed** (three seats): the matrix notes + the prose now read "the
  UA-baseline-shift law, **preflight-reimplemented** — the visible shift is the app's
  own preflight rules (position-relative + top), not the UA vertical-align".
- **SSR smoke**: 200, 450,005 bytes, the class strings in the payload.

## Gates

| Gate | Result |
|---|---|
| Fresh build | exit 0 (two rounds: the feed, then the bracket-selector correction) |
| svelte-check (ONE run, /tmp/t135-scheck.log) | text.html **0 rows**; ui/text family **0 ERRORs**; text-style kernel 0 — her 0/0 standing, preserved through the edit |
| verify:docs | **rc=0** |
| docs-universal | GREEN 110/110 |
| Sheet grep | .font-medium{font-weight:500} + .font-\[450\]{font-weight:450} in the fresh main sheet |

## Probe faults owned (mine)

1. The selector-escape round: I escaped `font-size:14px` but not the brackets — the
   kernel's class token is bracket-inclusive; the built sheet's absence of my first
   rules was the tell (grep the fresh main sheet BEFORE the live probe; the stale-hash
   main sheet also briefly misled one grep).
2. The strong-row base expectation: 600 assumed "no modifier at rest" — the playground
   rests at weight=medium, so 500 IS the replacement working. The claim's proof is the
   row MOVING (500→700), not the rest value.

## Process

Port **5241**: rc=1 before → preview (fresh dist, two build rounds) → after gates
killed by PID + wrapper → port **EMPTY** (0 lines), zero orphans. Siblings untouched.
Edits: `apps/www/src/app.css` (the feed block) + `text.html/+page.svelte` (comment
reword + NIT ×3 seats). NO commits. Artifacts: /tmp/t135-verify.mjs, -build/-build2/
-prev/-prev2/-ssr.html/-scheck/-docs/-universal logs.
