<!-- toc blueprint: the Combo ToC inside a miniature docs page — the
     desktop Rule Tracker rail (progress spine + weight-driven nodes)
     beside the tracked article it reads. The data-region / data-family
     marks are live: toc-engine runs for real and picks the entry that
     holds the line. -->
<script lang="ts">
  import Toc from '$lib/ui/toc/toc.svelte';
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <article class="flex min-w-0 flex-1 flex-col gap-5">
    <div class="flex flex-col gap-4" data-family="bp-toc-law">
      <section id="bp-toc-law" class="flex flex-col gap-2" data-region="bp-toc-law">
        <h2 class="font-nav text-sm tracking-tight">the rule tracker</h2>
        <p class="text-muted-foreground text-[12.5px] leading-5">
          Nodes fill by IoM weight — how much of each block holds the viewport. The bold marker
          is the line pick.
        </p>
      </section>
      <section id="bp-toc-weights" class="flex flex-col gap-2" data-region="bp-toc-weights">
        <h3 class="font-nav text-[13px] tracking-tight">IoM weights</h3>
        <p class="text-muted-foreground text-[12.5px] leading-5">
          intersection ÷ min(block, viewport) — saturates to 1 in both directions.
        </p>
      </section>
    </div>
    <section id="bp-toc-rail" class="flex flex-col gap-2" data-region="bp-toc-rail">
      <h2 class="font-nav text-sm tracking-tight">two surfaces, one engine</h2>
      <p class="text-muted-foreground text-[12.5px] leading-5">
        Desktop spine, mobile glass rail — both read the same framework-free engine.
      </p>
    </section>
  </article>
  <aside class="w-[172px] flex-none" aria-label="On this page">
    <!-- embedded miniature demo inside the
         blueprint stage — the rail must stay beside its own article, not
         adopt into the site scaffold's real top layer -->
    <Toc
      title="on this page"
      sections={[
        {
          id: 'bp-toc-law',
          label: 'the rule tracker',
          children: [{ id: 'bp-toc-weights', label: 'IoM weights' }],
        },
        { id: 'bp-toc-rail', label: 'two surfaces, one engine' },
      ]}
    />
  </aside>
</div>
