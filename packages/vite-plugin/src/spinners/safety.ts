/**
 * @jixoai/ui-vite-plugin (spinners) — the RAW safety checker re-export
 * (P1, openspec spin-ora-svg-lane design §5, the R2 law).
 *
 * The spinners lane REUSES the icons' built-in RAW checker VERBATIM —
 * its rejection set (script / foreignObject / external-use elements,
 * on* event handlers, CDATA, foreign namespaces, byte size, path
 * command count) applies unchanged. SMIL elements (`animate`,
 * `animateTransform`, `set`) are NOT in the rejection set and SHALL
 * stay allowed: blocks-wave's 9 rects × 4 animates (~4.1KB, under the
 * 10KB default) pass every check, pinned by regression tests
 * (`<script>` rejected, `<animate>` allowed).
 *
 * If a future checker change ever rejects what SMIL needs, the
 * spinners lane gets its OWN allowance layered here — the icons
 * checker is NEVER weakened for the spinners' sake (R2).
 */

export { createSafetyChecker } from '../icons/safety.js';
export type {
  SafetyChecker,
  SafetyCheckerConfig,
  SafetyIssue,
  SafetyResult,
} from '../icons/types.js';
