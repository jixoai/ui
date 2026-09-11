# spin-ora-svg-lane — the ora text catalog + the svg animation posture

## Why

The spin component ships exactly ONE hardcoded frame sequence — the
bracket cursor `[ / — \ | ]` (four frames, 800ms steps(1), brackets
baked into the markup). The Owner's direction (2026-09-11) is three
moves: (1) the text posture joins the ora lineage — a NAMED catalog of
plain-text frame sequences, and the decorative `[` `]` wrapping DIES
(ora spinners are bare frames); (2) a NEW svg-animation posture whose
default artwork is magecdn's blocks-wave (MIT, no attribution); (3)
the svg lane gets the same build-time treatment the icon system has —
a vite-plugin feature (extensible, custom sources, generated typed
artifact), modeled on the icons library face.

## What Changes

1. **The ora text catalog** (`registry/files/ui/spin/spin-catalog.ts`)
   — the cli-spinners corpus (ora's data source, v2.9.2) curated by an
   objective rule: every spinner whose frames are text-presentation
   glyphs (no supplementary-plane pictographs, no VS16 sequences), ≤30
   frames, ≤10ch frame width — ~60 named spinners (dots, dots2, line,
   line2, pipe, simpleDots, arc, circle, arrow, toggle1-13, bounce,
   growVertical, …), each carrying its cli-spinners `interval`. The
   `[` `]` brackets die everywhere; `bouncingBar` (whose FRAMES are
   brackets) is excluded by the same ruling. Frames are VERBATIM from
   cli-spinners — no hand-transcription.
2. **The frame engine swaps to JS interval cycling** (ora's own
   mechanism): SSR paints frame 0, `$effect` starts the interval after
   mount, `prefers-reduced-motion` never starts it (the frozen-first-
   frame law, unchanged semantics). The 4-frame CSS keyframes machinery
   (`spin.css`, per-frame visibility utilities) dissolves — a catalog
   with 2..30 frames at per-spinner intervals is not expressible as
   fixed CSS steps.
3. **The svg-animation posture** — `<Spin spinner="blocks-wave" />`
   renders an animated `<svg>` (SMIL `<animate>` artwork,
   `fill="currentColor"`, component-owned root + `{@html}` innerHTML —
   the icon sink law: payload is build-time-extracted, RAW-gated,
   never prop-reachable). `size` prop (default 16, icon parity);
   reduced-motion calls `svg.pauseAnimations()` (freeze on first
   frame, the same law in SMIL terms). Multi-instance lockstep (SMIL
   syncbase ids resolve to the first match in document order) is a
   declared compromise — no runtime id rewrite.
4. **The unified name lane** — one `spinner` prop for both postures:
   artifact lookup first (explicit consumer config beats built-ins,
   the icon override law), then the text catalog. Type:
   `spinner?: SpinName | TextSpinnerName` (a typo is a compile error).
   Default `dots` (ora's default).
5. **The vite-plugin spinners feature** (`jixoai({ spinners: … })`,
   default-off, sub-entry `…/spinners`): the built-in blocks-wave
   manifest (vendored SVG), custom `spinners` (inline string | `{ file }`),
   kebab name grammar, the RAW safety gate, NO svgo (byte-faithful —
   `convertShapeToPath` would kill x/y/width/height `<animate>`
   targeting), single-writer artifact generation
   (`registry/files/lib/spin-set.gen.ts`, `getSpin` + `SpinName`,
   always-sync single inline module — no lazy tier), the vite adapter
   (virtual serving + drift-warn), root `gen:spins`/`verify:spins`
   scripts mirroring the icons flow.
6. **The registry item set** — a new `spin-set` registry:lib item
   ships the artifact (the icon-set precedent); `spin` (registry:ui)
   gains the `@jixoai/spin-set` dependency. Docs page, blueprint
   scene, and registry descriptions move to the new vocabulary.

## Impact

- `packages/vite-plugin`: new `src/spinners/` face (manifest, safety
  reuse, generator, vite adapter) + `./spinners` sub-entry + umbrella
  option + package description; plugin test suite grows the spinners
  battery.
- `registry/files/ui/spin/`: spin.svelte rewritten (catalog + artifact
  imports, interval engine, svg posture, bracket removal),
  spin-catalog.ts NEW, spin.css shrinks to the svg reduced-motion
  kill, spin-defaults comment refreshed (spinner/size join the
  surface); `registry/files/lib/spin-set.gen.ts` NEW (generated).
- `registry.json`: spin description/files/registryDependencies + the
  spin-set item; `public/r/spin.json` + `public/docs/components/spin.md`
  regenerate through the build.
- `apps/www`: mirrored component files, `src/lib/spin-set.gen.ts`
  mirror, vite.config dogfood (spinners option), docs route
  `docs/components/spin.html`, blueprint scene, suite updates.
- `scripts/`: gen-spin-set.mjs (root single writer) + package.json
  scripts; verify-all wiring if it enumerates.
- specs: build-plugins (spinners library face requirement ADDED),
  component-authoring (the spin catalog + postures requirement ADDED).
