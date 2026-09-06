<!--
  jixoai icon (registry/files/ui/icon/icon.svelte,
  OpenSpec 2026-09-06-icon-component-pipeline, design §7).

  The named-glyph renderer over the generated set ($lib/icon-set.gen):

    <Icon name="chevronRight" />                        16px, sw 2
    <Icon name="x" size={13} strokeWidth={2.5} class="…" />

  `name` is the IconName union — a typo is a compile error. The
  component owns the root <svg>: viewBox from the icon data, the
  square `size` edge, currentColor painting by artwork nature (stroke
  nature: stroke=currentColor fill=none; fill nature the inverse),
  round caps/joins, aria-hidden, data-jx-icon; `class` + restProps
  land on the root verbatim.

  Two paths (the artifact's chunk law, design §3): inline-core names
  answer getIcon() synchronously — SSR paints them, hydration
  matches, zero wiring. Names past the core ride {#await loadIcon()};
  pending AND rejected render the SAME fixed reserved box, so
  hydration never rewrites the box; rejection warns once per failed
  chunk per session (warnedChunks — module scope, no reset API).

  {@html} is an internal render detail, never a public API: its
  payload is exclusively the plugin-extracted `d` of the generated
  artifact (RAW-gated upstream, design §2) — nothing from props can
  reach the sink.
-->
<script module lang="ts">
  // session-wide warn dedup (design §7): one console.warn per failed
  // chunk import — repeated mounts and names in the same chunk stay
  // silent. The chunk identity is derived from the error chain: the
  // artifact's lazy loader rethrows its fixed sentinel with the
  // original import error as `cause`, and either layer (or a
  // fetch-failure URL) may carry the concrete
  // virtual:jixoai-icons/chunk/<K> id; anything unrecognized dedupes
  // on its own serialization.
  const warnedChunks = new Set<string>();
  const CHUNK_ID = /virtual:jixoai-icons\/chunk\/(\d+)/;

  function chunkIdentityOf(error: unknown): string {
    let current: unknown = error;
    for (let depth = 0; current && depth < 4; depth += 1) {
      const message = current instanceof Error ? current.message : String(current);
      const hit = CHUNK_ID.exec(message)?.[1];
      if (hit) return hit;
      current = (current as { cause?: unknown }).cause;
    }
    return String(error);
  }

  function warnFailedChunkOnce(error: unknown): void {
    const identity = chunkIdentityOf(error);
    if (warnedChunks.has(identity)) return;
    warnedChunks.add(identity);
    console.warn(
      '[jixoai/icon] failed to load an icon chunk; its icons render as reserved boxes',
      error,
    );
  }
</script>

<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import { getIcon, loadIcon, type IconData, type IconName } from '$lib/icon-set.gen';

  interface Props extends SVGAttributes<SVGSVGElement> {
    /** REQUIRED — the glyph's name in the generated set (typo = compile error) */
    name: IconName;
    /** the square edge: svg width/height; a lazy pending box reserves the same square */
    size?: number | string;
    /** stroke weight (stroke nature only — inert on fill artwork) */
    strokeWidth?: number | string;
  }

  let {
    name,
    size = 16,
    strokeWidth = 2,
    class: className = '',
    ...rest
  }: Props = $props();

  // inline-core hit → sync render (the SSR path); null → the lazy chunks
  const data = $derived(getIcon(name));

  // CSS lengths need a unit — numeric sizes (the default) px-coerce;
  // string sizes pass through verbatim (design §7's {size} slot as CSS)
  const cssSize = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

{#snippet glyph(icon: IconData)}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={icon.v}
    width={size}
    height={size}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    data-jx-icon=""
    fill={icon.n === 'fill' ? 'currentColor' : 'none'}
    stroke={icon.n === 'fill' ? 'none' : 'currentColor'}
    class={className}
    {...rest}
  >{@html icon.d}</svg>
{/snippet}

{#snippet reservedBox()}
  <span
    data-jx-icon-pending=""
    aria-hidden="true"
    style="display:inline-block;width:{cssSize};height:{cssSize}"></span>
{/snippet}

{#if data}
  {@render glyph(data)}
{:else}
  {#await loadIcon(name)}
    {@render reservedBox()}
  {:then loaded}
    {@render glyph(loaded)}
  {:catch error}
    {@const warned = warnFailedChunkOnce(error)}
    {@render reservedBox()}
  {/await}
{/if}
