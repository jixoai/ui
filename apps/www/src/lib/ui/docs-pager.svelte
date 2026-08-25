<!--
  jxoai docs pager (docs-restructure, 2026-08-25). The page relations on
  every component page: previous / next along the taxonomy reading order
  (first/last fall back to the listing / docs home) + same-group related
  links, NEAREST FIRST (design D7). Rendered BY THE LAYOUT on
  /docs/components/* routes — zero per-page wiring, uniform by
  construction. Non-inventory pages (the form family hub) render
  nothing.
-->
<script lang="ts">
  import { page } from '$app/state';
  import { componentContext } from '$lib/docs-route-model';
  import { icons } from '$lib/icons';
  import './docs-pager.css';

  const name = $derived(page.url.pathname.split('/').pop()?.replace(/\.html$/, '') ?? '');
  const ctx = $derived(componentContext(name));
</script>

{#if ctx}
  <nav class="jx-docs-pager-wrap" aria-label="pager">
    {#if ctx.related.length}
      <div class="jx-docs-pager-related">
        <p class="jx-docs-pager-title">related · {ctx.groupLabel.toLowerCase()}</p>
        <ul role="list">
          {#each ctx.related as rel (rel.entry.name)}
            <li>
              <span class="jx-dp-ico text-primary" aria-hidden="true">{@html icons.arrowRight}</span>
              <a href={rel.entry.href}>{rel.entry.name}</a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
    <div class="jx-docs-pager">
      {#if ctx.prev}
        <a href={ctx.prev.entry.href}>
          <span class="jx-docs-pager-direction"><span class="jx-dp-ico" aria-hidden="true">{@html icons.arrowLeft}</span>previous</span>
          <span class="jx-docs-pager-label">{ctx.prev.entry.name}</span>
        </a>
      {:else}
        <a href="/docs/components.html">
          <span class="jx-docs-pager-direction"><span class="jx-dp-ico" aria-hidden="true">{@html icons.arrowLeft}</span>back to</span>
          <span class="jx-docs-pager-label">all components</span>
        </a>
      {/if}
      {#if ctx.next}
        <a class="jx-docs-pager-next" href={ctx.next.entry.href}>
          <span class="jx-docs-pager-direction">next<span class="jx-dp-ico" aria-hidden="true">{@html icons.arrowRight}</span></span>
          <span class="jx-docs-pager-label">{ctx.next.entry.name}</span>
        </a>
      {:else}
        <a class="jx-docs-pager-next" href="/docs.html">
          <span class="jx-docs-pager-direction">end of the chain<span class="jx-dp-ico" aria-hidden="true">{@html icons.arrowRight}</span></span>
          <span class="jx-docs-pager-label">docs home</span>
        </a>
      {/if}
    </div>
  </nav>
{/if}
