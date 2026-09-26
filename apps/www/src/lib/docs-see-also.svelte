<!--
  Docs-see-also (apps/www/src/lib/docs-see-also.svelte, docs-demo-standard
  task 5.2): the skeleton's closing section — related component links.

  DATA, not hand lists: the links derive from the docs-route-model's
  reading chain (componentContext(name).related — same-group neighbors,
  nearest first, design D7). The section root carries data-doc-see-also
  (the skeleton lint's marker) and must hold ≥1 link to another
  /docs/components/*.html page.
-->
<script lang="ts">
  import { componentContext } from '$lib/docs-route-model';
  import { siteChrome } from '$lib/surface/site-chrome.stylex';

  interface Props {
    /** registry item name whose related components are listed */
    name: string;
  }

  let { name }: Props = $props();

  const related = $derived(componentContext(name)?.related ?? []);

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<section data-doc-see-also="" aria-label="see also">
  <h2 class={cx(siteChrome.saTitle)}>See Also</h2>
  {#if related.length > 0}
    <ul class={cx(siteChrome.saList)}>
      {#each related as item (item.entry.name)}
        <li>
          <a
            href={item.entry.href}
            class={cx(siteChrome.saLink)}
          >
            <span class={cx(siteChrome.saName)}>{item.entry.name}</span>
            <span class={cx(siteChrome.saGroup)}>{item.groupLabel}</span>
          </a>
        </li>
      {/each}
    </ul>
  {:else}
    <p class={cx(siteChrome.saEmpty)}>No same-group neighbors yet.</p>
  {/if}
</section>
