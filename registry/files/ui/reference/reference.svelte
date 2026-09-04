<!--
  jixoai Reference (registry/files/ui/reference/reference.svelte,
  document-ontology R2 batch 3 — design §3, the Q7 citation primitive).

  A reference RESOLVES ITSELF from what the target says about itself
  (the target self-description grammar): a Figure target renders its
  kind's short display word + the number string the registrant owns
  ("Eq (4.5)" — Reference never formats numbers); a numbered Section
  renders "§ 3.2.1"; an unnumbered Section falls back to its bare
  title with no connective word (connectives are author copy and
  belong in the children escape hatch). Display words come from the
  FIGURE_LABELS single source in figure/numbering — never copied here
  (the reference → figure registryDependency edge).

  DOM contract (P1-3 frozen): the resolved state is a NATIVE fragment
  anchor <a href="#to" data-ref-to> — keyboard focus and ARIA ride the
  platform; no synthetic tabindex/role. The children snippet replaces
  the anchor's LABEL text only; href + data-ref-to semantics remain.

  Edge-emission state split (P1-4=A): "not yet registered" is not
  "nonexistent". While unsettled — and for the whole SSR pass, where
  onMount never runs so settled stays false — an unresolved reference
  renders the FALLBACK ANCHOR: ??(to) text still carrying href +
  data-ref-to, because the static harvester's two-pass pre-scan needs
  the forward edge claim. Only once the settle criterion holds
  (hydration complete + two rAFs) and the target is still absent does
  it degrade to the <span>??(to)</span> loud fallback: not navigable,
  data-ref-to dropped (dead anchors are a filed bug class), and a
  console.warn carrying the id — once per missing episode, NOT
  dev-gated (prerendered artifacts must surface bad references, and
  production renders the ?? marker too). Never throws.

  Resolution follows the registry reactively: forward targets that
  register before settle resolve without ever warning; a winner's
  eviction degrades the reference back to missing and re-warns (a
  fresh episode — design §1.2's re-trigger law).

  Provider escape (authoring error): with no registry in context the
  whole render degrades to the missing state and one dev warn fires
  at init; the settle warn stays silent (never double-diagnose).

  Deliberate gaps (living-spec record): bare-id elements are not
  referenceable this round (only Figure entries — registrable figures
  always carry numbers — and Section entries live in the registry);
  Entry targets are R4; display-word/locale/number-format
  customization axes are R5. This component consumes the frozen
  batch-0 registry interface and never builds one of its own.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { FIGURE_LABELS, targetRegistryFromContext } from '$lib/ui/figure/numbering.svelte';

  interface Props {
    /** the target's explicit id — numbers are display currency and
     *  never addresses; the document target registry resolves it */
    to: string;
    /** escape hatch: replaces the anchor's label text (author copy
     *  such as connectives); the href + data-ref-to semantics remain */
    children?: Snippet;
  }

  let { to, children }: Props = $props();

  // context binds at component init — the route-page provider must be
  // an ancestor. Escaping it degrades the whole render to the missing
  // state; say so once (dev-gated, unlike the settle warn). The warn
  // deliberately reads `to` at mount: it is a one-shot init diagnostic
  // for the id that escaped (state_referenced_locally is intended).
  const registry = targetRegistryFromContext();
  if (registry === undefined && import.meta.env?.DEV !== false) {
    // svelte-ignore state_referenced_locally
    console.warn(
      `[jx/reference] Reference to "${to}" escaped the route-page provider — no target registry in context; degrading to the missing-state render`,
    );
  }

  // the living target — SvelteMap reads inside $derived, so late
  // registrations, winner promotions and evictions all flow through
  const entry = $derived(registry?.getTarget(to));

  // target self-description (thunks are read HERE, inside $derived —
  // reactive to the registrant's state, never registration snapshots)
  const label = $derived.by(() => {
    const target = entry;
    if (target === undefined) return `??(${to})`;
    if (target.kind === 'figure') {
      return `${FIGURE_LABELS[target.figureKind].reference} (${target.number()})`;
    }
    const number = target.number();
    return number === null ? target.title() : `§ ${number}`;
  });

  // the settle criterion (tasks 3.1): hydration complete + two rAFs.
  // SSR never mounts, so settled stays false for the whole static
  // pass — the fallback anchor below is what prerender harvest reads.
  let settled = $state(false);
  onMount(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        settled = true;
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  });

  // "not yet registered" is not "nonexistent": warn only once the
  // settle criterion holds, once per missing episode (a live target
  // re-arms; eviction starts a fresh episode and warns again). The
  // escape case already warned at init — never double-diagnose.
  let warnArmed = true;
  $effect(() => {
    if (entry !== undefined) {
      warnArmed = true;
      return;
    }
    if (!settled || registry === undefined || !warnArmed) return;
    warnArmed = false;
    console.warn(
      `[jx/reference] unresolved target "${to}" after settle — rendering ??(${to}); the anchor and its data-ref-to edge are dropped (dead anchors are a filed bug class)`,
    );
  });
</script>

{#if entry === undefined && (registry === undefined || settled)}
  <!-- settled-missing, or the provider-escape degrade: loud, not
       navigable, and no data-ref-to edge claim -->
  <span>{`??(${to})`}</span>
{:else}
  <!-- resolved, or the pre-settle/SSR fallback claim: a native anchor
       whose edge stays claimed until settle proves the target dead -->
  <a href={'#' + to} data-ref-to={to}>
    {#if children}{@render children()}{:else}{label}{/if}
  </a>
{/if}
