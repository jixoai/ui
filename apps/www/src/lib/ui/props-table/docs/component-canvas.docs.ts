/**
 * component-canvas — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 7, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the SIX axis-lane rows
 * into the generated Universal props section).
 *
 * The EXTRA lane (the chip precedent, doubled): `theme` and `density`
 * are family props sharing AXIS NAMES with their own value spaces —
 * theme is the stage-preview 'light'|'dark' bindable (the census
 * D-fold: the §13 no-rename law keeps the name; the theme AXIS lane
 * is left out of the defaults contract), density is the page-owned
 * Density rung bindable (the legacy local densitySlot('default')).
 * UNIVERSAL_AXIS_NAMES filters both out of the main table the moment
 * the generated section renders, so the extra lane re-adds them with
 * their real unions — the section summary says so (self-documenting
 * ceiling).
 */
import type { PropsDocs } from '../from-meta';

export const COMPONENT_CANVAS_DOCS: PropsDocs = {
  overrides: {
    title: {
      required: true,
      description:
        'Component name shown in the header. Also the aria slug seed: ids derive jx-canvas-<slug>-title/drawer deterministically (SSR and client agree).',
    },
    description: {
      description: 'One-line description under the title.',
    },
    sourceUrl: {
      description:
        'GitHub source link — header right, icon-only external anchor with press physics. The VALUE is page-side derived from the registry path projection ($lib/registry-source), never hand-written.',
    },
    install: {
      description:
        'Registry item name — renders the header copy-command badge (npx jixoai-ui add <name>) with a clipboard flash. Absent on canvases whose title is not a registry item.',
    },
    files: {
      required: true,
      description:
        'Demo code files; flat list, names may carry paths — the drawer\'s tree pane splits "/" paths into levels, one shape at every file count. Content comes from the page\'s ?raw imports (the files always arrive as data).',
    },
    children: {
      description: 'LIVE demo area — the consumer renders the component instance on the muted stage.',
    },
    stage: {
      description:
        "Stage posture: fill (default — children span the width), center (intrinsic specimens shrink + center), start (intrinsic, left).",
    },
    scroll: {
      description:
        "Stage scroll posture: capped (default — the scroll layer bounds at min(32rem, 60vh) with native auto-scroll) or grow — lifts the cap for full-composition demos whose own stacking IS the presentation.",
    },
    playground: {
      description:
        "Consumer-authored controls inside the floating dock's body. Absent snippet = the chrome-only dock (the eight-axis bar, no chevron, no body). Takes precedence over schema rows (escape-hatch law).",
    },
    schema: {
      description:
        'jsonSchema control mode: a LOWERED schema (the toJSONSchema export, passed by value) whose control rows the dock renders — the canvas becomes a jsonSchema2Form consumer; values initialize from the schema defaults.',
    },
    values: {
      bindable: true,
      default: 'schema defaults',
      description:
        'Schema-mode dock values — two-way. Initialized from the schema defaults when the page binds none; a bound page object always wins.',
    },
    onvalue: {
      description:
        'Schema-mode change seam: the page intercepts and owns value semantics for non-representable props (effect builders, …), writing back through bind:values.',
    },
    onreset: {
      description:
        "Page-owned reset: shows the dock body foot's reset button and calls back; absent, schema mode falls back to the schema defaults.",
    },
    output: {
      description:
        "Read-only state projection rows at the dock's foot — deliberately NOT a live region. Body-bearing on its own: an output-only canvas still gets a dock body.",
    },
    resolveFileContent: {
      description:
        'Code-drawer content override — lets usage files track live state (one source, two surfaces).',
    },
    id: {
      default: 'slug(title)',
      description:
        'Explicit id override when two canvases on one page would slug-collide — AND the canvas same-source extraction key: an id-carrying canvas\'s children are extracted by canvasPlugin into the page\'s virtual:jixoai-canvas module (no id = no extraction, zero cost). See the same-source section.',
    },
    stageLabel: {
      description:
        "The stage element's aria-label override — default `${title} demo`. For frozen probe identifiers a default cannot compose (the timeline family's mapping table).",
    },
    class: {
      description: 'Forwarded to the root section, after the workbench atoms.',
    },
    style: {
      description:
        'Extra inline style on the workbench root — JOINS the axis carriers (the merge law), never replaces them.',
    },
  },
  extra: [
    {
      name: 'theme',
      type: "'light' | 'dark'",
      default: "'light'",
      bindable: true,
      ambient: 'own',
      description:
        "Stage preview theme — page-owned bindable, flipped by the dock bar's theme axis button (aria-pressed carries state). Projects data-theme plus the theme sheet's dark/jx-light token-scope classes onto the STAGE element only; the docs chrome and sibling canvases never re-theme. Renders from the extra lane: the name is the §13-owned stage-preview seat, not the universal ThemeLane (the census D-fold row).",
    },
    {
      name: 'density',
      type: "'xs' | 'sm' | 'default' | 'lg'",
      default: "'default'",
      bindable: true,
      ambient: 'own',
      description:
        "Stage preview density — page-owned bindable, the repo-standard rung union, stamped as data-density on the STAGE element (the rung half of the axis; a scope boundary for the demo subtree). The destructure default keeps the lane permanently hot — the ambient zone never rides the stage. The universal density LANE is a separate channel: it rides the dock bar's menu into the root supply. Renders from the extra lane (the §13-owned seat, census D-fold row).",
    },
  ],
};
