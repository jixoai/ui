<!-- reference blueprint: the 引 primitive's resolution matrix. -->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import NumberingProvider from '$lib/ui/figure/numbering-provider.svelte';
  import Reference from '$lib/ui/reference/reference.svelte';
  import Figure from '$lib/ui/figure/figure.svelte';
</script>

<NumberingProvider>
  <div class="flex h-full w-full flex-col justify-center gap-5 p-12">
    <SectionCard numbering="decimal" title="Discussion" headingLevel={2}>
      <div class="flex flex-col gap-3 text-[13.5px]">
        <p>the balance of <Reference to="eq-d" /> holds throughout</p>
        <p>the procedure lives in <Reference to="sec-m" /></p>
        <p>for notation see <Reference to="sec-n" /></p>
        <p class="text-muted-foreground">a broken one renders <Reference to="eq-x" /> loudly</p>
      </div>
    </SectionCard>
    <Figure kind="equation" id="eq-d" caption="the balance">
      <div class="font-mono text-[14px]">Σ&nbsp;F&nbsp;=&nbsp;0</div>
    </Figure>
    <SectionCard id="sec-m" title="Methods" headingLevel={3}>the procedure</SectionCard>
    <SectionCard id="sec-n" title="Notation" headingLevel={3}>the glossary</SectionCard>
  </div>
</NumberingProvider>
