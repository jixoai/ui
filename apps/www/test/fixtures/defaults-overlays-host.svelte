<!--
  The W2 overlays/feedback Defaults migration host
  (test/fixtures/defaults-overlays-host.svelte,
  context-defaults-economy task 3.2, 2026-09-03).

  One render, five regions, the REAL components (state read back
  through the valued hooks — data-variant / data-jx-alert /
  data-jx-separator / data-jx-toast / data-density — never through
  internals):
    bare      — no providers: the floating-surface owns ('auto') and
                the literal owns (alert-dialog-action 'fill',
                separator 'line') resolve; the no-opinion density
                slots stamp nothing
    zone      — paint zone 'tonal' + density 'sm': Alert (the W2
                frozen-table family) goes ambient; the literal-slot
                families (tooltip's surface, separator's ink
                geometry) never move; explicit props still win
    ghost     — paint zone 'ghost' (outside Alert's two-rung union):
                the unsupported external surface — D3-A retired the
                runtime values guard (the ambient domain is trusted,
                no clamp, no warn; nothing asserts this region)
    density   — provider families: popconfirm and command
                inherit-then-provide under a DensityProvider 'sm' —
                their own stamps AND their sub-parts' re-stamps land
                the provider's tier; an explicit density beats the
                inherited one through the eager-capture lane
    adlg      — the alert-dialog pair: content's surface variant and
                the action's ladder resolve through the one family
                contract (two vocabularies, two slots)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';
  import Popover from '$lib/ui/popover/popover.svelte';
  import HoverCard from '$lib/ui/hover-card/hover-card.svelte';
  import Alert from '$lib/ui/alert/alert.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import Empty from '$lib/ui/empty/empty.svelte';
  import Result from '$lib/ui/result/result.svelte';
  import FloatButton from '$lib/ui/float-button/float-button.svelte';
  import Popconfirm from '$lib/ui/popconfirm/popconfirm.svelte';
  import Command from '$lib/ui/command/command.svelte';
  import CommandList from '$lib/ui/command/command-list.svelte';
  import AlertDialog from '$lib/ui/alert-dialog/alert-dialog.svelte';
  import AlertDialogContent from '$lib/ui/alert-dialog/alert-dialog-content.svelte';
  import AlertDialogAction from '$lib/ui/alert-dialog/alert-dialog-action.svelte';
  import Anchor from '$lib/ui/anchor/anchor.svelte';
  import ZoneProvider from './paint-axis-zone-provider.svelte';
  import DensityProvider from './density-provider-host.svelte';

  const trigger: Snippet = (() => {}) as unknown as Snippet;
  const children: Snippet = (() => {}) as unknown as Snippet;
</script>

<section data-testid="bare">
  <Tooltip text="tip"><span>host</span></Tooltip>
  <Popover id="pop-bare" trigger={trigger}>{@render children()}</Popover>
  <HoverCard {trigger}>{@render children()}</HoverCard>
  <Alert title="notice">body</Alert>
  <Separator />
  <Empty title="nothing" />
  <Result title="done" />
  <FloatButton label="compose">{@render children()}</FloatButton>
</section>

<section data-testid="zone">
  <ZoneProvider variant="tonal">
    <DensityProvider density="sm">
      <Alert title="zone notice">body</Alert>
      <Alert variant="outline" title="explicit wins">body</Alert>
      <Tooltip text="tip"><span>host</span></Tooltip>
      <Separator />
      <Empty title="nothing" />
      <Result title="done" />
      <Result density="lg" title="explicit density wins" />
      <FloatButton label="compose">{@render children()}</FloatButton>
      <Anchor><a href="#a">first</a></Anchor>
    </DensityProvider>
  </ZoneProvider>
</section>

<section data-testid="ghost">
  <ZoneProvider variant="ghost">
    <Alert title="guard">body</Alert>
  </ZoneProvider>
</section>

<section data-testid="density">
  <DensityProvider density="sm">
    <Popconfirm title="Delete this row?">
      <button type="button">row action</button>
    </Popconfirm>
    <Popconfirm density="lg" title="Explicit tier?">
      <button type="button">row action</button>
    </Popconfirm>
    <Command>
      <CommandList>{@render children()}</CommandList>
    </Command>
  </DensityProvider>
</section>

<section data-testid="adlg">
  <AlertDialog>
    <AlertDialogContent>
      <AlertDialogAction>confirm</AlertDialogAction>
      <AlertDialogAction variant="tonal">confirm tonal</AlertDialogAction>
    </AlertDialogContent>
  </AlertDialog>
</section>
