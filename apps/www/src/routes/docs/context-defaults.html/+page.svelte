<script lang="ts">
  import Alert from '$lib/ui/alert/alert.svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';

  // ToC lives in +page.ts (firstpaint era: the layout's chrome snippet
  // owns the rail from page data) — keep the section ids in sync there.

  // The before picture — five dialects, one per axis (proposal.md Why;
  // the idiom column is the RETIRED call shape, kept verbatim so the
  // page documents the migration, not a caricature of it).
  const dialectCode = `/* the five dialects (before) — one ambient channel per axis,
   each with its own key, its own helper, its own ?? chain: */
density     DENSITY_KEY + plugin seam    resolveDensity(e, ctx)
medium      read-only projection         getMedium()
hue         runtime adapter              createHueContext()
button paint  BUTTON_GROUP_KEY zone      variant ?? scope.variant
entity depth  entity.svelte.ts accum     provideEntity()

/* the reads lived inline, in every component: */
variant ?? group?.variant ?? 'outline'        // press-button, before`;

  // The Compose alignment (facts verified against androidx-main
  // Card.kt + MaterialTheme, proposal.md) — table form below; the
  // read order is the load-bearing shape:
  const layerCode = `plugins (print & other cross-cutting)   ← kernel never knows components,
   ↓                                       intervenes on AXIS VALUES only
axes (few, structural)
   density │ paint                          ← the two collected into slots
   entity-depth │ medium (read-only) │ hue  ← keep their own mechanisms
   ↓ ONE read point per family
<Component>Defaults                          ← this change: the organization layer
   ↓ projects
resolved props (full values, inferred types, getter-endorsed)
   ↓ overridden by
explicit props (omit → the factory decides)`;

  // The contract file — REAL family code, trimmed to the
  // load-bearing lines (kbd-defaults.svelte.ts; same-source law: the
  // shipped file is the authority — the values line is verbatim and
  // drift-checked by test/guide-same-source.spec.ts; the page writes
  // @lib paths for the reader, the file ships $lib).
  const contractCode = `// kbd-defaults.svelte.ts — the family's ONE ambient contract
import { defineComponentDefaults, defineLiteralSlot } from '@lib/defaults.svelte';
import { densitySlot } from '@lib/density.svelte';

// the named slot constant — the values tuple IS the union's source:
// default ∈ values is compile-locked, an own outside the tuple
// never compiles
export const kbdVariantSlot = defineLiteralSlot(['fill', 'tonal', 'outline'], 'tonal');

// the union, looked up — no hand-declared twin beside the values
export type KbdVariant = ReturnType<typeof kbdVariantSlot>;

export const KbdDefaults = defineComponentDefaults({
  variant: kbdVariantSlot,  // explicit ?? own, reads no context (class b)
  density: densitySlot(),   // no family own — a no-opinion slot
});`;

  // The consumer side — one line inside the component:
  const resolveCode = `<!-- inside press-button.svelte: the family's SINGLE audited read point.
     d.variant / d.density are fully typed and already resolved. -->
const d = $derived(PressButtonDefaults.resolve({ variant, density }));

// slot resolution law, one line, every slot the same:
//    explicit prop ?? ambient axis ?? own default
// a no-opinion slot (density with no own) has no last resort: it
// resolves to no opinion, stamps nothing, and the ambient css scope
// channel keeps flowing (the fleet law).`;

  // The provider lane (r11 #1 + r12 #3) — inherit-then-provide families
  // (tabs, real form, trimmed): the EAGER capture happens in the
  // argument position — read before this component's own setContext
  // write — or the derived reads its own write and loops
  // (derived_references_self); Defaults.resolve then stacks ON the lane.
  const providerLaneCode = `// tabs.svelte — inherit-then-provide, the complete frozen form:
// 1. eager-capture the PARENT's value (argument position = statement
//    time, BEFORE this component writes its own key)
const resolvedDensity = $derived.by(
  ((inherited) => () => resolveDensity(density, inherited))(getDensityContext()),
);
provideDensity(() => resolvedDensity);

// 2. the family Defaults read stacks on the lane: the slot's ambient
//    read lands on the provider ABOVE, terminates at the captured
//    parent — one resolution per subtree, value pinned by tests
const d = $derived(TabsDefaults.resolve({ density }));`;

  // classification b's scalar faces — the closed boolean domain takes
  // the values form; the open domain (a free CSS length, no union to
  // enumerate) takes defineOpenSlot with the explicit type argument
  // (the absentSlot discipline). REAL family code, trimmed.
  const literalCode = `// the literal family's scalar faces — trimmed from two families:
export const descriptionsBorderedSlot = defineLiteralSlot([false, true], false);

export const sheetSizeSlot = defineOpenSlot<string>('24rem');
// ↑ the drawer extent is a free CSS length — no closed union to
//   enumerate; a future size axis would first have to close the
//   union, at which point this slot migrates back to the values form.

// and the upgrade path stays documented in the file header: freeze a
// table row → promote to definePaintSlot(values, own) — kbd's
// convention.`;

  // The consumer recipes — the page's front door (the Owner
  // walk-through ruling, 2026-09-03): the "how do I change a
  // subtree's defaults" question leads; the system story follows.
  // A literal closing-script tag inside the code string would
  // terminate this component's own script tag during the HTML-level
  // scan — splice it.
  const close = '</' + 'script>';
  const scopeCode = `<script lang="ts">
  import PressButton from '@ui/press-button/press-button.svelte';
  import { ButtonVariantScope } from '@ui/button-group/index';
${close}

<!-- the zone, layout-free — nothing renders but the buttons: no
     group, no seams, no DOM of its own. Every PressButton/IconButton
     inside that passes no variant adopts ghost; an explicit variant
     always wins (explicit ?? ambient ?? own). This is Dialog's own
     maneuver, verbatim: the head and foot zones wrap their content
     in exactly this scope. -->
<ButtonVariantScope variant="ghost">
  <PressButton>adopts ghost</PressButton>
  <PressButton>adopts ghost</PressButton>
  <PressButton variant="fill">keeps fill</PressButton>
</ButtonVariantScope>

<!-- link is NOT a zone value: variant="link" is a compile error —
     link stays reachable only through PressButton's own explicit
     prop (the interaction exception has no zone meaning) -->`;

  const groupCode = `<!-- the zone AND the join in one: variant here is the zone
     default the children adopt, not a bezel paint — the group paints
     nothing of its own -->
<ButtonGroup variant="ghost" label="row actions">
  <PressButton>adopts ghost</PressButton>
  <PressButton variant="fill">keeps fill</PressButton>
</ButtonGroup>`;

  const densityCode = `<!-- density needs no provider component: the ambient css
     scope channel reads [data-density] on ANY ancestor — stamp a
     wrapper and every density-aware component in the subtree follows
     (the four-tier ruler switches as one); a component's own density
     prop still wins. The full ruler lives in /tokens.html -->
<section data-density="sm">
  <!-- tables, menus, inputs — the whole subtree takes the compact tier -->
</section>`;

  const pluginCode = `// layer 3 — plugins intervene on AXIS VALUES, before any slot reads:
// the print story (real source, print/context-plugin.ts) maps any
// resolved density onto the EXISTING sm tier — no invented paper
// tier, the four-tier law holds — gated to the print projection
import { definePlugin } from '@lib/context-plugin.svelte';
import { DENSITY_DEF } from '@lib/density.svelte';
import type { Density } from '@lib/density.svelte';

// targets bind a DEF (an identity object, not a string): the hook
// types flow from the def — before receives the FULL resolution
// domain, Density | undefined, wherever the value came from
export const printDensityPlugin = definePlugin({
  name: 'jx-print-density',
  targets: [DENSITY_DEF],   // object identity — the imported def, or no match
  filter: printMediumGate,  // reversible: screen → print → screen round-trips
  before: (value: Density | undefined) => 'sm',
});
// the medium axis is environment truth: its def is read-only — a
// plugin targeting MEDIUM_DEF is rejected at the type level AND at
// runtime. Components never see the intervention — Defaults knows
// nothing of plugins, plugins know nothing of components; the axis
// value is the only meeting point.`;
</script>

