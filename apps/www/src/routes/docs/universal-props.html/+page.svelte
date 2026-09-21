<!--
  universal-props — the eight-axis concept page (route FROZEN by
  explicit-props task 4.5; this MINIMAL first slice landed with W3
  batch A because the registry item's site meta must target a real
  route — the catalog's sync binding throws on a dead href, and every
  docs page 500s through the layout until the item carries meta).
  The full W4 wave (4.5) owns the page's completion: the concept
  walkthrough, the alias-remap story, query() deep dives.
-->
<script lang="ts">
  import { rt } from '$lib/surface/routes.stylex';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import { universalRows } from '$lib/ui/props-table/from-meta';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import { cn } from '$lib/utils';

  // the section rows straight from the ONE shared source (the frozen
  // UNIVERSAL_AXES artifact — never hand-copied here)
  const rows: PropEntry[] = universalRows();
</script>

<svelte:head>
  <title>universal props — jixoai</title>
</svelte:head>

<div class={cn(rt.shell)}>
  <div id="grammar" data-reveal="">
    <SectionCard
      family="grammar"
      headerRegion="grammar"
      eyebrow="grammar"
      title="The grammar — one law, eight axes"
      summary="Every component accepts the same eight style axes. Each axis takes a NAMED step (theme aliases, developer-remappable), the reserved literal auto (inherit the ambient context — the default, stamps nothing), an exact NUMBER (the unit is per-axis: px · coefficient · dp · hue), or query() wrapping any lane for responsive and container-conditional values. Values resolve to CSS expressions stamped as custom properties on the component root — never new classes."
    >
      <div class={cn(rt.col20)}>
        <p class={cn(rt.code12)}>size · shape · radius · density · color · theme · elevation · motion</p>
      </div>
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes"
      summary="The frozen lane table (the docs vocabulary; the legacy density spellings keep working as aliases)."
    >
      <div class={cn(rt.col20)}>
        <PropsTable props={rows} title="" />
      </div>
    </SectionCard>
  </div>

  <div id="resolution" data-reveal="">
    <SectionCard
      family="resolution"
      headerRegion="resolution"
      eyebrow="law"
      title="Resolution & supply — 吃也供"
      summary="An axis resolves explicit prop → ambient context → the family's own default. A component that consumes an axis also SUPPLIES its resolved value downward, so a nested component inherits by default. On native-element wrappers the family consumes size and color — the native input never receives them; everything the family does not own still rides through rest props."
    >
      <div class={cn(rt.col20)}>
        <p class={cn(rt.para)}>
          See any migrated family's docs page for the live
          <code class={cn(rt.inkAccent)}>Universal props</code> section and demo — the
          native form families (input, native-select, textarea, checkbox, radio, range,
          color-picker, file-input, number-input, cascader, tags-input, input-otp,
          combobox, input-group, date-picker, ghostty-term) carry the surface first.
        </p>
      </div>
    </SectionCard>
  </div>
</div>
