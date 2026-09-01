<script lang="ts">
  import Alert from '$lib/ui/alert/alert.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import Chip from '$lib/ui/chip/chip.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';

  // ToC lives in +page.ts (firstpaint era: the layout's chrome snippet
  // owns the rail from page data) — keep the section ids in sync there.

  // Same-source law: the CSS quotes on this page are EXTRACTED from the
  // very sheet this site runs (?raw), never hand-copied. The guard
  // suite (test/hue-injection.spec.ts) locks the bytes; this page locks
  // the presentation. Empty output would mean the sheet drifted.
  import sheet from '$lib/jixoai.css?raw';

  const tokenBlock = /:root \{\n  --jx-fill: var\(--primary\);\n[\s\S]*?\n\}/.exec(sheet)?.[0] ?? '';
  const utilityBlock =
    /@utility jx-hue-primary \{[\s\S]*?@utility jx-pair-destructive \{[\s\S]*?\n\}/.exec(
      sheet,
    )?.[0] ?? '';

  const close = '</' + 'script>';

  // the normative paint recipes (variant-grammar design.md §1)
  const recipes = `/* fill — loudest */
background: var(--jx-fill);
border: 1px solid var(--jx-fill);
color: var(--jx-fill-ink);

/* tonal — the default voice */
background: color-mix(in oklab, var(--jx-tonal) 12%, transparent);
border: 1px solid color-mix(in oklab, var(--jx-tonal) 45%, transparent);
color: var(--jx-tonal);

/* outline — structure only */
background: transparent;
border: 1px solid var(--jx-outline);
color: var(--foreground);

/* ghost — transparent rest, tonal hover, geometry preserved */
rest:  transparent ground, transparent border, foreground ink;
hover: color-mix(in oklab, var(--jx-tonal) 8%, transparent), tonal ink;`;

  // .pill — the site's item-name chip (docs-tables.css), where the
  // 12%/45% tint recipe lived before it became the tonal rung
  const pillLineage = `/* apps/www/src/lib/site/docs-tables.css — .pill */
:where(.pill) {
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  border: 1px solid color-mix(in oklab, var(--primary) 45%, transparent);
  color: var(--primary);
}
/* the tonal rung is this recipe with var(--primary) generalized to
   var(--jx-tonal) — one hue source instead of a hardcoded brand */`;

  const intentUsage = `<script lang="ts">
  import Badge from '@ui/badge.svelte';
  import PressButton from '@ui/press-button.svelte';
  import { cn } from '@lib/utils';
${close}

<!-- STATUS hue: one class, the tonal slot -->
<Badge class="jx-hue-error">failed</Badge>

<!-- destructive ACTION: the pair — both fill slots, one class -->
<PressButton variant="fill" class="jx-pair-destructive">delete workspace</PressButton>

<!-- last-wins is consumer-guaranteed only through cn() dedupe -->
<Badge class={cn('jx-hue-error', 'jx-hue-success')}>passing</Badge>`;

  const dedupeCode = `import { cn } from '@lib/utils';

cn('jx-hue-error', 'jx-hue-success')             // 'jx-hue-success' — last wins
cn('jx-hue-error', 'jx-hue-error')               // 'jx-hue-error'   — idempotent
cn('jx-hue-error', 'text-xs', 'jx-hue-neutral')  // 'text-xs jx-hue-neutral'`;

  // the one-form-per-slot law: cross-form mixing is not dedupable
  const oneFormLaw = `<!-- BOTH set --jx-tonal through different mechanisms — cn() cannot
     see the collision, and the sheet's own sort order decides. ONE
     form per slot in a class list: -->
<Badge class="jx-hue-error [--jx-tonal:var(--success)]">undefined behavior</Badge>

<!-- pick a form — either is lawful alone: -->
<Badge class="jx-hue-error">error, canonical form</Badge>
<Badge class="[--jx-tonal:var(--success)]">success, escape-hatch form</Badge>`;

  // the glued-pair trap, displayed WITHOUT the literal adjacency (the
  // guard suite fails on any ']'+'[--jx-' sequence in a .svelte file —
  // including this explanatory one, so the demo string is concatenated)
  const gluedBad = '[--jx-fill:var(--destructive)]' + '[--jx-fill-ink:var(--destructive-foreground)]';
  const spacedOk = '[--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-foreground)]';
  const gluedDemo = `glued — ONE class token; the second property never emits:
  class="${gluedBad}"

split — two utilities; both properties land:
  class="${spacedOk}"`;

  // the live dedupe demo's third badge (computed so the sample and the
  // stage can never disagree)
  const dedupedClass = cn('jx-hue-error', 'jx-hue-success');
</script>

<svelte:head>
  <title>Variant grammar · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai variant grammar: one prominence ladder (fill / tonal / outline / ghost) and four global hue slots for semantic color — plus the Tailwind v4 @utility intent layer (jx-hue-*, jx-pair-destructive) that makes hue injection typo-safe with zero JS. Action vs status, the pair law, forced-colors degradation, and the migration tables."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="design language · variant-grammar (frozen r1)"
        title="one ladder, four slots — and a TW4 plugin with zero JS"
        summary="Every painted surface in this registry answers two orthogonal questions. HOW LOUD is it? — the prominence ladder: fill, tonal, outline, ghost. WHAT DOES IT MEAN? — a hue injected into four global, inheritable slots (--jx-fill, --jx-fill-ink, --jx-tonal, --jx-outline). The old semantic-name variants (primary, secondary, destructive as prop values) are retired: they multiplied a color union into every component and fused prominence with meaning. The grammar keeps one small ladder per surface and moves intent to the call site — and since 2026-08-27 the curated intents ship as Tailwind v4 @utility rules authored inside the theme sheet itself: installing the theme IS installing the plugin. This page is the standard and the plugin's manual."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">4 rungs + 1 exception</span>
          <span class="pill">4 hue slots</span>
          <span class="pill">@utility intent layer</span>
          <span class="pill">action ≠ status</span>
          <span class="pill">forced-colors law</span>
        </div>
      </SectionCard>
    </div>

    <div id="ladder" data-reveal="">
      <SectionCard
        family="ladder"
        headerRegion="ladder"
        eyebrow="demo"
        title="The ladder — fill, tonal, outline, ghost"
        summary="Prominence is a four-rung ladder, and it is the ONLY thing the variant prop encodes. fill speaks loudest (solid ground, same-hue border, inverted ink); tonal is the default voice (a 12% tint of the hue); outline draws structure only (transparent ground, border-colored border); ghost is interactive chrome (transparent at rest, tonal on hover, geometry preserved through a transparent border). link is deliberately NOT on the ladder — it is PressButton's one interaction exception: no frame, no press shadow, primary text, hover underline. Availability is per-component: banners never get fill (readability), badges never get ghost (they are display, not chrome)."
      >
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">PressButton — the full union (default: outline)</span>
            <div class="flex flex-wrap items-center gap-3">
              <PressButton variant="fill">deploy</PressButton>
              <PressButton variant="tonal">preview</PressButton>
              <PressButton variant="outline">cancel</PressButton>
              <PressButton variant="ghost">skip</PressButton>
              <PressButton variant="link">read the docs</PressButton>
            </div>
          </div>
          <div class="grid gap-6 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-3">
              <span class="text-muted-foreground text-[11px]">Badge — fill / tonal (default) / outline</span>
              <div class="flex flex-wrap items-center gap-3">
                <Badge variant="fill">new</Badge>
                <Badge>running</Badge>
                <Badge variant="outline">beta</Badge>
              </div>
              <span class="text-muted-foreground text-[11px]">
                Chip — all four rungs, control-scale on the hit lane
              </span>
              <div class="flex flex-wrap items-center gap-3">
                <Chip variant="fill">filter: owner</Chip>
                <Chip>filter: open</Chip>
                <Chip variant="outline">filter: label</Chip>
                <Chip variant="ghost">clear filters</Chip>
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <span class="text-muted-foreground text-[11px]">
                Alert — outline (default) / tonal; InlineCode — tonal (default) / outline
              </span>
              <Alert variant="tonal" title="Build queued">
                The canary build enters the queue behind two commits.
              </Alert>
              <Alert title="Heads up">
                Outline keeps the muted body — the neutral rung's own ink ramp for long copy.
              </Alert>
              <p class="text-[13px] leading-6">
                Inline code rides the same ladder:
                <InlineCode>npm run verify</InlineCode> is the tonal default (locally neutral),
                and
                <InlineCode variant="outline">npm run verify</InlineCode>
                is its outline twin.
              </p>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rung</th>
                  <th>Reads as</th>
                  <th>Availability (default)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>fill</code></td>
                  <td>solid ground + same-hue border + inverted ink</td>
                  <td>Badge, Chip, PressButton</td>
                </tr>
                <tr>
                  <td><code>tonal</code></td>
                  <td>12% ground, 45% border, the hue as ink</td>
                  <td>Badge (default), InlineCode (default, locally neutral), Chip (default), PressButton, Alert</td>
                </tr>
                <tr>
                  <td><code>outline</code></td>
                  <td>transparent ground, structural border, foreground ink</td>
                  <td>all — PressButton (default), Alert (default)</td>
                </tr>
                <tr>
                  <td><code>ghost</code></td>
                  <td>transparent rest; tonal hover; geometry preserved</td>
                  <td>Chip, PressButton only</td>
                </tr>
                <tr>
                  <td><code>link</code></td>
                  <td>the interaction exception — no frame, no press shadow</td>
                  <td>PressButton only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <CodeBlock code={recipes} lang="css" meta="the paint recipes (normative)" />
        </div>
      </SectionCard>
    </div>

    <div id="tokens" data-reveal="">
      <SectionCard
        family="tokens"
        headerRegion="tokens"
        eyebrow="law"
        title="The four tokens — global, inheritable, theme-owned"
        summary="Variant paint never names a color; it consumes four custom properties defined once on :root (and the byte-identical registry mirror). They are inheritable by nature: mount an injection on a subtree and every ladder consumer inside retunes. They are density-free: color only, no geometry. And the set is closed on purpose — there is no --jx-ghost (ghost derives its hover tint from --jx-tonal) and no --jx-tonal-ink (tonal text IS the hue)."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={tokenBlock} lang="css" meta="jixoai.css — live extract" />
          <TokenTable
            tokens={[
              { name: '--jx-fill', default: 'var(--primary)', source: 'color', description: 'Fill ground + same-hue border.' },
              {
                name: '--jx-fill-ink',
                default: 'var(--primary-foreground)',
                source: 'color',
                description: 'Ink on fill — ALWAYS injected together with --jx-fill (the pair law).',
              },
              {
                name: '--jx-tonal',
                default: 'var(--primary)',
                source: 'color',
                description: 'Tonal ground/border/text hue source — the status injection seam.',
              },
              {
                name: '--jx-outline',
                default: 'var(--border)',
                source: 'color',
                description: 'Outline border source; outline ink stays var(--foreground).',
              },
            ]}
          />
          <div class="grid gap-5 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-3 text-[13px] leading-6">
              <h3 class="text-[15px] font-bold">The color-mix math</h3>
              <p class="text-muted-foreground">
                tonal grounds at 12% of the hue over transparent, borders at 45%, and sets text to
                the hue at 100% — one hue, three weights, no derived ink token needed. outline's
                interactive hover adds an 8% overlay of <code class="text-accent">--jx-tonal</code>
                with the border unchanged; ghost rests transparent and hovers to the same 8% ground
                plus tonal ink. The mixes ride
                <code class="text-accent">color-mix(in oklab, …)</code> so tints stay perceptual,
                and the utilities emit <code class="text-accent">@supports</code> fallbacks to the
                plain var() for engines without color-mix.
              </p>
              <h3 class="text-[15px] font-bold">The .pill lineage</h3>
              <p class="text-muted-foreground">
                The recipe has a fossil in this very site: the item-name pill in the docs tables
                hardcodes the 12%/45%/primary triple. The tonal rung is that pill with its hue
                source generalized from <code class="text-accent">var(--primary)</code> to
                <code class="text-accent">var(--jx-tonal)</code>.
              </p>
            </div>
            <CodeBlock code={pillLineage} lang="css" meta="the ancestor" />
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="injection" data-reveal="">
      <SectionCard
        family="injection"
        headerRegion="injection"
        eyebrow="law"
        title="Semantic hue injection — meaning rides the slots"
        summary="A failed build is not a variant of loudness, so failure is not a variant name. Intent is expressed by injecting a semantic value into the slots, and ONE law governs the vocabulary: action vs status is MANDATORY. destructive is an ACTION hue — it may only ride the fill pair, on things that delete. error is a STATUS hue — it rides the tonal slot, on things that report. The split is not stylistic: destructive stays the theme's monochrome inversion pair (black-on-light, white-on-dark) while error is the red semantic — conflating them painted delete buttons red and failure banners inverted, both wrong."
      >
        <div class="flex flex-col gap-5">
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Intent</th>
                  <th>Fill pair</th>
                  <th>Tonal slot</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Brand</td>
                  <td class="dim">primary / primary-foreground</td>
                  <td class="dim">--primary</td>
                  <td>default emphasis</td>
                </tr>
                <tr>
                  <td>Neutral / meta</td>
                  <td class="dim">muted / muted-foreground</td>
                  <td class="dim">--muted-foreground</td>
                  <td>the old secondary; metadata</td>
                </tr>
                <tr>
                  <td>Destructive ACTION</td>
                  <td class="dim">--destructive + --destructive-foreground</td>
                  <td class="dim">--destructive</td>
                  <td>delete/cancel actions only (PressButton)</td>
                </tr>
                <tr>
                  <td>Error STATUS</td>
                  <td class="dim">error / error-foreground</td>
                  <td class="dim">--error</td>
                  <td>failed/invalid STATUSES (Badge, Alert)</td>
                </tr>
                <tr>
                  <td>Success status</td>
                  <td class="dim">success / success-foreground</td>
                  <td class="dim">--success</td>
                  <td>copied / passing</td>
                </tr>
                <tr>
                  <td>Warning / info</td>
                  <td class="dim">matching pairs</td>
                  <td class="dim">--warning / --info</td>
                  <td>only when the intent needs it</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="grid gap-6 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-3">
              <span class="text-muted-foreground text-[11px]">STATUS hues — the tonal slot, reported states</span>
              <div class="flex flex-wrap items-center gap-3">
                <Badge class="jx-hue-neutral">draft</Badge>
                <Badge class="jx-hue-error">failed</Badge>
                <Badge shape="pill" class="jx-hue-success">
                  {#snippet slotStart()}{@html icons.check}{/snippet}
                  passing
                </Badge>
                <Badge class="jx-hue-warning">degraded</Badge>
                <Badge class="jx-hue-info">canary</Badge>
              </div>
              <span class="text-muted-foreground text-[11px]">ACTION hue — the fill pair, verbs that destroy</span>
              <div class="flex flex-wrap items-center gap-3">
                <PressButton variant="fill" class="jx-pair-destructive">delete workspace</PressButton>
                <PressButton variant="outline">cancel</PressButton>
              </div>
              <p class="text-muted-foreground text-[13px] leading-6">
                The pair law: <code class="text-accent">--jx-fill</code> and
                <code class="text-accent">--jx-fill-ink</code> are ALWAYS injected together — one
                without the other paints brand ink on a destructive ground.
              </p>
            </div>
            <div class="flex flex-col gap-3">
              <span class="text-muted-foreground text-[11px]">
                the same failure, both grammars — STATUS error (left) vs ACTION destructive (right)
              </span>
              <div class="grid gap-3">
                <Alert variant="tonal" assertive title="Canary failed">
                  The canary build errored on seat 3 — an error STATUS reads tonal + the error hue.
                </Alert>
                <div class="flex flex-wrap items-center gap-3">
                  <span class="text-muted-foreground text-[11px]">confirm the destructive action:</span>
                  <PressButton variant="fill" class="jx-pair-destructive">discard changes</PressButton>
                </div>
              </div>
              <span class="text-muted-foreground text-[11px]">
                inheritance — one injection on the wrapper retunes every consumer below
              </span>
              <div class="jx-hue-info flex flex-wrap items-center gap-3">
                <Badge>info badge</Badge>
                <Chip>info chip</Chip>
                <PressButton variant="tonal">tonal button</PressButton>
                <PressButton variant="outline">outline — hover me</PressButton>
              </div>
              <p class="text-muted-foreground text-[13px] leading-6">
                The wrapper carries <code class="text-accent">class="jx-hue-info"</code> — the
                slots are ordinary custom properties, so the subtree inherits them; even the
                outline rung's 8% hover overlay follows the retuned hue.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="plugin" data-reveal="">
      <SectionCard
        family="plugin"
        headerRegion="plugin"
        eyebrow="plugin · @utility"
        title="The intent layer — a Tailwind v4 plugin with zero JS"
        summary="The arbitrary-property seam (class with bracketed custom properties) works everywhere, but it is verbose, typo-fragile — a misspelled token still emits a well-formed rule that silently dead-styles — and its pair invariant was enforced only by prose. The fix is not a JavaScript plugin: the intent names are authored as TW4-native @utility rules INSIDE the theme sheet. Installing the theme IS installing the plugin; registry consumers need zero JS setup. The set is closed, so a typo matches nothing and emits nothing — a compile-time miss instead of silent dead CSS. And the emission is not an approximation: on the resolved Tailwind 4.3.3, @tailwindcss/node's candidatesToCss probes the @utility output as declaration-equivalent to the arbitrary-property form — identical declarations, predictably different selectors."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={utilityBlock} lang="css" meta="jixoai.css — live extract" />
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Utility</th>
                  <th>Emits</th>
                  <th>Semantics</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>jx-hue-primary</code></td>
                  <td class="dim">--jx-tonal: var(--primary)</td>
                  <td>brand emphasis — the default</td>
                </tr>
                <tr>
                  <td><code>jx-hue-neutral</code></td>
                  <td class="dim">--jx-tonal: var(--muted-foreground)</td>
                  <td>metadata; the old secondary</td>
                </tr>
                <tr>
                  <td><code>jx-hue-error</code></td>
                  <td class="dim">--jx-tonal: var(--error)</td>
                  <td>failed / invalid STATUS</td>
                </tr>
                <tr>
                  <td><code>jx-hue-success</code></td>
                  <td class="dim">--jx-tonal: var(--success)</td>
                  <td>passing / copied STATUS</td>
                </tr>
                <tr>
                  <td><code>jx-hue-warning</code></td>
                  <td class="dim">--jx-tonal: var(--warning)</td>
                  <td>caution STATUS</td>
                </tr>
                <tr>
                  <td><code>jx-hue-info</code></td>
                  <td class="dim">--jx-tonal: var(--info)</td>
                  <td>informational STATUS</td>
                </tr>
                <tr>
                  <td><code>jx-pair-destructive</code></td>
                  <td class="dim">--jx-fill + --jx-fill-ink (destructive pair)</td>
                  <td>destructive ACTION — both slots, one class: the pair law made structural</td>
                </tr>
                <tr>
                  <td><code>jx-hue-destructive</code></td>
                  <td class="dim">— does not exist, by construction</td>
                  <td>destructive is an ACTION hue and may only ride the pair</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="grid gap-6 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-4">
              <span class="text-muted-foreground text-[11px]">the closed set, live — every intent is one class</span>
              <div class="flex flex-wrap items-center gap-3">
                <Badge class="jx-hue-primary">primary</Badge>
                <Badge class="jx-hue-neutral">neutral</Badge>
                <Badge class="jx-hue-error">error</Badge>
                <Badge class="jx-hue-success">success</Badge>
                <Badge class="jx-hue-warning">warning</Badge>
                <Badge class="jx-hue-info">info</Badge>
              </div>
              <span class="text-muted-foreground text-[11px]">
                jx-pair-destructive vs the arbitrary pair it replaces
              </span>
              <div class="flex flex-wrap items-center gap-3">
                <PressButton variant="fill" class="jx-pair-destructive">the pair utility</PressButton>
                <PressButton
                  variant="fill"
                  class="[--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-foreground)]"
                >
                  the arbitrary pair
                </PressButton>
              </div>
              <p class="text-muted-foreground text-[13px] leading-6">
                Identical paint — but the utility cannot half-apply, cannot typo a token name, and
                documents its intent in the class list.
              </p>
              <span class="text-muted-foreground text-[11px]">the escape hatch — anything outside the closed set</span>
              <div class="flex flex-wrap items-center gap-3">
                <Badge class="[--jx-tonal:oklch(0.72_0.14_300)]">untitled violet</Badge>
                <span class="text-muted-foreground text-[11px]">
                  a hue no semantic token owns — the arbitrary form stays canonical for it
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-4">
              <span class="text-muted-foreground text-[11px]">
                cn() dedupe — last-wins, exactly like the arbitrary form
              </span>
              <div class="flex flex-wrap items-center gap-3">
                <Badge class="jx-hue-error">base — error</Badge>
                <Badge class="jx-hue-error jx-hue-success">naive concat</Badge>
                <Badge class={dedupedClass}>cn() deduped</Badge>
              </div>
              <p class="text-muted-foreground text-[13px] leading-6">
                The middle badge carries BOTH classes — the winner is the sheet's internal sort
                order, not the order you typed and not your intent. cn() registers the closed set
                as tailwind-merge dedupe groups, so the third badge resolves to
                <code class="text-accent">{dedupedClass}</code> — one class, one hue, guaranteed.
              </p>
              <CodeBlock code={dedupeCode} lang="ts" meta="cn() — class hygiene" />
              <CodeBlock code={intentUsage} lang="svelte" meta="usage" />
            </div>
          </div>
          <div class="border-border border-t pt-4">
            <h3 class="text-[15px] font-bold">One form per slot — the mixing law</h3>
            <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
              Intent utilities are canonical for the curated set; the arbitrary-property class is
              the escape hatch. They are not composable: cross-form mixing is not dedupable — cn()
              cannot see that a utility and an arbitrary property fight over the same slot, so the
              sheet's sort order decides again. The law: ONE form per slot in a class list.
            </p>
            <div class="mt-3 max-w-xl">
              <CodeBlock code={oneFormLaw} lang="svelte" meta="the mixing law" />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="laws" data-reveal="">
      <SectionCard
        family="laws"
        headerRegion="laws"
        eyebrow="law"
        title="The TW4 laws this grammar rides"
        summary="The grammar is authored as utilities in the markup, which buys theme-scale retuning at the cost of living inside Tailwind's cascade. Three laws keep that trade honest."
      >
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3 text-[13px] leading-6">
            <h3 class="text-[15px] font-bold">Sole border-color source per rung</h3>
            <p class="text-muted-foreground">
              The war story: an early map gave the shared frame a named border-color utility
              (<code class="text-accent">border-something</code>) and let rungs override it with
              the arbitrary form. But in a TW4 sheet, NAMED border-color utilities sort AFTER
              arbitrary ones, and same-family utility order inside one class list is not
              consumer-guaranteed — so the frame's color silently, deterministically, wrongly won.
              The paint looked fine in isolation and drifted the moment anyone composed classes.
              The law that ended it: the frame contributes WIDTH and PHYSICS only
              (<code class="text-accent">jx-press border</code>), and every rung is the sole
              source of each paint channel it sets — no two same-property utilities ever meet in
              one class list. Collision-free by construction, in Badge, Chip, PressButton, Alert
              and InlineCode alike.
            </p>
            <h3 class="text-[15px] font-bold">The glued-pair trap</h3>
            <p class="text-muted-foreground">
              Two arbitrary properties typed without the space glue into ONE class token —
              Tailwind emits only the first property and the pair silently half-applies (fill
              without its ink). The guard suite walks every .svelte file and fails on the
              adjacency of a closing bracket directly followed by an opening
              <code class="text-accent">[--jx-</code> property — this page's own demo string is
              concatenated at runtime to keep the file itself clean.
            </p>
            <div class="max-w-xl">
              <CodeBlock code={gluedDemo} lang="text" meta="glued vs split" />
            </div>
          </div>
          <div class="flex flex-col gap-3 text-[13px] leading-6">
            <h3 class="text-[15px] font-bold">kbd-law geometry; the hit lane belongs to controls</h3>
            <p class="text-muted-foreground">
              A Badge is display: its height comes from
              <code class="text-accent">--jx-line-secondary</code> with inline insets only — it
              never claims a hit lane, and no paint decision ever changes that. A Chip is a
              control wearing badge paint: its root carries
              <code class="text-accent">min-block-size: var(--jx-hit)</code> (control-scale,
              ~44px at default density), measured on the real box — pseudo-element lane expansion
              was rejected in design review. Paint and lane are separate axes; the ladder touches
              only the first.
            </p>
            <h3 class="text-[15px] font-bold">Press physics never change with paint</h3>
            <p class="text-muted-foreground">
              One press law for every rung: hover grows the shadow only — the body never moves;
              active presses +1px into the page while the shadow's offsets counter-shrink, so the
              shadow paint stays anchored. Variant paint swaps color channels and nothing else.
              ghost is not an exception — it keeps the box geometry (the width class is
              load-bearing; a bare transparent color would compute the border away) and opts out
              of the SHADOW through the theme's own pose tokens
              (<code class="text-accent">--jx-press-shadow*</code> set to none), while link opts
              out of the frame entirely.
            </p>
            <h3 class="text-[15px] font-bold">Valued hooks, not class probes</h3>
            <p class="text-muted-foreground">
              Each module publishes its rung on a valued data attribute —
              <code class="text-accent">data-jx-badge</code>,
              <code class="text-accent">data-jx-chip</code>,
              <code class="text-accent">data-jx-press-button</code>,
              <code class="text-accent">data-jx-alert</code> — so tests and assistive tooling
              read the variant without reverse-engineering utility soup.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="forced-colors" data-reveal="">
      <SectionCard
        family="forced-colors"
        headerRegion="forced-colors"
        eyebrow="law"
        title="Forced colors — explicit degradation"
        summary="Under forced-colors the color-mix tints do not drop on their own — the r2 review's Chromium probe measured exactly that — so every rung carries its own degradation utilities instead of trusting the engine. A full forced-colors browser probe for all five modules is a pending gate of the variant-grammar contract (see its verification.md honest-gaps list). The system palette gets the message across; the 1px border survives; nothing informational is lost."
      >
        <div class="flex flex-col gap-5">
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Surface</th>
                  <th>Forced-colors result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>fill control</td>
                  <td class="dim">ButtonFace bg + ButtonText ink/border</td>
                </tr>
                <tr>
                  <td>tonal / outline</td>
                  <td class="dim">Canvas (or transparent) bg + CanvasText ink/border; color-mix tints dropped</td>
                </tr>
                <tr>
                  <td>ghost control</td>
                  <td class="dim">transparent rest; hover ButtonFace / ButtonText</td>
                </tr>
                <tr>
                  <td>Badge / InlineCode</td>
                  <td class="dim">Canvas + CanvasText; 1px border survives on tonal/outline</td>
                </tr>
                <tr>
                  <td>Alert</td>
                  <td class="dim">Canvas + CanvasText, 1px border; role and text intact</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted-foreground text-[13px] leading-6">
            The focus law rides above every rung:
            <code class="text-accent">2px solid Highlight, offset 2 — never removed.</code>
            The site's ring variable does not survive forced colors, so the degradation pins the
            system color directly.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="migration" data-reveal="">
      <SectionCard
        family="migration"
        headerRegion="migration"
        eyebrow="migration"
        title="Old vocabulary → the grammar"
        summary="The frozen mapping tables (variant-grammar design.md §5, plus the intent-utility mapping). The one deliberate visual change: the old yellow secondary button softens to tonal + neutral — Owner-reviewed in the browser before release."
      >
        <div class="flex flex-col gap-5">
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PressButton (old variant)</th>
                  <th>New authoring</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="dim">primary</td>
                  <td><code>variant="fill"</code></td>
                </tr>
                <tr>
                  <td class="dim">secondary</td>
                  <td><code>variant="tonal" class="jx-hue-neutral"</code></td>
                </tr>
                <tr>
                  <td class="dim">destructive</td>
                  <td><code>variant="fill" class="jx-pair-destructive"</code></td>
                </tr>
                <tr>
                  <td class="dim">outline / ghost / link</td>
                  <td>unchanged</td>
                </tr>
                <tr>
                  <td class="dim">copied (union, removed)</td>
                  <td>transient state: <code>variant="tonal" class="jx-hue-success"</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="grid gap-5 min-[760px]:grid-cols-2">
            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Alert (old variant)</th>
                    <th>New authoring</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="dim">default</td>
                    <td><code>variant="outline"</code></td>
                  </tr>
                  <tr>
                    <td class="dim">primary</td>
                    <td><code>variant="tonal"</code></td>
                  </tr>
                  <tr>
                    <td class="dim">destructive</td>
                    <td><code>variant="tonal" class="jx-hue-error"</code> — STATUS, not the action hue</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Badge (old variant)</th>
                    <th>New authoring</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="dim">bare / default</td>
                    <td>bare Badge — tonal, brand tint (the default)</td>
                  </tr>
                  <tr>
                    <td class="dim">primary</td>
                    <td>drop the prop; neutral metadata gets <code>class="jx-hue-neutral"</code></td>
                  </tr>
                  <tr>
                    <td class="dim">outline</td>
                    <td><code>variant="outline"</code></td>
                  </tr>
                  <tr>
                    <td class="dim">destructive</td>
                    <td><code>variant="tonal" class="jx-hue-error"</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Arbitrary form (escape hatch, still valid)</th>
                  <th>Intent utility (canonical for the closed set)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="dim">[--jx-tonal:var(--primary)]</td>
                  <td><code>jx-hue-primary</code></td>
                </tr>
                <tr>
                  <td class="dim">[--jx-tonal:var(--muted-foreground)]</td>
                  <td><code>jx-hue-neutral</code></td>
                </tr>
                <tr>
                  <td class="dim">[--jx-tonal:var(--error)]</td>
                  <td><code>jx-hue-error</code></td>
                </tr>
                <tr>
                  <td class="dim">[--jx-tonal:var(--success)]</td>
                  <td><code>jx-hue-success</code></td>
                </tr>
                <tr>
                  <td class="dim">[--jx-tonal:var(--warning)]</td>
                  <td><code>jx-hue-warning</code></td>
                </tr>
                <tr>
                  <td class="dim">[--jx-tonal:var(--info)]</td>
                  <td><code>jx-hue-info</code></td>
                </tr>
                <tr>
                  <td class="dim">[--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-foreground)]</td>
                  <td><code>jx-pair-destructive</code> — one class, both slots</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted-foreground text-[13px] leading-6">
            AlertDialogAction migrated INTO the grammar: its
            <code class="text-accent">tone: destructive | primary</code> prop is replaced by the
            same variant + injection interface. IconButton forwards the new union rather than
            owning a separate color decision. The tone-law prose on the alert and badge pages was
            rewritten to the grammar's terms.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="guards" data-reveal="">
      <SectionCard
        family="guards"
        headerRegion="guards"
        eyebrow="verification"
        title="Guards & a11y — what the suite locks"
        summary="A grammar this small only survives if drift fails loudly. Spec files and guards lock the source today; the contrast and forced-colors browser probes are the contract's pending gates."
      >
        <div class="grid gap-6 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3 text-[13px] leading-6">
            <h3 class="text-[15px] font-bold">test/hue-injection.spec.ts — the intent layer</h3>
            <p class="text-muted-foreground">
              Four locks: the theme sheet carries every @utility of the closed set VERBATIM (the
              regexes match the exact emission, not a fuzzy contains); every injected var()
              target exists as a real token in the light or dark block; no
              <code class="text-accent">jx-hue-destructive</code> may ever appear — the
              action/status split holds by construction, not convention; and cn() dedupes the
              closed set last-wins, matching the arbitrary form's semantics.
            </p>
            <h3 class="text-[15px] font-bold">test/variant-grammar.spec.ts — the seam</h3>
            <p class="text-muted-foreground">
              No glued arbitrary-property utilities anywhere under src (the one-dead-token trap
              from the laws section), and every docs source drawer names REAL registry paths —
              the same-source law, mechanically enforced.
            </p>
            <h3 class="text-[15px] font-bold">The browser probes</h3>
            <p class="text-muted-foreground">
              The contract's PLAN (pending gates, honestly listed in the variant-grammar
              change's verification.md): a contrast probe walking every shipped semantic
              injection's used fg/bg pairs, light and dark, representative hues — REPORTING
              failures, never recomputing --primary; a forced-colors probe covering all five
              modules against the degradation table. SHIPPED today: the physical hit probe
              asserts the Chip root's rectangle clears
              <code class="text-accent">var(--jx-hit)</code>, verify-press drives the
              five-rung × four-effect paint matrix in real Chromium, the hook-law checks pin
              the valued data-jx-* attributes to the variant unions, and the registry mirror
              regenerates against byte identity.
            </p>
          </div>
          <div class="flex flex-col gap-4">
            <A11yTable
              aria={[
                {
                  name: 'color + text',
                  value: 'never color alone',
                  description:
                    'A status is visible text first — the hue is emphasis. error/success/warning tints never carry the only signal.',
                },
                {
                  name: 'forced colors',
                  value: 'Canvas / CanvasText',
                  description:
                    'Every rung degrades explicitly; the 1px border survives on tonal/outline surfaces so shape information is kept.',
                },
                {
                  name: 'focus',
                  value: '2px Highlight, offset 2',
                  description: 'Pinned per rung under forced-colors; never removed, never restyled by paint.',
                },
                {
                  name: 'data-jx-*',
                  value: 'valued variant hooks',
                  description:
                    'data-jx-badge / -chip / -press-button / -alert expose the rung for tests and AT tooling without class probing.',
                },
                {
                  name: 'role axis',
                  value: 'untouched by paint',
                  description:
                    'Alert keeps its role=alert/status (assertive axis) independent of variant — the grammar never moves semantics.',
                },
              ]}
            />
            <p class="text-muted-foreground text-[13px] leading-6">
              Deferred on record: style-attribute injection waits for rest-attribute forwarding
              on PressButton/Alert; promoting this grammar to a standalone design-tokens spec
              section is a candidate follow-up change.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="elevation" data-reveal="">
      <SectionCard
        family="elevation"
        headerRegion="elevation"
        eyebrow="grammar"
        title="Elevation — the shadow physics"
        summary="Paint says what a surface is; elevation says where it sits. Shadow offset ∝ the distance between an element's plane and the surface it casts upon (Owner ruling, 2026-09-01): the website-scaffold's top layer floats above the shell body, so what crosses that gap projects large, what stays in the layer lifts little, and what is cut into the plane casts nothing outward at all. Ink inverts per theme; geometry never drifts between themes."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-end gap-x-10 gap-y-5 text-[12.5px]">
            <div class="text-muted-foreground flex flex-col gap-2">
              <PressButton variant="fill">raise</PressButton>
              <span>press law · xs → sm on hover</span>
            </div>
            <div class="text-muted-foreground flex flex-col gap-2">
              <Kbd>engrave</Kbd>
              <span>--shadow-engrave · incised inset</span>
            </div>
            <div class="text-muted-foreground flex flex-col gap-2">
              <Chip variant="outline">raise twin</Chip>
              <span>badge scale, press physics</span>
            </div>
            <div class="text-muted-foreground flex flex-col gap-2">
              <Badge>flush</Badge>
              <span>display glyph · no elevation</span>
            </div>
          </div>
          <TokenTable
            tokens={[
              { name: 'float', default: '--shadow · --shadow-md', source: 'topLayer → mainLayer projection — float-button, popover/dialog/menu panels, overlays; the cross-layer distance is the large offset' },
              { name: 'raise', default: '.jx-press: xs → sm', source: 'in-layer interactive lift — press-button, chip, action buttons' },
              { name: 'lift', default: '--shadow-2xs', source: 'static focus surface — section-card, alert, empty, result' },
              { name: 'engrave', default: '--shadow-engrave (inset)', source: 'glyph incised into the plane — kbd' },
              { name: 'well', default: '--shadow-well (+ -hover)', source: 'fillable container recess — input/textarea/select shells' },
            ]}
          />
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>interaction NEVER changes an element's tier: a well's hover deepens the
              inset's intensity only (<code class="text-accent">--shadow-well-hover</code>), and its focus
              tints border + caret color — the shadow's hierarchy never moves</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>these are the DEFAULT expressions: a deliberate off-default modulation is a
              prop or a --jx-press-shadow* custom (e.g. code-card's quiet copy button), never a
              per-component invention</span></li>
          </ul>
        </div>
      </SectionCard>
    </div>

    <div id="entity" data-reveal="">
      <SectionCard
        family="entity"
        headerRegion="entity"
        eyebrow="law"
        title="The entity law — border is objecthood"
        summary="Elevation says where a surface sits; entity says whether it should BE a surface at all. Border is objecthood: a bordered box asserts itself as a solid object, and inside an already-solid entity (a dialog panel) every extra border is another object competing with its container. The law is mathematical, not per-component taste (Owner ruling, 2026-09-01): the entity context ACCUMULATES depth — form shells dissolve at depth 1 (transparent border + ground; the well inset carries the affordance), accumulated nesting AUTO-TRIGGERS the hairline edge at depth ≥2, and data-assert-border force-spends the budget early. Background rides the same restraint: transparency first, backdrop-filter as the tint — never a second opaque fill. Hairlines are exempt: a structural rule organizes, it does not objectify."
      >
        <div class="flex flex-col gap-5">
          <TokenTable
            tokens={[
              { name: 'depth 0', default: 'the page floor', source: 'entity context — the control border IS its object edge: visible' },
              { name: 'depth 1', default: 'the dissolve', source: 'entity context — border + ground transparent; the well inset carries the fill affordance; focus still tints, hover still deepens' },
              { name: 'depth ≥2', default: 'the re-assertion', source: 'entity context — accumulated nesting auto-triggers the hairline edge (border at 55% alpha) for legibility' },
              { name: 'data-assert-border', default: 'the force-spend', source: 'the escape hatch — spends the entity budget early: the full edge + ground at any depth' },
            ]}
          />
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the channel is the Context technique: provideEntity() (dialog panels today, the
              popover family next) reads the ambient depth and accumulates +1 — nesting is
              automatic, no per-component accounting</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>a hairline is NOT an entity border: the dialog head/foot rules organize their
              panel; they never objectify. The law governs object edges only</span></li>
          </ul>
        </div>
      </SectionCard>
    </div>
  </div>
</div>
