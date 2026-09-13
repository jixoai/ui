#!/usr/bin/env bash
# sync-app-css.sh — regenerates src/app.css from the repo's registry
# sheets, BYTE-EXACT per the D2 manifest's file:line anchors (the
# validator-verified ranges). Re-run after any repo drift; the receipt
# records the sha256 of every copied range.
#
# LAYER_HOIST=1 emits the O1-H DIAGNOSTIC variant: a full layer
# statement (TW canonical order + stylex tiers between components and
# utilities) hoisted ABOVE the @import. @layer statements are
# CSS-legal before @import; without the hoist, unplugin 0.19.0's
# appended stylex css physically follows TW's utilities block, so the
# stylex layers are always inscribed LAST and always win — the frozen
# import order cannot produce O1's expectation (spike-report conflict
# record + remedy evidence).
#
# Anchors (validate-manifests.mjs green set, 2026-09-13):
#   jx-pure.css:265-280     .jx-control alias block
#   jx-pure.css:2255-2269   forced-colors Part C media block
#   jixoai.css:48           :root --primary line
#   jixoai.css:182-259      .dark block
#   jixoai.css:261-285      :where([data-density='lg']) rung
#   jixoai.css:896-1044     :root density base ladder (--jx-unit, --jx-density-*)
#   jixoai.css:2133-2157    :where(:root:not([data-density]), [data-density='default'])
#   jixoai.css:631-642      .jx-surface::after/.jx-surface-shadow law paint
#   tooltip.css:42-44       .jx-tip.jx-surface::after override
#   tooltip.css:70-92       @supports anchor block (contains the 84-91 shadow rule)
#   terminal-header.css:154-184 / 190-192 / 201-210
#   kernel-print.css:228-240 print whitelist (projected into @media print)
set -euo pipefail
cd "$(dirname "$0")/.."
REPO_ROOT="$(git rev-parse --show-toplevel)"
JX_PURE="$REPO_ROOT/registry/files/theme/jx-pure.css"
JIXOAI="$REPO_ROOT/registry/files/theme/jixoai.css"
TOOLTIP="$REPO_ROOT/registry/files/ui/tooltip/tooltip.css"
TERMHEADER="$REPO_ROOT/registry/files/ui/terminal-header/terminal-header.css"
KERNEL_PRINT="$REPO_ROOT/apps/www/src/lib/print/kernel-print.css"

OUT="src/app.css"
mkdir -p src
: > "$OUT"

w() { printf '%s\n' "$*" >> "$OUT"; }

w '/* app.css — spike/coexist shared setup (D2 manifest, FROZEN order):'
w '   tailwindcss → token vars → layer statement. Everything below the'
w '   frozen head is byte-copied from the repo sheets (see'
w '   scripts/sync-app-css.sh for the anchor map + sha256s). */'
w ''
if [ "${LAYER_HOIST:-0}" = "1" ]; then
  w '/* O1-H DIAGNOSTIC hoist (LAYER_HOIST=1): see sync-app-css.sh header. */'
  w '@layer properties, theme, base, components, stylex.priority1, stylex.priority2, stylex.priority3, utilities;'
