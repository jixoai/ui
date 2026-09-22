/**
 * cascader — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 6, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanisms live in the page's axis table).
 *
 * Corrections pinned to the extractor's documented ceilings:
 *   - options / value degrade to opaque aliases — `required` and
 *     `bindable` are ASSERTED here (the extractor never emits `?`
 *     optionality or the $bindable seam; from-meta.ts's documented
 *     ceiling), and value's display default is the family source's
 *     own `$bindable<string[]>([])` (cascader.svelte).
 *   - `separator` / `disabled` / `placeholder` / `class` defaults
 *     extract verbatim from the source; only the prose lives here.
 */
import type { PropsDocs } from '../from-meta';

export const CASCADER_DOCS: PropsDocs = {
  overrides: {
    options: {
      required: true,
      description:
        'The option tree: { value, label, disabled?, children? }. Level 0 renders options; each further level renders the children of the previous pick — the chain stops growing at the first leaf-less pick.',
    },
    name: {
      description:
        'Form field name — the joined path submits under it through the jx-form-field bridge (a path is not a single native control\'s value).',
    },
    value: {
      type: 'string[]',
      default: '[]',
      bindable: true,
      description:
        "The selected path as picked values, e.g. ['asia', 'japan'] (bind:value). Picking at level N truncates everything deeper, then appends; form reset clears it.",
    },
    separator: {
      description:
        "The join for the submitted string — the complete leaf path only (default 'asia/japan'). A partial path submits '', never a half-truth.",
    },
    disabled: {
      description:
        'Blocks the whole chain; form/fieldset disable propagates through the bridge (jx-disabled) and dims every select.',
    },
    label: {
      description:
        'Reads above the chain as the uppercase eyebrow; names the group (aria-label, falling back to "cascade") and labels the chain (aria-labelledby).',
    },
    placeholder: {
      description:
        'The disabled first option of a not-yet-picked level — level 0 before any pick, and each deeper level as the chain grows.',
    },
    class: {
      description:
        'Forwarded to the root group element, after the family\'s own atoms.',
    },
  },
};
