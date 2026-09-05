<!-- figure blueprint: the 浮 primitive under a numbering domain. -->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Figure from '$lib/ui/figure/figure.svelte';
  import NumberingProvider from '$lib/ui/figure/numbering-provider.svelte';
  import Reference from '$lib/ui/reference/reference.svelte';
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
</script>

<NumberingProvider>
  <div class="flex h-full w-full flex-col justify-center gap-6 p-12">
    <SectionCard numbering="decimal" title="Results" eyebrow="4" headingLevel={2}>
      <div class="flex flex-col gap-5">
        <Figure kind="equation" id="eq-1" caption="the momentum balance">
          <div class="font-mono text-[15px]">p&nbsp;=&nbsp;m&nbsp;·&nbsp;v</div>
        </Figure>
        <Figure kind="table" id="tbl-1" caption="measured vs predicted" citedIn={['§ 4.1']}>
          <div class="font-mono text-[13px] text-muted-foreground">3 rows · 4 columns · Δ&thinsp;&lt;&thinsp;ε</div>
        </Figure>
        <p class="text-[13px] text-muted-foreground">the bound of <Reference to="eq-1" /> follows from <Reference to="tbl-1" /></p>
      </div>
    </SectionCard>
  </div>
</NumberingProvider>
