<!-- figure blueprint: the 浮 primitive under a numbering domain. -->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Figure from '$lib/ui/figure/figure.svelte';
  import NumberingProvider from '$lib/ui/figure/numbering-provider.svelte';
  import Reference from '$lib/ui/reference/reference.svelte';
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<NumberingProvider>
  <div class={cx(bpA.figureStage)}>
    <SectionCard numbering="decimal" title="Results" eyebrow="4" headingLevel={2}>
      <Stack direction="column" gap="20">
        <Figure kind="equation" id="eq-1" caption="the momentum balance">
          <div class={cx(bpA.figureEquation)}>p&nbsp;=&nbsp;m&nbsp;·&nbsp;v</div>
        </Figure>
        <Figure kind="table" id="tbl-1" caption="measured vs predicted" citedIn={['§ 4.1']}>
          <div class={cx(bpA.figureNote)}>3 rows · 4 columns · Δ&thinsp;&lt;&thinsp;ε</div>
        </Figure>
        <p class={cx(bpA.figureBound)}>the bound of <Reference to="eq-1" /> follows from <Reference to="tbl-1" /></p>
      </Stack>
    </SectionCard>
  </div>
</NumberingProvider>
