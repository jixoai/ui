# packet-manifest — density-adoption (the single exact ownership source)

> THE mechanical input for the orchestrator's `git diff --name-only`
> check. `P(ui/foo/{a,b})` = exactly the listed files under BOTH
> `registry/files/ui/foo/` and `apps/www/src/lib/ui/foo/` — edited
> together, byte-identical. No `...`, no external pointers. Any
> changed path outside a packet's list is a merge stop.

#### K0 - contract/substrate (single owner, before concurrency)

Files:

- `P(theme/jixoai.css)`
- `P(lib/density.svelte.ts)`
- `P(ui/list-item/{index.ts,item.css,item.svelte,item-actions.svelte,item-after.svelte,item-checkbox.svelte,item-chevron.svelte,item-content.svelte,item-description.svelte,item-divider.svelte,item-end.svelte,item-field.svelte,item-footer.svelte,item-group.svelte,item-header.svelte,item-input.svelte,item-media.svelte,item-radio.svelte,item-select.svelte,item-title.svelte,item-toggle.svelte})`
- `openspec/specs/{design-tokens,css-architecture,component-authoring}/spec.md`
- `scripts/verify-density-kernel.mjs`
- `scripts/verify-density-adoption.mjs` (new)
- `scripts/density-adoption-registry.mjs` (new)
- `scripts/verify-item-ruler.mjs`
- `apps/www/test/density-context.spec.ts`
- `apps/www/test/list-item.spec.ts`
- `apps/www/test/list-item-field.spec.ts`
- `apps/www/src/routes/docs/components/list-item.html/+page.svelte`
- `apps/www/src/routes/docs/components/list-item.html/+page.ts`

K0 gates: resolver tests cover explicit/inherited/fallback, parent-lg plus
Table -> lg, no-parent Table -> sm, getter reactivity, and policy-only code;
the kernel remains 59/59 table plus 2 scanner checks; ruler remains 18/18;
matrix remains 37/37; both trees contain zero `controlSize`, `ItemSize`,
public `data-size`, and policy `size` aliases; and no manifest or registry
index is edited.

K0 must also close the archived residuals described in section 7 below.

#### F - jx-pure substrate (after K0, before A-E)

Files:

- `P(theme/jx-pure.css)`
- `openspec/specs/jx-pure/spec.md`
- `scripts/verify-jx-pure.mjs`
- `apps/www/test/jx-pure-parity.spec.ts`
- `apps/www/src/routes/docs/jx-pure.html/+page.svelte`
- `apps/www/src/routes/docs/jx-pure.html/+page.ts`
- `apps/www/src/lib/blueprints/scenes/jx-pure.svelte`
- `apps/www/src/lib/blueprints/scenes/native-form.svelte`

F gates: canonical/mirror CSS equality; a self-contained canonical fixture;
v2 names only; xs/sm/default/lg scopes; layer precedence; dark/light,
forced-colors, reduced-motion, shadow-root, and Tier-1 consume-only proofs;
and a complete 65-check browser run rather than a partial pass.

#### A - form-text

Files:

- `P(ui/input/{input.svelte,index.ts,input.css})`
- `P(ui/textarea/{textarea.svelte,index.ts})`
- `P(ui/select/{select.svelte,index.ts,select.css})`
- `P(ui/native-select/{native-select.svelte,index.ts,native-select.css})`
- `P(ui/number-input/{number-input.svelte,index.ts,number-input.css})`
- `P(ui/tags-input/{tags-input.svelte,index.ts,tags-input.css})`
- `P(ui/input-otp/{input-otp.svelte,index.ts,input-otp.css})`
- `P(ui/file-input/{file-input.svelte,index.ts,file-input.css})`
- `apps/www/test/density-adoption-form-text.spec.ts` (new)
- `apps/www/src/routes/docs/components/{form,input,textarea,select,native-select,number-input,tags-input,input-otp,file-input}.html/{+page.svelte,+page.ts}`
- `apps/www/src/lib/blueprints/scenes/{input,textarea,select,native-select,number-input,tags-input,input-otp,file-input,form-field}.svelte`

A gates: Svelte inheritance/stamps for every root; shell, OTP, chip, and
stepper hit geometry at xs/default/lg; adoption registry packet A; source /
mirror equality; and a docs density ladder with a real click-target probe.
NativeSelect popup and Input type passthrough remain unchanged.

#### B - form-boolean

Files:

- `P(ui/checkbox/{checkbox.svelte,index.ts,checkbox.css})`
- `P(ui/radio/{radio.svelte,index.ts,radio.css})`
- `P(ui/toggle/{toggle.svelte,index.ts,toggle.css})`
- `P(ui/toggle-group/{index.ts,toggle-group-item.svelte,toggle-group.css,toggle-group.svelte})`
- `P(ui/range/{range.svelte,index.ts,range.css})`
- `P(ui/color-picker/{color-picker.svelte,index.ts,color-picker.css})`
- `apps/www/test/density-adoption-form-boolean.spec.ts` (new)
- `apps/www/src/routes/docs/components/{checkbox,radio,toggle,toggle-group,range,color-picker}.html/{+page.svelte,+page.ts}`
- `apps/www/src/lib/blueprints/scenes/{checkbox,radio,toggle,toggle-group,range,color-picker}.svelte`