fi
w ''
w "@import 'tailwindcss';"
w ''
w '/* ── SYNTHETIC TOKEN ENV (frozen Gate-1 r5 — EXACT, do not edit) ── */'
cat >> "$OUT" <<'EOF'
:root {
  --jx-gap: 0.5rem;
  --jx-inset: 0.75rem;
  --jx-hit: 2.5rem;
}
EOF
w ''
w "/* ── the repo's canonical layer statement (frozen position) ─────── */"
w '@layer theme, base, components, utilities;'
w ''
w "/* ── D2-10: the spike sets --brand-hue: 330 (equals the registry's"
w '      own default); --primary line byte-copied from jixoai.css:48 ── */'
w ':root {'
w '  --brand-hue: 330;'
sed -n '48p' "$JIXOAI" >> "$OUT"
w '}'
w ''
w '/* ── jixoai.css:896-1044 (byte copy) — the density BASE ladder'
w '      (--jx-unit + --jx-density-* definitions the lg/default rungs'
w '      resolve through) ──────────────────────────────────────────── */'
sed -n '896,1044p' "$JIXOAI" >> "$OUT"
w ''
w '/* ── jixoai.css:182-259 (byte copy) — the real .dark block ─────── */'
sed -n '182,259p' "$JIXOAI" >> "$OUT"
w ''
w '/* ── jixoai.css:261-285 (byte copy) — the real lg density rung ─── */'
sed -n '261,285p' "$JIXOAI" >> "$OUT"
w ''
w "/* ── jixoai.css:2133-2157 (byte copy) — the density-default block."
w '      At :root it LOSES to the synthetic :root above (:where = zero'
w "      specificity) — the synthetic env stands globally; a wrapper"
w "      [data-density='default'] activates the real chain per-subtree"
w '      (the D2-02 SECONDARY check) ────────────────────────────────── */'
sed -n '2133,2157p' "$JIXOAI" >> "$OUT"
w ''
w '/* ── jx-pure.css:265-280 (byte copy) — the real unlayered .jx-control'
w '      alias block ────────────────────────────────────────────────── */'
sed -n '265,280p' "$JX_PURE" >> "$OUT"
w ''
w '/* ── jx-pure.css:2255-2269 (byte copy) — the forced-colors Part C ── */'
sed -n '2255,2269p' "$JX_PURE" >> "$OUT"
w ''
w "/* ── jixoai.css:631-642 (byte copy) — the surface law's ::after paint"
w "      (the fallback D2-14's override disables) ────────────────────── */"
sed -n '631,642p' "$JIXOAI" >> "$OUT"
w ''
w '/* ── tooltip.css:42-44 (byte copy) — the real override ──────────── */'
sed -n '42,44p' "$TOOLTIP" >> "$OUT"
w ''
w '/* ── tooltip.css:70-92 (byte copy) — the @supports anchor block'
w '      containing .jx-tip[data-arrow] .jx-tip-shadow (84-91) ───────── */'
sed -n '70,92p' "$TOOLTIP" >> "$OUT"
w ''
w '/* ── terminal-header.css:154-184 (byte copy) — the subpanel law ─── */'
sed -n '154,184p' "$TERMHEADER" >> "$OUT"
w ''
w '/* ── terminal-header.css:190-192 (byte copy) — the ::backdrop ───── */'
sed -n '190,192p' "$TERMHEADER" >> "$OUT"
w ''
w '/* ── terminal-header.css:201-210 (byte copy) — the mega override ── */'
sed -n '201,210p' "$TERMHEADER" >> "$OUT"
w ''
w '/* ── kernel-print.css:228-240 (PROJECTED byte copy — the repo loads'
w '      this sheet as media=print via the pipeline; the spike wraps the'
w '      same three rules in @media print to project them into one sheet.'
w '      Receipt records this projection) ────────────────────────────── */'
w '@media print {'
sed -n '228,240p' "$KERNEL_PRINT" >> "$OUT"
w '}'
w ''
w '/* ══ SYNTHETIC spike-authored rules (frozen text in the D2 rows) ══ */'
w ''
w '/* D2-06 — the !important consumer rule */'
cat >> "$OUT" <<'EOF'
.consumer-force {
  padding: 42px !important;
}
EOF
w ''
w '/* D2-03 — the switch carve-out (manifest text verbatim) */'
cat >> "$OUT" <<'EOF'
:where(.switch-host:has(input:checked)) .rail {
  background: rgb(255, 0, 0);
}
EOF
w ''
w '/* D2-11 — the reduced-motion kill (unlayered :where) */'
cat >> "$OUT" <<'EOF'
@media (prefers-reduced-motion: reduce) {
  :where([data-d2='d2-11']) {
    animation: none;
  }
}
EOF
w ''
w '/* D2-13 — the print-sim exclusion rule (manifest text verbatim) */'
cat >> "$OUT" <<'EOF'
@media not print {
  [data-jx-print-sim] .sim-probe {
    background: rgb(18, 52, 86);
  }
}
EOF
w ''
w '/* D2-14 micro-fixture — the same override PATTERN wrapped in :where().'
w '   Marker renamed jx-tip → jx-tipx so the REAL override (.jx-tip.jx-surface,'
w "   which matches every .jx-tip.jx-surface on the page) cannot also apply"
w '   — the micro element faces ONLY the law'"'"'s paint (0,1,1) vs the'
w '   :where-wrapped kill (0,0,1), the mechanism the row isolates. */'
cat >> "$OUT" <<'EOF'
:where(.jx-tipx.jx-surface)::after {
  content: none;
}
EOF
w ''
w '/* ── control-build replicas (authored; equivalent declarations to the'
w '      stylex K paints — used by the TW-only control build only) ──── */'
cat >> "$OUT" <<'EOF'
.k-replica {
  padding: var(--jx-inset);
  background: var(--primary);
}

.k-glass-replica {
  backdrop-filter: blur(var(--jx-glass-radius, 10px));
}
EOF

echo "[sync-app-css] wrote $OUT ($(wc -l < "$OUT") lines; LAYER_HOIST=${LAYER_HOIST:-0})"
echo "[sync-app-css] sha256 of copied ranges (for the receipt):"
{
  echo "  jx-pure:265-280    $(sed -n '265,280p' "$JX_PURE" | shasum -a 256 | cut -d' ' -f1)"
  echo "  jx-pure:2255-2269  $(sed -n '2255,2269p' "$JX_PURE" | shasum -a 256 | cut -d' ' -f1)"
  echo "  jixoai:48          $(sed -n '48p' "$JIXOAI" | shasum -a 256 | cut -d' ' -f1)"
  echo "  jixoai:182-259     $(sed -n '182,259p' "$JIXOAI" | shasum -a 256 | cut -d' ' -f1)"
  echo "  jixoai:261-285     $(sed -n '261,285p' "$JIXOAI" | shasum -a 256 | cut -d' ' -f1)"
  echo "  jixoai:896-1044    $(sed -n '896,1044p' "$JIXOAI" | shasum -a 256 | cut -d' ' -f1)"
  echo "  jixoai:2133-2157   $(sed -n '2133,2157p' "$JIXOAI" | shasum -a 256 | cut -d' ' -f1)"
  echo "  jixoai:631-642     $(sed -n '631,642p' "$JIXOAI" | shasum -a 256 | cut -d' ' -f1)"
  echo "  tooltip:42-44      $(sed -n '42,44p' "$TOOLTIP" | shasum -a 256 | cut -d' ' -f1)"
  echo "  tooltip:70-92      $(sed -n '70,92p' "$TOOLTIP" | shasum -a 256 | cut -d' ' -f1)"
  echo "  termheader:154-184 $(sed -n '154,184p' "$TERMHEADER" | shasum -a 256 | cut -d' ' -f1)"
  echo "  termheader:190-192 $(sed -n '190,192p' "$TERMHEADER" | shasum -a 256 | cut -d' ' -f1)"
  echo "  termheader:201-210 $(sed -n '201,210p' "$TERMHEADER" | shasum -a 256 | cut -d' ' -f1)"
  echo "  kernelprint:228-240 $(sed -n '228,240p' "$KERNEL_PRINT" | shasum -a 256 | cut -d' ' -f1)"
}
