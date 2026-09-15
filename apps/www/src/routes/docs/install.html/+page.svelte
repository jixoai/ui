<!--
  docs/install.html — the install prerequisite page
  (stylex-kernel-phase0 P0.7). One answer to "what do I owe to use
  jixoai-ui": a css entry that imports what your items ship — nothing
  else. For compiled-payload items (the atom-authored migration, in
  flight) the engine is OUR build-time tool: consumers import the
  item css and use the components, owing zero @stylexjs/* packages;
  running StyleX (or Tailwind, or any engine) for your OWN markup is a
  consumer choice, never a prerequisite. Legacy utility-authored items
  keep the standing TW4 prerequisite until their family's migration
  lands (the transitional clause) — both lanes are documented here so
  the page stays true at every point of the phase train.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';

  const entryCss = `/* src/app.css — the WHOLE prerequisite (compiled-payload items) */
@import '$lib/jixoai.css';   /* the token sheet (rides @jixoai/jixoai-theme) */
@import '$lib/ui/popover/popover.css';  /* a migrated item's css — plain css, zero tooling */`;

  const usageSvelte = `<script lang="ts">
  import Popover from '$lib/ui/popover';        /* the components */
  import '$lib/ui/popover/popover.css';         /* the item's css — or your entry imports it */
<\/script>

<!-- the compiled atoms are plain class strings: no engine, no plugin -->
<Popover>schedule</Popover>`;

  const legacyEntry = `/* the standing TW4 prerequisite — legacy utility-authored items */
@import 'tailwindcss';        /* tailwind v4 (tailwindcss + @tailwindcss/vite) */
@import '$lib/jixoai.css';    /* the jixoai token sheet, AFTER tailwind */`;

  const layerOrder = `@layer properties, theme, base, components,
  components.stylex.priority1, …, components.stylex.priorityN, utilities;
/*              ↑ kernel atom paint (nested in components)   ↑ your utilities — always last */`;
</script>

<svelte:head>
  <title>Install · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui install prerequisite: one css entry importing what your items ship. Compiled-payload items owe zero styling-engine tooling — import the item css and use the components; engine tooling is optional for consumers' own use. Legacy utility-authored items keep the Tailwind v4 prerequisite until their migration lands."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <!-- Intro -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="docs · install"
        title="Install — one css entry, zero engine tooling"
        summary="Adding jixoai-ui items owes exactly one thing: a css entry that imports what the items ship. Compiled-payload items (the atom-authored migration) compile on our side — you import plain css and plain class strings, and never install a styling engine for OUR components. Running one for your own markup is your choice."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">one css entry</span>
          <span class="pill">zero @stylexjs/* owed</span>
          <span class="pill">engine tooling optional</span>
          <span class="pill">your utilities always win</span>
        </div>
      </SectionCard>
    </div>

    <div id="one-entry" data-reveal="">
      <SectionCard
        family="one-entry"
        headerRegion="one-entry"
        eyebrow="prerequisite"
        title="The prerequisite is a css entry"
        summary="Whatever your stack, the wiring is the same shape the jixoai theme sheet has always used: import the css your items ship. Nothing to configure, nothing to compile."
      >
        <CodeBlock code={entryCss} lang="css" meta="the whole prerequisite" />
      </SectionCard>
    </div>

    <div id="compiled-payload" data-reveal="">
      <SectionCard
        family="compiled-payload"
        headerRegion="compiled-payload"
        eyebrow="the compiled contract"
        title="Compiled payload items: import the css, use the classes"
        summary="Kernel paint is authored as StyleX atoms on our side and compiled by our build. What ships is a class-constant module (plain strings) plus the item's css — the F11 contract. Your bundler never sees the engine."
      >
        <CodeBlock code={usageSvelte} lang="svelte" meta="a compiled-payload item in use" />
        <A11yTable
          keys={[
            { key: 'class constants', action: 'Plain string modules — import them, put them on class, nothing else' },
            { key: 'item css', action: 'Plain css with the canonical layer statement first — one import per item (or one fan-in entry)' },
            { key: '@stylexjs/*', action: 'Absent from your lockfile: the engine rides the jixoai-ui build, never yours' },
            { key: 'your own engine', action: 'Optional and unrelated — Tailwind, StyleX, anything, for YOUR markup' },
          ]}
        />
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="transitional" data-reveal="">
    <SectionCard
      family="transitional"
      headerRegion="transitional"
      eyebrow="transition"
      title="The transitional state: legacy items still want Tailwind v4"
      summary="Not every family has migrated yet. Utility-authored items (the standing registry) keep their documented prerequisite — tailwindcss v4 with @tailwindcss/vite and the jixoai sheet imported after it — until their family's migration lands. The migration is staged; this page's compiled-payload lane grows as it advances."
    >
      <CodeBlock code={legacyEntry} lang="css" meta="the legacy entry (utility-authored items)" />
    </SectionCard>
  </div>

  <div id="layer-law" data-reveal="">
    <SectionCard
      family="layer-law"
      headerRegion="layer-law"
      eyebrow="guarantee"
      title="Your utilities always beat kernel paint"
      summary="Every kernel stylesheet — compiled atoms included — opens with the same canonical layer statement, so consumer utilities sort after the kernel tiers no matter which side imports first. Restyling an installed component is a class away, never a specificity fight."
    >
      <CodeBlock code={layerOrder} lang="css" meta="the canonical layer order (baked, never hand-written)" />
    </SectionCard>
  </div>

  <div id="verify" data-reveal="">
    <SectionCard
      family="verify"
      headerRegion="verify"
      eyebrow="installation"
      title="Verify your install"
      summary="The registry ships a prerequisite checker for the legacy lane; the compiled lane needs none (an import that resolves IS the proof). Both run from your project root."
    >
      <CodeBlock
        code={`npx jixoai-ui add popover          # install an item (compiled or legacy)

# legacy utility-authored items only — the TW4 prerequisite check
# (scripts/check-tw4-prereq.mjs; copy it or run it from a checkout):
node check-tw4-prereq.mjs src/app.css`}
        lang="bash"
        meta="install + verify"
      />
    </SectionCard>
  </div>
</div>