B gates: checkbox/radio wrapper activation rectangles are at least `ctl-hit`
while visual squares are `ctl-icon`; toggle equations hold and footprint
`size`/`controlSize` are absent; range keyboard/pointer semantics remain
green; the color map is allowlisted structural geometry; and adoption packet B
passes.

#### C - buttons and navigation controls

Files:

- `P(ui/press-button/{press-button.svelte,index.ts,press-button.css})`
- `P(ui/icon-button/{icon-button.svelte,index.ts})`
- `P(ui/float-button/{float-button.svelte,index.ts,float-button.css})`
- `P(ui/anchor/{anchor.svelte,anchor-item.svelte,index.ts})`
- `P(ui/pagination/{index.ts,pagination-content.svelte,pagination-ellipsis.svelte,pagination-item.svelte,pagination-link.svelte,pagination-next.svelte,pagination-previous.svelte,pagination-range.ts,pagination.svelte})`
- `apps/www/test/density-adoption-buttons.spec.ts` (new)
- `apps/www/src/routes/docs/components/{press-button,icon-button,float-button,anchor,pagination}.html/{+page.svelte,+page.ts}`
- `apps/www/src/lib/blueprints/scenes/{press-button,icon-button,scaffold-float,anchor,pagination}.svelte`

C gates: every interactive body is `ctl-hit`; press, bevel, focus, and
icon-button composition laws remain; link and pagination semantics remain; and
adoption packet C passes.

#### D - menus

Files:

- `P(ui/dropdown-menu/{dropdown-menu.svelte,dropdown-menu-item.svelte,index.ts,dropdown-menu.css})`
- `P(ui/menubar/{index.ts,menubar-item.svelte,menubar-menu-item.svelte,menubar-panel.svelte,menubar-trigger.svelte,menubar.css,menubar.svelte})`
- `P(ui/navigation-menu/{index.ts,navigation-menu-item.svelte,navigation-menu-link.svelte,navigation-menu-panel.svelte,navigation-menu-trigger.svelte,navigation-menu.svelte})`
- `P(ui/command/{command-empty.svelte,command-group.svelte,command-input.svelte,command-item.svelte,command-list.svelte,command.css,command.svelte,index.ts})`
- `P(ui/popconfirm/{index.ts,popconfirm.css,popconfirm.svelte})`
- `P(ui/breadcrumb/{breadcrumb-collapse.svelte,breadcrumb-ellipsis.svelte,breadcrumb-item.svelte,breadcrumb-link.svelte,breadcrumb-list.svelte,breadcrumb-page.svelte,breadcrumb-separator.svelte,breadcrumb.css,breadcrumb.svelte,index.ts})`
- `apps/www/test/density-adoption-menus.spec.ts` (new)
- `apps/www/src/routes/docs/components/{dropdown-menu,menubar,navigation-menu,command,popconfirm,breadcrumb}.html/{+page.svelte,+page.ts}`
- `apps/www/src/lib/blueprints/scenes/{dropdown-menu,menubar,navigation-menu,command,popconfirm,breadcrumb}.svelte`

D gates: trigger and nested panel roots stamp the resolved density; rows keep
the hit floor; keyboard roving, light dismiss, popover motion, and alignment
remain green; and the probe covers all four scopes plus root-default and
inherited-parent overrides. Adoption packet D passes.

#### E - data and status

Files:

- `P(ui/table/{table.svelte,index.ts,table.css})`
- `P(ui/tabs/{tabs.svelte,tabs-list.svelte,tabs-trigger.svelte,tabs-content.svelte,index.ts,tabs-trigger.css})`
- `P(ui/descriptions/{descriptions-item.svelte,descriptions.css,descriptions.svelte,index.ts})`
- `P(ui/statistic/{statistic.svelte,index.ts})`
- `P(ui/badge/{badge.svelte,index.ts})`
- `P(ui/kbd/{kbd.svelte,index.ts})`
- `P(ui/empty/{empty.svelte,index.ts})`
- `P(ui/result/{result.svelte,index.ts})`
- `P(ui/timeline/{index.ts,timeline-connector.svelte,timeline-content.svelte,timeline-dot.svelte,timeline-item.svelte,timeline-time.svelte,timeline-title.svelte,timeline.css,timeline.svelte})`
- `P(ui/steps/{index.ts,steps-description.svelte,steps-indicator.svelte,steps-item.svelte,steps-separator.svelte,steps-title.svelte,steps.css,steps.svelte})`
- `apps/www/test/density-adoption-data.spec.ts` (new)
- `apps/www/src/routes/docs/components/{table,tabs,descriptions,statistic,badge,kbd,empty,result,timeline,steps}.html/{+page.svelte,+page.ts}`
- `apps/www/src/lib/blueprints/scenes/{table,tabs,descriptions,statistic,badge,kbd,empty,result,timeline,steps}.svelte`

E gates: unparented Table defaults to `sm` and parent-lg Table resolves `lg`;
cells, tabs, descriptions, status labels, and indicators consume aliases;
column/overflow and structural media geometry are allowlisted; and adoption
packet E passes.

#### G - continuity and Owner handoff

Files:

- `apps/www/src/lib/blueprints/scenes/density.svelte`
- `apps/www/src/routes/blueprints.html/+page.svelte` only if registration is
  needed
- generated `apps/www/static/blueprints/*.svg` only through
  `npm run build:blueprints`; never hand-edited

G owns final build, manifest/payload parity, all tests and gates, and the Owner
walkthrough. It does not absorb family docs or repair packet overlap.

