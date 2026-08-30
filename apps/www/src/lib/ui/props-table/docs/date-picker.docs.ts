/**
 * date-picker — the docs curation over the GENERATED meta
 * (docs-demo-standard pilot migration; zero-content-drift pinned by
 * test/props-table-meta-drift.spec.ts).
 *
 * THE extraction-ceiling exhibit: the source's Props is a UNION alias
 * (`type Props = SingleTimeProps | RangeOnlyProps`), which the
 * extractor's same-file resolution does not merge — kinds fall back
 * to initializer inference, so most type cells need honest
 * corrections here (design.md §1; the alias-merge is the retirement).
 * The `locale` row is the migration's ONE intentional content ADD:
 * the hand-written table predated the prop (stale — the exact drift
 * this change exists to kill); the meta-sourced render carries it.
 */
import type { PropsDocs } from '../from-meta';

export const DATE_PICKER_DOCS: PropsDocs = {
  overrides: {
    value: {
      type: 'string',
      description: 'ISO "YYYY-MM-DD" (or canonical "YYYY-MM-DDTHH:mm" with showTime); single mode committed value.',
      bindable: true,
    },
    range: {
      type: 'DatePickerRange',
      description: '{ start?, end? }; range mode committed value.',
      bindable: true,
    },
    mode: {
      type: "'single' | 'range'",
      description: 'Commit mode for the calendar.',
    },
    showTime: {
      description: 'v1 single-mode ONLY — mode="range" + showTime is a type error. Canonical "YYYY-MM-DDTHH:mm" local wall-clock value; the TimeStepper row mutates the time part, the grid the date part; each preserves the other.',
    },
    presets: {
      type: 'DatePickerPreset[]',
      description: 'Quick-pick lane entries ({ label, value: ISO date | { start, end } }); activation rides the exact grid-pick pipeline (commit + close). Malformed values are dropped.',
    },
    preset: {
      type: 'Snippet<[DatePickerPreset]>',
      description: 'Snippet escape for per-entry rich content; default renders the label text.',
    },
    isDisabled: {
      type: '(iso: string) => boolean',
      description: 'Consumer day predicate — true days wear the outside-day law (visible, not-allowed, uncommittable); the arrow walk skips them.',
    },
    label: {
      type: 'string',
      description: 'Field label; renders label[for] above the trigger.',
    },
    error: {
      type: 'string',
      description: 'Error text → aria-invalid + describedby + dashed trigger.',
    },
    placeholder: {
      description: 'Trigger text when nothing is committed.',
    },
    min: {
      type: 'string',
      description: 'ISO date; earlier days render disabled.',
    },
    max: {
      type: 'string',
      description: 'ISO date; later days render disabled.',
    },
    format: {
      type: "'iso' | 'locale'",
      description: 'Display format — the committed value stays canonical regardless.',
    },
    locale: {
      type: 'string',
      description: "BCP 47 locale for the panel vocabulary + the 'locale' display format (Intl.DateTimeFormat); default = the page's <html lang>.",
    },
    id: {
      type: 'string',
      default: 'auto',
      description: 'Wired into label[for] / error[id]; auto-generated when omitted.',
    },
    variant: {
      type: "'solid' | 'acrylic' | 'auto'",
      description: 'Floating-surface variant for the panel fill.',
    },
    class: {
      description: 'Class passthrough.',
    },
  },
};
