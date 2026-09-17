<!-- reference blueprint: the 引 primitive's resolution matrix.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import NumberingProvider from '$lib/ui/figure/numbering-provider.svelte';
  import Reference from '$lib/ui/reference/reference.svelte';
  import Figure from '$lib/ui/figure/figure.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

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
  <div class={cx(bpB.referenceStage)}>
    <SectionCard numbering="decimal" title="Discussion" headingLevel={2}>
      <div class={cx(bpB.referenceBody)}>
        <p>the balance of <Reference to="eq-d" /> holds throughout</p>
        <p>the procedure lives in <Reference to="sec-m" /></p>
        <p>for notation see <Reference to="sec-n" /></p>
        <p class={cx(bpB.referenceBroken)}>a broken one renders <Reference to="eq-x" /> loudly</p>
      </div>
    </SectionCard>
    <Figure kind="equation" id="eq-d" caption="the balance">
      <div class={cx(bpB.referenceFormula)}>Σ&nbsp;F&nbsp;=&nbsp;0</div>
    </Figure>
    <SectionCard id="sec-m" title="Methods" headingLevel={3}>the procedure</SectionCard>
    <SectionCard id="sec-n" title="Notation" headingLevel={3}>the glossary</SectionCard>
  </div>
</NumberingProvider>
