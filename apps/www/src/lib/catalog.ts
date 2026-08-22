/**
 * The component catalog (apps/www/src/lib/catalog.ts).
 * ONE inventory for the whole site: the overview page and the header
 * mega menu both derive from it, and catalog.spec.ts locks it BI-
 * DIRECTIONALLY against registry.json — a registry item without a
 * catalog entry (or a dead docs link) fails the suite.
 *
 * Grouping follows antd's official taxonomy (General / Layout /
 * Navigation / Data Entry / Data Display / Feedback) plus Engines &
 * Theme and Docs Tooling for this repo's own surfaces.
 *
 * Intent (2026-08-22, user): 组件应全量展示但 overview/导航未覆盖；
 * 参考业界分组（antd 官方类目）重新分组。
 */

export type CatalogGroupId =
  | 'general'
  | 'layout'
  | 'navigation'
  | 'data-entry'
  | 'data-display'
  | 'feedback'
  | 'engines'
  | 'docs'
;

export interface CatalogGroup {
  id: CatalogGroupId;
  /** english label (antd taxonomy naming) */
  label: string;
  /** chinese label */
  zh: string;
  /** one-line scope */
  description: string;
}

export interface CatalogEntry {
  /** registry item name (the `npx jixoai-ui add` argument) */
  name: string;
  group: CatalogGroupId;
  /** registry type eyebrow */
  type: string;
  summary: string;
  /** docs page (anchor optional) */
  href: string;
}

export const CATALOG_GROUPS: CatalogGroup[] = [
  { id: 'general', label: 'General', zh: '通用', description: 'The base atoms every surface rides on' },
  { id: 'layout', label: 'Layout', zh: '布局', description: 'Page structure, shells, and separators' },
  { id: 'navigation', label: 'Navigation', zh: '导航', description: 'Moving through a site or a wizard' },
  { id: 'data-entry', label: 'Data Entry', zh: '数据录入', description: 'Forms, picks, and the ElementInternals bridge' },
  { id: 'data-display', label: 'Data Display', zh: '数据展示', description: 'Reading data: tables, cards, streams, states' },
  { id: 'feedback', label: 'Feedback', zh: '反馈', description: 'Surfaces, overlays, and outcome states' },
  { id: 'engines', label: 'Engines & Theme', zh: '引擎与主题', description: 'Framework-free libs and the token sheet' },
  { id: 'docs', label: 'Docs Tooling', zh: '文档工具', description: 'The documentation workbench itself' },
];

