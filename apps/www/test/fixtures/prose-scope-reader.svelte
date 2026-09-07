<!--
  prose-scope-reader — the context pair's read face (Lane A spec
  fixture): getTypographyScope from a child window INSIDE vs OUTSIDE a
  prose region. Renders the payload's knobs (or NONE) so the spec
  asserts the nearest-provider law and the getter endorsement without
  a production reader existing (v1 has none — the pair is future
  surface, the spec its only consumer).
-->
<script lang="ts">
  import { getTypographyScope } from '../../src/lib/typography.svelte';

  let { testid }: { testid: string } = $props();

  const scope = $derived(getTypographyScope()?.scope);
  const text = $derived.by(() => {
    if (scope === undefined) return 'NONE';
    const set = Object.entries(scope)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
    return set.length > 0 ? set.join('|') : 'EMPTY';
  });
</script>

<span data-testid={testid}>{text}</span>
