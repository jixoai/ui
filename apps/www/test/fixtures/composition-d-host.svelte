<!--
  Test hosts for the composition-d suite (composition-first-apis,
  2026-08-25). One branch per scenario; state is surfaced as data
  attributes so tests read behavior through the DOM.
-->
<script lang="ts">
  import Toc, { TocList, TocItem, TocLink } from '$lib/ui/toc/index';
  import Tour from '$lib/ui/tour/tour.svelte';
  import AlertDialog, {
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogActions,
    AlertDialogAction,
    AlertDialogCancel,
  } from '$lib/ui/alert-dialog/index';
  import Popconfirm from '$lib/ui/popconfirm/popconfirm.svelte';

  type Scenario =
    | 'toc-manual'
    | 'toc-outline'
    | 'tour-card'
    | 'alert-dialog'
    | 'popconfirm-default'
    | 'popconfirm-override';

  let { scenario, outlineRoot = '#cd-outline-root' }: { scenario: Scenario; outlineRoot?: string } =
    $props();

  let tourOpen = $state(false);
  let tourFinishedAt = $state<number | null>(null);
  let alertOpen = $state(false);
  let deleted = $state(false);
  let pcOutcome = $state('');
</script>

{#if scenario === 'toc-manual'}
  <div data-host="toc-manual">
    <section id="cd-alpha"><h2>alpha</h2></section>
    <section id="cd-alpha-one"><h3>alpha one</h3></section>
    <section id="cd-beta"><h2>beta</h2></section>
    <Toc>
      <TocList>
        <TocItem>
          <TocLink href="#cd-alpha">Alpha</TocLink>
          <TocList>
            <TocItem><TocLink href="#cd-alpha-one">Alpha one</TocLink></TocItem>
          </TocList>
        </TocItem>
        <TocItem><TocLink href="#cd-beta">Beta</TocLink></TocItem>
      </TocList>
    </Toc>
  </div>
{:else if scenario === 'toc-outline'}
  <div data-host="toc-outline">
    <div id="cd-outline-root">
      <h2>Alpha Law</h2>
      <p>x</p>
      <h3>Alpha detail</h3>
      <p>y</p>
      <h2>Beta Law</h2>
      <p>z</p>
    </div>
    <Toc outline={{ root: outlineRoot }} />
  </div>
{:else if scenario === 'tour-card'}
  <div data-host="tour-card" data-open={tourOpen} data-finished={tourFinishedAt ?? ''}>
    <button type="button" data-tour-open-btn onclick={() => (tourOpen = true)}>start tour</button>
    <section data-tour-a>target a</section>
    <section data-tour-b>target b</section>
    <Tour
      bind:open={tourOpen}
      steps={[
        { target: '[data-tour-a]', title: 'Step A', description: 'first' },
        { target: '[data-tour-b]', title: 'Step B', description: 'second' },
      ]}
      onfinish={(i) => (tourFinishedAt = i)}
    >
      {#snippet card(api)}
        <div data-tour-card-api data-index={api.index} data-total={api.total} data-step-title={api.step.title ?? ''}>
          {api.index}/{api.total}: {api.step.title}
        </div>
        <div class="flex gap-2">
          <button type="button" data-tour-card-prev onclick={api.prev} disabled={api.index === 0}>prev</button>
          <button type="button" data-tour-card-next onclick={api.next}>next</button>
          <button type="button" data-tour-card-skip onclick={api.skip}>skip</button>
        </div>
      {/snippet}
    </Tour>
  </div>
{:else if scenario === 'alert-dialog'}
  <div data-host="alert-dialog" data-open={alertOpen} data-deleted={deleted}>
    <AlertDialog bind:open={alertOpen} onconfirm={() => (deleted = true)}>
      <AlertDialogTrigger>delete repo</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>delete repo?</AlertDialogTitle>
        <AlertDialogDescription>no undo</AlertDialogDescription>
        <AlertDialogActions>
          <AlertDialogCancel>cancel</AlertDialogCancel>
          <AlertDialogAction>delete</AlertDialogAction>
        </AlertDialogActions>
      </AlertDialogContent>
    </AlertDialog>
  </div>
{:else if scenario === 'popconfirm-default'}
  <div data-host="popconfirm-default" data-outcome={pcOutcome}>
    <Popconfirm
      title="Delete this row?"
      description="The history goes with it."
      confirmLabel="Delete"
      onconfirm={() => (pcOutcome = 'confirmed')}
      oncancel={() => (pcOutcome = 'cancelled')}
    >
      <button type="button" data-pc-trigger>delete row</button>
    </Popconfirm>
  </div>
{:else if scenario === 'popconfirm-override'}
  <div data-host="popconfirm-override" data-outcome={pcOutcome}>
    <Popconfirm title="Merge?" onconfirm={() => (pcOutcome = 'confirmed')}>
      {#snippet content()}
        <p data-pc-custom-content>merge this branch?</p>
      {/snippet}
      {#snippet actions()}
        <div class="flex justify-end gap-2">
          <button type="button" data-pc-custom-keep popovertarget>keep</button>
          <button type="button" data-pc-custom-merge onclick={() => (pcOutcome = 'confirmed')}>merge</button>
        </div>
      {/snippet}
      <button type="button" data-pc-trigger>merge branch</button>
    </Popconfirm>
  </div>
{/if}