export const CATALOG: CatalogEntry[] = [
  { name: 'jixoai-theme', group: 'engines', type: 'registry:theme', summary: 'The jixoai design-language token sheet: OKLCH colors with the one-brand-hue law, hard offset shadows, radius 0 with be…', href: '/tokens.html' },
  { name: 'toc-engine', group: 'engines', type: 'registry:lib', summary: 'Framework-free table-of-contents engine: per-frame geometry snapshot computes IoM weights (intersection area / min(blo…', href: '/components/toc.html' },
  { name: 'reveal', group: 'engines', type: 'registry:lib', summary: 'Svelte action for one-shot scroll-reveal entrances.', href: '/components/overview.html' },
  { name: 'press-button', group: 'general', type: 'registry:ui', summary: 'The brutalist press-physics button: lifts toward the viewer on hover (shadow xs → md), presses back into the page on active.', href: '/components/press-button.html' },
  { name: 'section-card', group: 'layout', type: 'registry:ui', summary: 'The content atom of the jixoai site grammar: bordered card, header block with eyebrow (brand hue, Share Tech Mono, tra…', href: '/components/section-card.html' },
  { name: 'terminal-header', group: 'layout', type: 'registry:ui', summary: 'The site nav bar with a clear two-wing layout —', href: '/components/terminal-header.html' },
  { name: 'terminal-footer', group: 'layout', type: 'registry:ui', summary: 'Ghost wordmark footer: huge hollow brand word (text-stroke recipe with @supports fallback), muted meta row with links …', href: '/components/terminal-footer.html' },
  { name: 'theme-toggle', group: 'general', type: 'registry:ui', summary: 'light / dark / system control in four variants: full (segmented icon+label selector), compact (icon + current), icon (…', href: '/components/theme-toggle.html' },
  { name: 'toc', group: 'navigation', type: 'registry:ui', summary: 'The jixoai Combo table of contents: desktop Rule Tracker (scroll-progress spine, weight-driven nodes on level-1, weigh…', href: '/components/toc.html' },
  { name: 'website-scaffold', group: 'layout', type: 'registry:ui', summary: 'WebsiteScaffold —', href: '/components/website-scaffold.html' },
  { name: 'terminal-card', group: 'data-display', type: 'registry:ui', summary: 'The Broadside hero terminal, composed after the openspecui reference: traffic-light title bar, one large typed command…', href: '/components/terminal-card.html' },
  { name: 'hero-section', group: 'layout', type: 'registry:ui', summary: 'The Broadside hero, composed after the openspecui reference: clamp-scaled bold lead type with a primary accent tail, b…', href: '/components/hero-section.html' },
  { name: 'language-switcher', group: 'navigation', type: 'registry:ui', summary: 'Locale switching in two variants: pair (icon + segmented two-locale group, active fills brand hue —', href: '/components/language-switcher.html' },
  { name: 'card-grid', group: 'layout', type: 'registry:ui', summary: 'Grid + subgrid layout that equalizes cards: shared header row and body row, so headers align and bodies fill to the tallest —', href: '/components/card-grid.html' },
  { name: 'input', group: 'data-entry', type: 'registry:ui', summary: 'NativeHTML input: every native type passes through.', href: '/components/form.html#all-types' },
  { name: 'select', group: 'data-entry', type: 'registry:ui', summary: 'Custom select built on the native Popover API + CSS Anchor Positioning: popover=\'auto\' light-dismiss panel, listbox ro…', href: '/components/form.html#select-textarea' },
  { name: 'textarea', group: 'data-entry', type: 'registry:ui', summary: 'NativeHTML textarea with the jixoai text shell; rows pass-through (default 4), resize: vertical.', href: '/components/form.html#select-textarea' },
  { name: 'scaffold-float', group: 'layout', type: 'registry:ui', summary: 'The consumer-side half of the WebsiteScaffold float provider: renders children into the scaffold\'s top layer (.jx-top-…', href: '/components/scaffold-float.html' },
  { name: 'dialog', group: 'feedback', type: 'registry:ui', summary: 'NativeHTML dialog: a native <dialog> base with showModal() — focus trap, Escape, top-layer rendering for free.', href: '/components/dialog.html' },
  { name: 'popover', group: 'feedback', type: 'registry:ui', summary: 'NativeHTML popover: the native Popover API base (popover=\'auto\' light dismiss, popovertarget trigger) — ZERO JavaScript.', href: '/components/popover.html' },
  { name: 'code-card', group: 'data-display', type: 'registry:ui', summary: 'Code display highlighting through Shiki (lib/shiki —', href: '/components/code-card.html' },
  { name: 'shiki', group: 'engines', type: 'registry:lib', summary: 'Thin Shiki integration —', href: '/components/code-card.html' },
  { name: 'icons', group: 'engines', type: 'registry:lib', summary: 'Shared inline SVG icon strings —', href: '/components/overview.html' },
  { name: 'form-field', group: 'data-entry', type: 'registry:lib', summary: 'The faceless form-associated custom element (<jx-form-field>) that restores FormData submission to the family\'s custom…', href: '/components/form.html' },
  { name: 'table', group: 'data-display', type: 'registry:ui', summary: 'NativeHTML table with jixoai styling, driven by container queries on its own frame (not the viewport): full semantic t…', href: '/components/table.html' },
  { name: 'tree-view', group: 'data-display', type: 'registry:ui', summary: 'NativeHTML ARIA tree (ul[role=tree] with roving tabindex, arrow-key contract): directory nodes with collapsible arrows…', href: '/components/tree-view.html' },
  { name: 'component-canvas', group: 'docs', type: 'registry:ui', summary: 'The component documentation workbench: header (title + description + GitHub Source link), LIVE demo stage (children sn…', href: '/components/component-canvas.html' },
  { name: 'checkbox', group: 'data-entry', type: 'registry:ui', summary: 'Pure-CSS checkbox: appearance-none + 16px square + 1px border, :checked fills primary with a white checkmark (clip-pat…', href: '/components/form.html#example-form' },
  { name: 'radio', group: 'data-entry', type: 'registry:ui', summary: 'Pure-CSS radio: appearance-none + 16px circle, :checked border primary + inner 8px dot (scale 0→1 transition), error w…', href: '/components/form.html#example-form' },
  { name: 'toggle', group: 'data-entry', type: 'registry:ui', summary: 'Checkbox in inline-end posture: sr-only checkbox + label-wrapped track (36×20 md / 28×16 sm / 44×24 lg), knob slides 2…', href: '/components/form.html#example-form' },
  { name: 'native-select', group: 'data-entry', type: 'registry:ui', summary: 'The original native <select> with appearance-none and self-drawn chevron —', href: '/components/form.html#select-textarea' },
  { name: 'number-input', group: 'data-entry', type: 'registry:ui', summary: '[- NUM +] stepper: 28px square buttons (press physics, font-nav bold characters), centered chromeless input, click + l…', href: '/components/form.html#all-types' },
  { name: 'range', group: 'data-entry', type: 'registry:ui', summary: 'Form wave 2 —', href: '/components/form.html#all-types' },
  { name: 'date-picker', group: 'data-entry', type: 'registry:ui', summary: 'Form wave 2 —', href: '/components/form.html#all-types' },
  { name: 'file-input', group: 'data-entry', type: 'registry:ui', summary: 'Form wave 2 —', href: '/components/form.html#all-types' },
  { name: 'color-picker', group: 'data-entry', type: 'registry:ui', summary: 'Color selection with SV pad + hue bar, format constraints (hex/hsl/oklch), Eye Dropper API support, swatch + value dis…', href: '/components/form.html#all-types' },
  { name: 'combobox', group: 'data-entry', type: 'registry:ui', summary: 'Searchable select with custom-value input: real-time label filtering, allowCustom for free-text values, popover panel …', href: '/components/form.html#all-types' },
  { name: 'tags-input', group: 'data-entry', type: 'registry:ui', summary: 'Input + multiselect hybrid: flex-wrap tag chips with press-physics removal, Enter/comma/Tab/paste-split to add, Backsp…', href: '/components/form.html#all-types' },
  { name: 'badge', group: 'data-display', type: 'registry:ui', summary: 'The inline status chip of the site grammar: Share Tech Mono uppercase micro-label, 1px border, radius 0.', href: '/components/badge.html' },
  { name: 'separator', group: 'layout', type: 'registry:ui', summary: 'W3C-first: the horizontal separator IS the native <hr> (thematic break semantics for free); only the vertical posture …', href: '/components/separator.html' },
  { name: 'skeleton', group: 'feedback', type: 'registry:ui', summary: 'The loading placeholder block: muted surface with a terminal brightness pulse, aria-hidden, pure CSS.', href: '/components/skeleton.html' },
  { name: 'avatar', group: 'data-display', type: 'registry:ui', summary: 'NativeHTML <img> — lazy, async-decoded, intrinsic width/height so layout never shifts; radius-0 brutalist square.', href: '/components/avatar.html' },
  { name: 'alert', group: 'feedback', type: 'registry:ui', summary: 'The inline notice block (not the modal alert-dialog): 1px border, hard offset shadow-xs, tone accent on border + title.', href: '/components/alert.html' },
  { name: 'accordion', group: 'data-display', type: 'registry:ui', summary: 'W3C-first: the accordion IS <details>/<summary> — native toggle semantics, keyboard support and SSR state, nothing to hydrate.', href: '/components/accordion.html' },
  { name: 'tabs', group: 'navigation', type: 'registry:ui', summary: 'WAI-ARIA APG tabs, composition-first: four family files sharing one context.', href: '/components/tabs.html' },
  { name: 'progress', group: 'feedback', type: 'registry:ui', summary: 'W3C-first: progress IS the native <progress> element — role, value semantics and the indeterminate state are the browser\'s.', href: '/components/progress.html' },
  { name: 'tooltip', group: 'feedback', type: 'registry:ui', summary: 'The hover-intent hint on the popover laws: a popover=manual panel (no light dismiss —', href: '/components/tooltip.html' },
  { name: 'pagination', group: 'navigation', type: 'registry:ui', summary: 'W3C-first: pagination is a nav landmark of ordinary links —', href: '/components/pagination.html' },
  { name: 'dropdown-menu', group: 'navigation', type: 'registry:ui', summary: 'The ARIA menu pattern on the popover laws: popover=auto panel (light dismiss, Escape, top layer native) + CSS Anchor P…', href: '/components/dropdown-menu.html' },
  { name: 'breadcrumb', group: 'navigation', type: 'registry:ui', summary: 'W3C-first: a breadcrumb trail is nav[aria-label] over an ordered list of real links —', href: '/components/breadcrumb.html' },
  { name: 'kbd', group: 'general', type: 'registry:ui', summary: 'The keyboard-input glyph: a native <kbd> —', href: '/components/kbd.html' },
  { name: 'toast', group: 'feedback', type: 'registry:ui', summary: 'Two seams, per the design ruling: createToastStore() (framework-free state + lifecycle —', href: '/components/toast.html' },
  { name: 'alert-dialog', group: 'feedback', type: 'registry:ui', summary: 'The destructive-decision surface on the dialog laws: native <dialog> showModal() + the same generation-token close pat…', href: '/components/alert-dialog.html' },
  { name: 'sheet', group: 'feedback', type: 'registry:ui', summary: 'The side drawer as a dialog POSITIONING variant, not a second state machine: showModal() (focus trap, Escape, top laye…', href: '/components/sheet.html' },
  { name: 'hover-card', group: 'feedback', type: 'registry:ui', summary: 'The rich interactive cousin of tooltip: same intent model (hover delay in, cancellable close grace, focus opens instan…', href: '/components/hover-card.html' },
  { name: 'input-otp', group: 'data-entry', type: 'registry:ui', summary: 'The one-time-code field: N single-character inputs with the mechanics a raw stack lacks —', href: '/components/input-otp.html' },
  { name: 'toggle-group', group: 'data-entry', type: 'registry:ui', summary: 'The joined-button set submitting as one form field: type=single presses one button (\'\' when none), type=multiple presses several —', href: '/components/toggle-group.html' },
  { name: 'carousel', group: 'data-display', type: 'registry:ui', summary: 'W3C-first: a carousel IS a scrolled region —', href: '/components/carousel.html' },
  { name: 'command', group: 'feedback', type: 'registry:ui', summary: 'The ⌘K surface on the batch-4 design ruling: native dialog showModal (modal task —', href: '/components/command.html' },
  { name: 'navigation-menu', group: 'navigation', type: 'registry:ui', summary: 'The site-nav bar as an independent thin coordinator (not raw popovers): top-level ←/→ walking with roving tabindex, on…', href: '/components/navigation-menu.html' },
  { name: 'menubar', group: 'navigation', type: 'registry:ui', summary: 'The application menu bar with its OWN walker (the top-level contract differs from stacked dropdowns): ←/→ move between…', href: '/components/menubar.html' },
  { name: 'popconfirm', group: 'feedback', type: 'registry:ui', summary: 'The LIGHT confirm bubble for risky-but-reversible actions —', href: '/components/popconfirm.html' },
  { name: 'empty', group: 'data-display', type: 'registry:ui', summary: 'The no-data state of the eight-state machine — nothing more (error/loading/404 are alert/result surfaces).', href: '/components/empty.html' },
  { name: 'descriptions', group: 'data-display', type: 'registry:ui', summary: 'The enterprise detail view, W3C-first: a dl IS a description list — dt/dd pairs in a grid of term/value cells.', href: '/components/descriptions.html' },
  { name: 'steps', group: 'navigation', type: 'registry:ui', summary: 'The wizard progress: an ol where order is the semantics.', href: '/components/steps.html' },
  { name: 'spin', group: 'feedback', type: 'registry:ui', summary: 'The loading indicator, terminal voice: a bracket cursor cycling [/ — \\ |].', href: '/components/spin.html' },
  { name: 'statistic', group: 'data-display', type: 'registry:ui', summary: 'The metric readout: micro-label over a big tabular-nums value with prefix/suffix snippets and a text-glyph trend (▲ pr…', href: '/components/statistic.html' },
  { name: 'timeline', group: 'data-display', type: 'registry:ui', summary: 'The activity stream: an ol of timestamped entries with a CSS spine and dot markers —', href: '/components/timeline.html' },
  { name: 'result', group: 'feedback', type: 'registry:ui', summary: 'The page-level outcome of an operation —', href: '/components/result.html' },
  { name: 'transfer', group: 'data-entry', type: 'registry:ui', summary: 'The two-panel selector: each side is a real fieldset of real checkboxes (native multi-select semantics), the middle bu…', href: '/components/transfer.html' },
  { name: 'cascader', group: 'data-entry', type: 'registry:ui', summary: 'The cascade selector, chain-of-selects route (the ruled default): N plain <select> elements, each listing the children…', href: '/components/cascader.html' },
  { name: 'image', group: 'data-display', type: 'registry:ui', summary: 'The general-purpose picture on avatar\'s proven laws: native <img>, lazy, async-decoded, REQUIRED intrinsic width/heigh…', href: '/components/image.html' },
  { name: 'float-button', group: 'general', type: 'registry:ui', summary: 'The floating action button: a fixed corner button in two idioms — plain (a lone action, e.g.', href: '/components/float-button.html' },
  { name: 'badge-indicator', group: 'data-display', type: 'registry:ui', summary: 'antd Badge\'s live half —', href: '/components/badge-indicator.html' },
  { name: 'anchor', group: 'navigation', type: 'registry:ui', summary: 'The heading-anchor link list (antd\'s Anchor) —', href: '/components/anchor.html' },
  { name: 'tour', group: 'feedback', type: 'registry:ui', summary: 'The guided walkthrough, implemented against the recorded design contract: anchor-name as a REVERSIBLE LEASE on each st…', href: '/components/tour.html' },
  { name: 'scroll-spy', group: 'engines', type: 'registry:lib', summary: 'The ONE plain line-pick implementation (the drift-closure ruling: no second active-pick algorithm).', href: '/components/anchor.html' },
];

/** entries grouped in taxonomy order (for menus and index pages) */
export function catalogByGroup(): { group: CatalogGroup; entries: CatalogEntry[] }[] {
  return CATALOG_GROUPS.map((group) => ({
    group,
    entries: CATALOG.filter((entry) => entry.group === group.id),
  }));
}