<svelte:head>
  <title>Context &amp; defaults · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai context economy: every component family ships one Defaults object — the single declared ambient contract for its style props. The copy-paste consumer recipes lead — ButtonVariantScope and the paint zone, the data-density stamp, the plugin seam, and the honest table of what context can change today — then the Compose-aligned story (five dialects to one language, MaterialTheme as a CompositionLocal facade, undefined as the free sentinel), the author how-to (one contract file, one resolve line, the frozen idiom checklist), and the verify:context gate."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="design language · context &amp; defaults (context-defaults-economy, 2026-09-03)"
        title="five dialects became one language — Defaults is the organization layer"
        summary="A button standing alone is outline; the same button inside a dialog footer is ghost, and neither site passes a prop. That is the ambient style contract, and until now it was written in five dialects — density had a key and a plugin seam, paint had a zone scope, entity depth accumulated, medium projected, hue adapted. This change does not add a new foundation: Svelte context, the ?? operator, undefined-as-sentinel and the setup window were all already there, exactly as CompositionLocal, takeOrElse, Color.Unspecified and @Composable are in Jetpack Compose. What was missing is what Compose has and we lacked — an organization layer. Every family now ships one XxxDefaults object: the single declared place that answers which props the environment may manage, audited by a gate, versioned by classification."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">5 dialects → 1 language</span>
          <span class="pill">density + paint axes</span>
          <span class="pill">every style prop has a slot</span>
          <span class="pill">explicit ?? ambient ?? own</span>
          <span class="pill">verify:context gate</span>
        </div>
      </SectionCard>
    </div>

    <div id="recipes" data-reveal="">
      <SectionCard
        family="recipes"
        headerRegion="recipes"
        eyebrow="recipes · for consumers"
        title="Change a subtree's defaults — the three doors"
        summary="The question the whole economy answers, asked the way a page asks it: how do I make every button in this region ghost — or every control compact — without drilling a prop into every call site? You never touch a Defaults object from outside; the ambient economy reaches your page through exactly three doors. A zone scope changes the paint default for a subtree; a density stamp changes the scale of a subtree; a plugin intervenes on axis values under a medium. Everything else on this page — the contract files, the slot factories, the gate — exists so these three doors stay honest."
      >
        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-1 gap-5 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-3">
              <span class="text-muted-foreground text-[11px]">
                door 1, live — the scope changes the DEFAULT, the explicit prop overrides it
              </span>
              <div class="flex flex-wrap items-center gap-3">
                <PressButton>lone — outline</PressButton>
                <ButtonVariantScope variant="ghost">
                  <PressButton>adopts ghost</PressButton>
                  <PressButton>adopts ghost</PressButton>
                  <PressButton variant="fill">keeps fill</PressButton>
                </ButtonVariantScope>
                <ButtonGroup variant="ghost" label="zone + join">
                  <PressButton>joined ghost</PressButton>
                  <PressButton variant="fill">keeps fill</PressButton>
                </ButtonGroup>
              </div>
              <p class="text-muted-foreground text-[13px] leading-6">
                Three answers from one component, zero prop-drilling: the lone button never saw a
                zone (its own default — outline); inside the scope, unprefixed buttons adopt ghost
                while the explicit fill wins; the group adds the join on top of the same zone.
              </p>
              <CodeBlock code={scopeCode} lang="svelte" meta="door 1 — ButtonVariantScope, the zone without layout" />
              <CodeBlock code={groupCode} lang="svelte" meta="door 1b — ButtonGroup, zone + join in one" />
            </div>
            <div class="flex flex-col gap-3">
              <CodeBlock code={densityCode} lang="svelte" meta="door 2 — density, the css scope channel" />
              <div class="table-scroll">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>you want to change…</th>
                      <th>the answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>a button's default variant</td>
                      <td class="dim"><code>ButtonVariantScope</code> — or <code>ButtonGroup</code> when the join is also wanted (the paint zone; link is excluded, so the interaction exception keeps its only route through the explicit prop)</td>
                    </tr>
                    <tr>
                      <td>a region's density</td>
                      <td class="dim"><code>data-density</code> on ANY ancestor — the css scope channel; a composition component's <code>density</code> prop provides for its subtree (ambient scope)</td>
                    </tr>
                    <tr>
                      <td>a literal default (badge tone, kbd rung, dialog surface)</td>
                      <td class="dim">not ambient yet (class b) — the explicit prop per instance; the own value is declared and audited in the family's defaults file, and the upgrade path is an opened axis</td>
                    </tr>
                    <tr>
                      <td>instance semantics (open, callbacks, aria)</td>
                      <td class="dim">never ambient (class d) — per instance by design; Compose does not ambient-ize onClick either</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <CodeBlock code={pluginCode} lang="ts" meta="door 3 — the plugin seam" />
              <Alert title="definePlugin is not how components read context">
                A component author never imports the kernel — a family reads ambient values only
                through its own Defaults resolve line. definePlugin exists for the other side of the
                wall: an app-level intervention on axis values, which components and Defaults are
                oblivious to (the plugins → axes → Defaults firewalls, in the why section below).
              </Alert>
              <p class="m-0 text-muted-foreground text-[13px] leading-6">
                Each component page's props table states the truth per prop — the own value in the
                Default column with the ambient tail (<code class="text-accent">ambient zone</code>,
                <code class="text-accent">ambient scope</code>, or
                <code class="text-accent">Own default, not ambient</code>). If a fourth door seems
                needed, that is a design conversation, not a prop.
              </p>
            </div>
          </div>
          <Alert title="The origin story — a dialog footer's buttons">
            This whole economy has one ancestor question (r14, the Owner):
            <code class="text-accent">can't Context control the default variant of the buttons
            inside DialogHeader / DialogFooter?</code>
            The answer became ButtonVariantScope — a zero-DOM context boundary. Dialog wraps its
            head and foot zones in a ghost scope, so every PressButton and IconButton inside —
            joined or free-floating — defaults to ghost, while the same button on the page floor
            stays outline. Defaults is that maneuver, promoted from one component's trick to every
            family's declared contract.
          </Alert>
        </div>
      </SectionCard>
    </div>

    <div id="why" data-reveal="">
      <SectionCard
        family="why"
        headerRegion="why"
        eyebrow="why"
        title="Five dialects → one language"
        summary="The context economy was already running — but each axis spoke its own dialect, and the reads were scattered through per-component ?? chains. The ambient contract was invisible (no one place answers which props the environment may manage), unauditable (no gate could enforce it) and unversionable (opening one property meant shotgun changes). The fix is Compose's shape, translated one-to-one onto machinery Svelte 5 already had."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={dialectCode} lang="ts" meta="the before — five channels, five idioms" />
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Jetpack Compose (verified in source)</th>
                  <th>jixoai counterpart</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="dim">MaterialTheme is a facade over three CompositionLocals</td>
                  <td>the axes stay FEW and structural — density, paint, entity depth, medium, hue</td>
                </tr>
                <tr>
                  <td class="dim">each component's <code>&lt;Component&gt;Defaults</code> factory object</td>
                  <td><code>XxxDefaults</code> per family — the organization layer of ambient reads, a vocabulary adapter from axis words to component words</td>
                </tr>
                <tr>
                  <td class="dim"><code>Color.Unspecified</code> sentinel + <code>takeOrElse</code></td>
                  <td>TypeScript's <code>undefined</code> is a free sentinel; <code>??</code> is takeOrElse — null is rejected at compile time, undefined is the ONLY sentinel</td>
                </tr>
                <tr>
                  <td class="dim"><code>@Composable</code> marks context consumers at the type level</td>
                  <td>the setup / <code>$derived</code> window is the evaluation timing; the one resolve line per family is the audited evidence</td>
                </tr>
                <tr>
                  <td class="dim"><code>@ReadOnlyComposable</code> fine-grained invalidation</td>
                  <td>getter-endorsed context payloads + <code>$derived</code> chains — axis flips re-project automatically, without Compose's snapshot churn</td>
                </tr>
              </tbody>
            </table>
          </div>
          <CodeBlock code={layerCode} lang="text" meta="the layer stack — plugins → axes → Defaults → props" />
          <p class="text-muted-foreground text-[13px] leading-6">
            The layering has two deliberate firewalls. Plugins (print and other cross-cutting
            concerns) never know components — they intervene on axis values only; and Defaults
            never knows plugins — it just resolves. The second firewall runs the other way too:
            <code class="text-accent">lib</code> never imports <code class="text-accent">ui</code>
            (a reverse-dependency gate asserts it), so the tool layer and the axis modules install
            whole into any consumer.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="law · honest edges"
        title="The axes & the coverage classes"
        summary="Coverage means every public style prop has a slot — not that every prop is ambient today. A prop's slot is either an axis slot (ambient, the environment may manage it) or a literal family slot (own value declared and auditable, no axis yet). Ambient capability grows as axes open; the classification is gated. Exactly two axes are collected into slots; three keep their own mechanisms; two are honestly on the roadmap."
      >
        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-1 gap-5 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-3 text-[13px] leading-6">
              <h3 class="text-[15px] font-bold">Collected into slots</h3>
              <p class="text-muted-foreground">
                <code class="text-accent">density</code> — the four-tier channel (lg / default /
                sm / xs) with its plugin seam; <code class="text-accent">paint</code> — the
                variant ladder's zone channel, on its own key
                (<code class="text-accent">PAINT_ZONE_KEY</code>, values only — layout stays with
                ButtonGroup's family key — one paint key, no compatibility
                shims). Both become slot factories any family can declare.
              </p>
              <h3 class="text-[15px] font-bold">Keeping their own mechanisms</h3>
              <p class="text-muted-foreground">
                <code class="text-accent">entity depth</code> (accumulates via provideEntity —
                border-is-objecthood), <code class="text-accent">medium</code> (a read-only
                projection — environment truth, never an opinion), <code class="text-accent">hue</code>
                (the runtime adapter). These are structural and environmental axes with no
                per-prop consumption shape — forcing them into slots would be ceremony, not
                coverage. They keep their channels; Defaults never wraps them.
              </p>
              <h3 class="text-[15px] font-bold">On the roadmap (honestly)</h3>
              <p class="text-muted-foreground">
                <code class="text-accent">elevation</code> and <code class="text-accent">shape / radius</code>:
                vocabulary not yet mature or zero real consumers — and a zero-consumer axis is
                speculative generality. The open-axis protocol template (closed union + token map,
                zone scope shape + slot factory signature, first-consumer contract) is written;
                the first real consumer activates it.
              </p>
            </div>
            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Meaning</th>
                    <th>Examples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>a · axis open</code></td>
                    <td class="dim">axis slot — the environment may manage it</td>
                    <td>density, paint</td>
                  </tr>
                  <tr>
                    <td><code>b · literal, pending axis</code></td>
                    <td class="dim">own value declared, no axis yet — auditable in the contract</td>
                    <td>Dialog surface variant, size classes, kbd's ladder</td>
                  </tr>
                  <tr>
                    <td><code>c · axis roadmap</code></td>
                    <td class="dim">registered roadmap entry naming the prop and the target axis</td>
                    <td>elevation, shape / radius</td>
                  </tr>
                  <tr>
                    <td><code>d · never ambient</code></td>
                    <td class="dim">instance semantics — a slot would be a category error</td>
                    <td>open / bind, callbacks, aria / data attrs, class, id, page-owned toggles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p class="text-muted-foreground text-[13px] leading-6">
            The gate asserts the FULL classification: every style prop is a, b or d and carries a
            slot (or an explicit exemption), every class-c prop has a roadmap entry. Compose makes
            the same split — it does not ambient-ize onClick either; instance semantics are not
            style, and no amount of context economy changes that.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="author" data-reveal="">
      <SectionCard
        family="author"
        headerRegion="author"
        eyebrow="how-to · for component authors"
        title="One contract file, one resolve line"
        summary="Authoring against the seam is two moves. Ship a family defaults file — the family's single declared ambient contract, one object whose slots cover every vocabulary-hit style prop, zero kernel imports, installing with the family. Then read it in exactly one place inside the component — the $derived window. Everything else is the frozen idiom checklist below, learned in the pilot batch and the four migration waves."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={contractCode} lang="ts" meta="the contract file — kbd, the values-first sample" />
          <CodeBlock code={resolveCode} lang="svelte" meta="the read point — one line inside the component" />
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Slot factory</th>
                  <th>Class</th>
                  <th>Resolves</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>definePaintSlot(values, own)</code></td>
                  <td class="dim">a — axis</td>
                  <td class="dim">explicit ?? paint zone ?? own; the values array is the family union's SOURCE — default ∈ values compile-locked — and the gate's availability carrier (AST-asserted bidirectionally against the frozen table; no runtime guard)</td>
                </tr>
                <tr>
                  <td><code>densitySlot(own?)</code></td>
                  <td class="dim">a — axis</td>
                  <td class="dim">explicit ?? ambient density ?? own; no own means no opinion — nothing stamps</td>
                </tr>
                <tr>
                  <td><code>defineLiteralSlot(values, default)</code></td>
                  <td class="dim">b — literal</td>
                  <td class="dim">explicit ?? own; reads no context, but the own is declared and audited — default ∈ values compile-locked</td>
                </tr>
                <tr>
                  <td><code>defineOpenSlot&lt;T&gt;(own)</code></td>
                  <td class="dim">b — literal</td>
                  <td class="dim">explicit ?? own over an OPEN scalar domain — free lengths / numbers, no closed union to enumerate; no values to infer from, so the explicit type argument is the only enforcement face</td>
                </tr>
                <tr>
                  <td><code>absentSlot&lt;T&gt;()</code></td>
                  <td class="dim">b — literal</td>
                  <td class="dim">absent HAS meaning — the resolved output honestly carries the absent state</td>
                </tr>
              </tbody>
            </table>
          </div>
          <CodeBlock code={literalCode} lang="ts" meta="classification b — the scalar faces: closed booleans + the open domain" />
          <CodeBlock code={providerLaneCode} lang="ts" meta="the provider lane — inherit-then-provide, frozen form" />
          <div class="flex flex-col gap-3 text-[13px] leading-6">
            <h3 class="text-[15px] font-bold">The frozen author checklist (pilot batch + four waves)</h3>
            <ul class="flex flex-col gap-2">
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>the values literal is the union's single source of truth —
                <code class="text-accent">default ∈ values</code> is compile-locked and the
                union is the named slot constant's
                <code class="text-accent">ReturnType</code> look-up; the gate AST-reads the
                inline first-argument array and asserts the paint rows equal the frozen
                availability table in BOTH directions — a missing or extra value fails
                (meta-feeding families keep their component-Props inline union instead: the
                surviving half of the drift double-lock — resolve-site assignability — is the
                documented exception)</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>the no-values slot factories — <code class="text-accent">absentSlot</code>
                and <code class="text-accent">defineOpenSlot</code> — take the explicit type
                argument (nothing to infer it from — omitting it is a compile error by
                construction, never a defaulted fallback); the values-first factories infer
                everything from the tuple: omitting either parameter, or a default outside the
                domain, cannot compile</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>the family barrel exports <code class="text-accent">XxxDefaults</code> and
                the slot types — the contract is part of the public face; use
                <code class="text-accent">import type</code> + <code class="text-accent">export type</code>
                (two statements) when re-exporting a union from the module script</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>inherit-then-provide families use the eager-capture provider lane and stack
                resolve on it (the snippet above) — read-before-write ordering is load-bearing;
                a lazy read inside the derived loops on the component's own write</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>multi-vocabulary families split honestly: the panel surface keeps
                <code class="text-accent">variant</code>, the action ladder takes an
                <code class="text-accent">actionVariant</code> slot — the split is recorded in the
                defaults file header</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>a family whose domain already lives in lib imports the values constant
                rather than re-declaring it — toast's
                <code class="text-accent">TOAST_VARIANT_VALUES</code> /
                <code class="text-accent">TOAST_MATERIAL_VALUES</code> tuples in the store are
                the only declaration source, the unions are
                <code class="text-accent">typeof</code> look-ups, and the slots feed the
                imported tuple to <code class="text-accent">defineLiteralSlot</code> — one
                source of truth beats two</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>zero vocabulary hits and no legacy reader → ship NO defaults file (an empty
                contract is speculation); a real density intent may ship a pure declaration slot</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>the docs props table states the truth per prop: the own value in the Default
                column, with the ambient wording tail — <code class="text-accent">ambient zone</code>,
                <code class="text-accent">ambient scope</code>, or
                <code class="text-accent">Own default, not ambient</code></span></li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="guards" data-reveal="">
      <SectionCard
        family="guards"
        headerRegion="guards"
        eyebrow="verification"
        title="Guards — what verify:context locks"
        summary="A contract this central only survives if drift fails loudly. The gate (scripts/verify-context-coverage.mjs) walks the registry with the Svelte compiler's AST — not regexes — and every exemption is explicit, versioned and reasoned."
      >
        <div class="grid grid-cols-1 gap-6 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3 text-[13px] leading-6">
            <h3 class="text-[15px] font-bold">The assertions</h3>
            <ul class="flex flex-col gap-2">
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>existence — every vocabulary-hit prop has a defaults file and a covering slot</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>slot legality — a slot must be a REGISTERED factory product: a module-private
                type brand plus a factory-product registry (a bare function, a literal or a
                forged object is rejected at compile time, and at runtime in dev — the type
                brand is the production contract)</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>family contract — the component calls its family's resolve, and the retired
                channels (the old helpers, raw axis-key reads) stay retired</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>availability consistency — family variant unions stay inside the paint axis
                and match the frozen table (link stays PressButton-only)</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>lib→ui reverse dependency — the tool and axis modules never import a
                component</span></li>
              <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                <span>exemptions explicit — bindable / passthrough / no-style / provider / roadmap
                entries must all hit and carry a reason</span></li>
            </ul>
          </div>
          <div class="flex flex-col gap-3 text-[13px] leading-6">
            <h3 class="text-[15px] font-bold">Where this surfaces to readers</h3>
            <p class="text-muted-foreground">
              Each component page's props table states the ambient truth per prop (the own value
              plus the ambient wording tail); this page is the map of the system, the component
              pages are the per-family ground truth. The search corpus and the llms.txt mirrors
              regenerate at build — this page joins them automatically.
            </p>
            <p class="text-muted-foreground">
              Honest edges, on record: elevation and shape are roadmap classes, not shipped axes
              (class c — the open-axis protocol activates with the first real consumer); instance
              semantics are class d forever; and the paint axis is a single-key lane
              (PAINT_ZONE_KEY) — ButtonGroup's family key carries layout only,
              never paint.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</div>
