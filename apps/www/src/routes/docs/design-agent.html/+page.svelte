<!--
  docs/design-agent.html — the design agent product page (kernel
  0.6.0 docking round, 2026-09-27). One page, the honest slice: what
  the agent is, the 60-second quickstart, the three agent modes, the
  design/ workspace contract, and how the agent edits styles through
  the eight axes — with the availability note kept truthful (the
  @jixoai/ui-design package rides the 0.6.x release train; until that
  publishing closes, the command resolves from repo checkouts and
  insider installs, not bare npx). Setup depth (version matrix, dsh
  key security) lives here; workflow/reference pages are the follow-up
  batch once the Owner signs the public rollout.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';

  const quickstart = `# from a jixoai-ui project root (components.json present)
npx jixoai-ui design --agent echo

# flags
#   --port <n>      the design server port
#   --agent <mode>  none | echo | dsh   (see the table below)
#   --no-open       don't launch the browser

# the studio lands at http://localhost:<port>/__design__/`;

  const workspaceTree = `design/
├── prototypes/     # one folder per prototype — pages, components, refs
│   └── <name>/
│       ├── +page.svelte      # the canvas page (any jixoai-ui surface)
│       └── refs/             # exported design-file frames, snapshots
└── .git            # a NESTED repo: design work is versioned apart
                   # from product code, promoted on release`;

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Design Agent · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai design agent: a local studio over your project's jixoai-ui surfaces — layers tree, live props panel, model-route settings, and an agent loop that edits through the eight style axes. Three agent modes: none (read-only), echo (demo playbook), dsh (a real headless agent)."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <!-- Intro -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="docs · design agent"
        title="Design Agent — a studio that edits your real components"
        summary="One command starts a local design server over your project: your registry items compile live on canvas pages, the studio's layers tree and props panel edit them in place, and an optional agent drives the same edits from chat. Everything the agent touches is the same component surface you ship — no throwaway prototypes, no drift."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">local-first</span>
          <span class="pill">real registry surfaces</span>
          <span class="pill">eight-axis styling</span>
          <span class="pill">keys stay on your disk</span>
        </div>
      </SectionCard>
    </div>

    <div id="what-it-is" data-reveal="">
      <SectionCard
        family="what-it-is"
        headerRegion="what-it-is"
        eyebrow="the product"
        title="What it is"
        summary="Three pieces in one process: a design server (your vite pipeline, aliased to the registry twin trees), the prebuilt studio chrome at /__design__/ (navigator, layers, props panel, chat, settings), and the workspace it scaffolds — a design/ directory carrying your canvas pages as a nested git repo, promoted into product code when a design settles."
      >
        <A11yTable
          keys={[
            { key: 'canvas pages', action: 'design/prototypes/<name>/+page.svelte — any jixoai-ui surface, compiled by your own vite, edited live' },
            { key: 'props panel', action: 'the studio reads each component\'s prop schema and edits it through registry controls — the same components, not a parallel form builder' },
            { key: 'model routes', action: 'the settings panel manages provider routes for agent runs: the provider catalog, per-model cards, and API keys stored 0600-local, never in the repo' },
            { key: 'promote & apply', action: 'a settled prototype promotes through the workspace lifecycle — the design ships as component code, not as exports' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="quickstart" data-reveal="">
      <SectionCard
        family="quickstart"
        headerRegion="quickstart"
        eyebrow="60 seconds"
        title="Quickstart"
        summary="The command probes your project (components.json, the twin trees), scaffolds the design/ workspace idempotently, and opens the studio. Start with the echo agent — a scripted playbook that needs no model and no keys, there to show the loop before you wire a real one."
      >
        <CodeBlock code={quickstart} lang="bash" meta="start the design agent" />
        <A11yTable
          keys={[
            {
              key: 'availability',
              action:
                'The npx path resolves the design toolchain from repo checkouts and insider installs today; shipping @jixoai/ui-design on the public registry rides the 0.6.x release train (CLI, plugin and design tool locked in step). Until then the command fails loudly rather than half-starting',
            },
          ]}
        />
      </SectionCard>
    </div>

    <div id="agents" data-reveal="">
      <SectionCard
        family="agents"
        headerRegion="agents"
        eyebrow="the loop"
        title="The three agent modes"
        summary="One flag picks how much agency rides the studio. They are deliberately distinct products — don't read them as three shades of AI."
      >
        <A11yTable
          keys={[
            { key: 'none — read-only', action: 'The studio without an agent: you drive every edit. The chat lane reports it is readonly; nothing else changes' },
            { key: 'echo — the demo agent', action: 'A fixed local playbook, no model, no credentials. Runs the same edit loop a real agent would, so you can watch the protocol before trusting it' },
            { key: 'dsh — the headless agent', action: 'A real agent binary driven once per turn. You configure provider routes in settings (catalog, model cards, per-model probes); API keys land in a 0600 file on your disk and never ride the repo or the prompts' },
          ]}
        />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="workspace" data-reveal="">
    <SectionCard
      family="workspace"
      headerRegion="workspace"
      eyebrow="the contract"
      title="The design/ workspace"
      summary="Design work is versioned apart from product code. The scaffold is idempotent — re-running the command never clobbers your pages — and the nested repo keeps every save, release and promote reviewable on its own line of history."
    >
      <CodeBlock code={workspaceTree} lang="text" meta="the scaffold the command writes" />
    </SectionCard>
  </div>

  <div id="styles" data-reveal="">
    <SectionCard
      family="styles"
      headerRegion="styles"
      eyebrow="the mechanism"
      title="How it styles: the eight axes"
      summary="The agent never freehands CSS at your components. Every style edit rides the kernel's universal props — the eight axes behind --jx-<axis>-<alias> — so a density change, a radius step or an elevation bump is a named, remappable step, not an arbitrary value that later fights the tokens. The same ladder the props panel offers, the agent speaks."
    >
      <A11yTable
        keys={[
          { key: 'you say', action: '"density down one rung on this card", "radius to the squircle step", "this surface up one elevation band"' },
          { key: 'it writes', action: 'axis vars and named steps over the component — var(--jx-<axis>-<alias>) — never a raw px where a step exists' },
          { key: 'why it matters', action: 'theme flips, remaps and degradation all keep working after the edit: agent output is token-lawful by construction' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="interop" data-reveal="">
    <SectionCard
      family="interop"
      headerRegion="interop"
      eyebrow="neighbors"
      title="Boundaries & neighbors"
      summary="The design agent is a consumer of everything this site documents — it adds no new styling system of its own."
    >
      <A11yTable
        keys={[
          { key: 'install', action: 'The zero-tooling prerequisite the agent assumes — one css entry, the item payloads' },
          { key: 'universal props', action: 'The eight axes the agent edits through — the unified baseline behind every style control' },
          { key: 'components', action: 'The 110-page catalog the studio mounts on canvas pages — the same twins your project installs' },
          { key: 'registry', action: 'The installable inventory; the design toolchain itself is a product line beside it, not a registry item' },
        ]}
      />
    </SectionCard>
  </div>
</div>
