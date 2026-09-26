# T104 — input (docs page) — 1st eight-axes review (marginalia)

**VERDICT: PASS — 0 MAJOR / 2 MINOR / 3 LOW / 0 NIT — Tier 2 proposed**

Legacy class (explicit-props W3 batch A at 6bb88ae0, no CODE report) — first
audit, derived from my own source reads + live probes; vellum holds the 2nd.
Page: `apps/www/src/routes/docs/components/input.html/+page.svelte` (857
lines). Family read in full: `input.svelte` (960), `input.css` (458),
`input.stylex.ts` (89), `input-defaults.svelte.ts` (40), `index.ts` (6), plus
the consuming sheets (`jx-pure.css` shell/Tier-1 laws, `jixoai.css` alias
blocks) and the dock (`canvas-playground.svelte` axis bar).

Process: port 5244 mine (pre-check rc=1, served from apps/www, killed at end —
lsof post_rc=1, no orphans). Probes /tmp/marginalia-104-probe1..7.mjs (logs
-p1/-p2/-p3/-p4). Dist df059b3b for the lint gate. No fixes applied.

---

## 1. The field contract — the big claims verified TRUE with digits

**Native passthrough / §1 collision rule.** restProps census (probe1):
`demo_number` and `demo_number_native` carry `min="0"` on the element;
`cap_count`'s native input carries `maxlength="20"`; `cap_reveal*` carry
`autocomplete="off"`; `demo_disabled` disabled; 15 demo names forwarded.
`sizeAttrCount: 0, colorAttrCount: 0` across all 63 native inputs — the
native element NEVER receives size/color (source :174 `Omit<HTMLInputAttributes,
'size' | 'color'>` + :181-195 CONSUMED doc comments). Uncontrolled posture:
unbound fields (`demo_text`, `slot_endpoint`) carry NO value attribute and
typing drives the DOM value directly — FormData/reset stay the platform's
(source :89-92; the family's form-level FormData battery is form.html's, #87).

**Size axis consumption (the §1 consume form).** Universal demo receipts
(probe1): `size={14} density="small"` → field root inline
`--jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem)` →
computed root font-size **14px** (the usage comment's "root 14px" TRUE);
`size="large"` → `--jx-size-effective: var(--jx-size-large)` → **18px**
("root 18px" TRUE); default field root 16px unstamped.

**Density ladders (theming :787-791).** Measured on the same fields:
lane font-size **12px / 13px / 15px** at sm/default/lg (--jx-text 11/12/13/15
— three of four rungs digit-true; xs has no on-page field), shell min-height
**32px / 40px / 48px** (--jx-hit 28/32/40/48 — same three rungs);
`data-density="sm"/null/"lg"` stamped per resolve.

**Error law (error-wiring :611).** `types-error`: aria-invalid="true",
aria-describedby="s59-error" → the error line id matches, text "!email is
required" (mark + message), shell `jx-invalid`, computed border-style
**dashed**, radius 0 (the WELL tier), border ink monochrome. The floating
error field's label paints oklch(0 0 0) == the shell's `--destructive`
resolved value (jixoai.css :73 `--destructive: oklch(0 0 0)` — black IS the
one-hue destructive; "no error red" consistent end to end). Probe5/6.

**Focus law (the #22-adjacent receipt).** Component shell: border
oklch(0 0 0) → **oklab(0.115, 0.035, -0.023)** on focus (the ring tint),
outline solid 1px / offset **-1px** (the site's inset ring law, slots :514
"inset focus outline"), outline-color + caret = **oklch(0.6489 0.237 327)**
(the ring token). Tier-1 bare `.jx-control`: SAME ring var, same inset
outline, same tinted border at focus-visible, same caret. The PAGE's claims
are receipted; the parity gate's tier0-vs-tier1 focused-hue question stays
**W-next #22's** — digits recorded here, verdict not re-filed.

**Tier-1 (all-types :461-503).** Placeholder-vs-value on the bare text input:
::placeholder oklab(0.6 0 0) vs value oklch(0 0 0) — "placeholder reads
clearly lighter" TRUE. Bare number keeps the platform spinner
(`::-webkit-inner-spin-button` display **block** — the D3 ruling TRUE). The
component number lanes hide spinners and center text (`.jx-number-shell`,
input.css :93-104; textAlign center measured). Color shells: compact
**70×40px (7:4 ratio measured)**, `jx-color-expand` stretches to the full
row (331px). (The bare date indicator read "none" via pseudo computed-style —
the known pseudo-read liar channel; the component date lanes' real indicator
behavior is receipted interactively below.)

**Semantic glyph lane.** text/search/email lanes carry `[data-jx-semantic-icon]`
svgs at `data-icon-position="auto"`; password/date/number carry none —
exactly the SEMANTIC_GLYPHS map (source :394-400). The order ladder +
item-end trailing ambient + 30rem fold are CSS-owned (input.css :230-288) —
source-level (not demoed on the page).

## 2. Interaction receipts

- **Clearable (slots :536-544):** × visible with a value ('pty'), gone when
  emptied, back on type; click → DOM value "", **input events re-emitted
  (7 observed) + one bubbling `clear` event caught**, binding synced. TRUE.
- **Esc on search (a11y :757):** typed "grep me" into `demo_search`, Escape →
  DOM value "" (native reset, no JS in the component). TRUE.
- **Count (capabilities):** 你好𠀀👍 → DOM length 6 UTF-16 units, readout
  **"4 / 20"** — the code-point claim TRUE with the page's own example; then
  19 ASCII → **"19 / 20" + aria-live flips off → polite** (ceil(20×0.9)=18).
  The page's exact example, digit-true.
- **Reveal:** eye click → input.type "text", aria-pressed "true", label
  "hide password"; again → "password"/"false"/"show password". `reveal={false}`
  field has NO eye. End-lane DOM order: lane → × → eye (snippet > × > eye).
  TRUE.
- **Number stepper:** + click from empty → "1" (unset base = min 0); **hold
  1000ms → "9"** (1 immediate + 300ms delay + 7×100ms repeats — the
  documented 300→100 acceleration arithmetic exactly); ArrowUp on the focused
  lane → +1 (native ↑/↓ stays); `native-controls` number has NO stepper
  buttons. TRUE.
- **Picker bridge:** date indicator-zone click (hit-test INPUT) → panel open;
  day-pick → value **2026-09-13**, panel closed, echo "committed: 2026-09-13"
  (onselect bridge TRUE). zh-CN panel: **2026年9月** month label + 周一…周日
  heads (the page's format claim TRUE). Week day-pick → **2026-W38** ISO
  commit + echo. datetime-local day-pick → **2026-09-13T00:00**, panel STAYS
  OPEN, time-stepper row + divider present. Time panel on unset:
  digit cells are maxlength-2 inputs reading **"00"/"00"** (the "unset still
  shows 00:00" claim TRUE — textContent-blind, values receipted); two
  increase-hour clicks → live commit **"02:00"**, panel stays open. Color
  overlay button opens the editor panel.

## 3. Findings

**MINOR-1 — Two full demo sections are unreachable from the toc, and the
rail order is not the page order.** Authored +page.ts ships 9 entries; the
DOM renders **11** section ids. `capabilities` (:551, count·reveal·floating)
and `picker-bridge` (:624, the bridge demos) have no toc entry — the rendered
rail (probe1: 9 links, authored order) never links them. Rendered rail order
(types…api, then all-types/slots/error-wiring) also diverges from DOM order
(all-types → slots → capabilities → error-wiring → picker-bridge → types…api):
the rail's first jump lands on Types, the page's 6th section. The +page.ts
comment (:31-33, "the three demo sections, in page order") matches neither
count nor order. T93 toc class. Fix shape: add the two ids to the toc data
and order it to the DOM (or by the documented policy).

**MINOR-2 — radius is stamped-never-consumed on the demoed lane (the
zero-reader axis, dispatch-armed).** universal-props demos `radius="medium"`
on a field labeled "size large · radius medium" (:808); the field root
stamps `--jx-radius-effective: var(--jx-radius-medium)` (inline receipt,
probe1), but the shell's computed border-radius stays **0px** — jx-pure.css
:390 hardcodes `border-radius: 0`, and NO sheet in the family reads any
`--jx-radius-*` var (grep over input.css / input.svelte / jx-pure.css: zero
readers; jixoai.css's radius consumers belong to other families, e.g. the
hover-card consumption law). The consumer sees the label promise a radius the
shell cannot paint. Fix shape: read the consumed radius var in the shell law
(the hover-card form) or drop radius from the demo until the family consumes
it. (Contrast: size IS consumed — the stamped root font-size measured 14/18px
— so the family's §1 story is half-real, which is exactly why the demo misleads.)

**LOW-1 — the API table omits seven of the eight axes its own section
claims, and `chrome`.** PropsTable (:822-844) lists 19 entries including
`density` (:837) but not size/shape/radius/color/theme/elevation/motion —
all declared component props (source :180-203) that the universal-props
summary (:803) describes and the page demos (size, density, radius). The
summary's framing ("the entries below are the component-owned additions")
is internally inconsistent: density is an axis and it's in; radius is demoed
and it's out. `chrome` (control-chrome axis, destructured :323) is also
unlisted — and its omission has a type twin (below). T96/T102/T103 class.
Fix shape: add the eight axis rows (or a one-line "plus the eight universal
axes" pointer) + chrome.

**LOW-2 — the theming paragraph's density-control rung names are stale.**
"flip the canvas dock's density select **(xs / sm / default / lg)**" (:781):
the dock control exists (canvas-playground.svelte :288, live menu census in
probe4) but offers **auto / small / medium / large** (the universal
vocabulary; xs/sm/default/lg appear nowhere in the control). The re-scope
mechanism itself is real (stage `data-density` stamp, component-canvas.svelte
:661; density-prop consumption receipted at 12/13/15px). Stale copy from the
pre-universal vocabulary.

**LOW-3 — five type-error seats in the family component (all type-only;
runtime exercised clean).** svelte-check on input.svelte:
:174 — `Props` incorrectly extends `Omit<HTMLInputAttributes, 'size'|'color'>`:
the picker-commit `onselect: (value: string) => void` collides with the
NATIVE `onselect` EventHandler typing (the component repurposes a native
event name — it fires on picker commits, never on text selection; a consumer
expecting the platform text-selection event gets the bridge callback);
:323 — `chrome` destructured but never declared in Props; :652 — the cx
overload twin; :903/:934 — `disabled={rest.disabled}` nullity
(boolean|null|undefined → boolean|undefined). The page adds one: :305 — the
cx-overload clone, **11th page instance** (svelte-check page errors: exactly
1). Fix shapes: rename the callback (e.g. `onpick`) or Omit 'onselect' at the
extends; declare chrome; the transfer type-predicate for cx; a nullish
default for the disabled pass-through.

## 4. Verified-true claims not requiring findings

Hero summary is catalog-derived (single-sourced; the page throws on drift).
label[for] + aria wiring throughout (auto `$props.id()`); the four slot seams
with the error-line-above-outerBlockEnd source order (:942 before :958);
slot content muted 12px (0.75rem) measured; floating bracket ink machine
(empty oklch(0.3211 0 0) muted / filled oklch(0 0 0) / error == --destructive,
pure CSS per input.css :290-350); hidden-type bare passthrough; range/color
take only the outer slot pair; picker coverage set = date/datetime-local/
color/week/month/time with native-controls opt-out and picker-snippet
override (source :529-532); `data-jx-custom-picker` indicator interception
(pointer-events none + 40px clientX zone, input.css :61-67 + source :618-627);
Alt+↓/↑ reroute (source :629-634); Intl locale default page-lang with the
Firefox week/month degradation as documented. T94 audit scope: jixoai.css's
tgroup pairs ride `:has(input:checked)` (clean per-input truth); jx-pure's
checkbox `:checked`/`:indeterminate` pair (:1424-1439) is spec-correct
(checkbox :indeterminate is a real DOM-settable state); the radio
`:indeterminate::before` at :1503 is the #94-class pattern — owned by #94,
cross-referenced, not re-filed. DensityDemo is genuinely retired here (no
import; the theming paragraph says so).

## 5. Triage honesty note

857-line page, full battery — no section got a light touch. The picker
EDITOR internals (SV pad, format switch, Eye Dropper) and the Calendar's
keyboard grid belong to date-picker/color-picker's own reviews; here they are
receipted only as the bridge's commit/panel behavior. wheel/press-drag
time-stepper gestures: the wheel was not synthetically receipted (hold +
live-commit receipts cover the stepper); the zh-CN literal renders 2026年9月
— the page's "2026年8月" is format-exemplary, not a month claim. The
Tier-1 bare date indicator pseudo read was discarded as a lying channel;
the component lanes' indicator behavior was receipted by interaction instead.

## 6. Probe-fault ownership (my artifacts, not the page's)

- Probe2's stepper clicks fired at viewport-negative Y (field scrolled out)
  — the "" readings were no-op clicks, not component failure; probe3 re-ran
  scrolled and got 1 → 9.
- Probe2/3 date/week/datetime cell clicks crashed on a button-based day-cell
  filter — the Calendar's cells are click-only `div[role=gridcell]`
  (calendar.svelte :396); probe4 re-ran with the real selector.
- The floating-error label initially read "not destructive" — wrong on my
  side: `--destructive` IS oklch(0 0 0) in the one-hue light theme; the
  label matches it exactly.
- The unset-time "00:00" claim survived a textContent blind spot — the digits
  live in maxlength-2 inputs; values receipted (00/00).
- Dock density flip did not land through the shared menu in probe4 (many
  canvases' menus match); the values receipt stands on source :288 + the DOM
  census, the mechanism on the stage stamp + density-prop consumption.
- Dev server first start ran from the repo root (`vite: command not found`)
  — restarted from apps/www; the failed process was reaped before the retry.

## 7. Gate record

- ambient solo: 284/284, rc=0 (known vite-teardown nuisance note).
- `npm run verify:docs-universal` → GREEN 110/110, rc=0.
- page-scoped svelte-check: page 1 error (:305 cx clone); component 5 seats
  (:174, :323, :652, :903, :934) — all reported above, none self-fixed.
  (Fleet context: the cx overload + undeclared-chrome seats repeat across
  number-input/tags-input/file-input/command-input — the shared-util
  consolidation flag stands.)
- `npm run verify:docs` (dist df059b3b) → rc=1, sole red `toast: skeleton:
  Examples renders before Usage` — pre-existing, seat-attributed away from
  input.
- Server killed: lsof :5244 empty (post_rc=1), no orphan processes.
