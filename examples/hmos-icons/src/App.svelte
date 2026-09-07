<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from './ui/icon';
  import { getIcon, preloadIcons, type IconName } from '$lib/icon-set.gen';

  // per-row provenance (hand-curated). The PREVIEW column below keeps
  // STATIC name literals — that is the scan surface: the plugin's
  // scanner collects them from this source and packs the artwork
  const ROWS: readonly { name: IconName; channel: string; source: string }[] = [
    ...[
      'hmos:ic_public_pause',
      'hmos:ic_public_themes',
      'hmos:ic_public_appstore',
      'hmos:ic_device_watch_fit_filled',
      'hmos:ic_public_calendar',
      'hmos:ic_public_security',
      'hmos:ic_public_voice',
      'hmos:ic_public_drawer_filled',
      'hmos:ic_contacts_calllog_doubleline_2',
      'hmos:ic_public_switch_camera',
    ].map(
      (name): { name: IconName; channel: string; source: string } => ({
        name: name as IconName,
        channel: 'hmos: (custom channel)',
        source: `icons/${(name as string).slice('hmos:'.length)}.svg`,
      }),
    ),
    {
      name: 'editGroup' as IconName,
      channel: 'config lane → hmos:',
      source: 'icons/ic_Edit Group_filled.svg (space in filename)',
    },
    {
      name: 'lucide:check' as IconName,
      channel: 'lucide: (default-registered)',
      source: 'built-in set — deduped to check',
    },
  ];

  // which names answered getIcon() BEFORE any load: the inline-core
  // chunk (SSR paints these synchronously). The lazy-chunk names fill
  // in after preloadIcons — captured once, at init, honestly
  const inlineCore = new Set<string>(
    ROWS.filter((row) => getIcon(row.name) !== null).map((row) => row.name),
  );

  let hydrated = $state(false);
  onMount(async () => {
    await preloadIcons(ROWS.map((row) => row.name));
    hydrated = true;
  });

  // reads `hydrated` so the derived cells re-render once the lazy
  // chunk lands; inline-core rows have data either way
  const dataOf = (name: IconName) =>
    hydrated || inlineCore.has(name) ? getIcon(name) : undefined;
</script>

<main>
  <h1>hmos:* — a third-party channel over local svgs</h1>
  <p>
    One <code>defineIconChannel</code> call fronts the HarmonyOS subset in
    <code>icons/</code>; lucide rides beside it as the default channel. The
    default 20 KiB budget splits the set: rows marked
    <em>lazy chunk</em> resolve after hydration, the rest paint
    synchronously.
  </p>

  <table>
    <thead>
      <tr>
        <th>preview</th>
        <th>name</th>
        <th>channel</th>
        <th>source</th>
        <th>nature</th>
        <th>viewBox</th>
        <th>payload</th>
        <th>loading</th>
      </tr>
    </thead>
    <tbody>
      <!-- prettier-ignore -->
      {#snippet cells(name: IconName, channel: string, source: string)}
        <td><code>{name}</code></td>
        <td>{channel}</td>
        <td>{source}</td>
        <td>{dataOf(name)?.n ?? '…'}</td>
        <td>{dataOf(name)?.v ?? '…'}</td>
        <td>{dataOf(name) ? `${dataOf(name)!.d.length} chars` : '…'}</td>
        <td>{inlineCore.has(name) ? 'inline core (sync)' : 'lazy chunk 1'}</td>
      {/snippet}
      <tr>
        <td class="preview"><Icon name="hmos:ic_public_pause" size={24} /></td>
        {@render cells('hmos:ic_public_pause', 'hmos: (custom channel)', 'icons/ic_public_pause.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_public_themes" size={24} /></td>
        {@render cells('hmos:ic_public_themes', 'hmos: (custom channel)', 'icons/ic_public_themes.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_public_appstore" size={24} /></td>
        {@render cells('hmos:ic_public_appstore', 'hmos: (custom channel)', 'icons/ic_public_appstore.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_device_watch_fit_filled" size={24} /></td>
        {@render cells('hmos:ic_device_watch_fit_filled', 'hmos: (custom channel)', 'icons/ic_device_watch_fit_filled.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_public_calendar" size={24} /></td>
        {@render cells('hmos:ic_public_calendar', 'hmos: (custom channel)', 'icons/ic_public_calendar.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_public_security" size={24} /></td>
        {@render cells('hmos:ic_public_security', 'hmos: (custom channel)', 'icons/ic_public_security.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_public_voice" size={24} /></td>
        {@render cells('hmos:ic_public_voice', 'hmos: (custom channel)', 'icons/ic_public_voice.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_public_drawer_filled" size={24} /></td>
        {@render cells('hmos:ic_public_drawer_filled', 'hmos: (custom channel)', 'icons/ic_public_drawer_filled.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_contacts_calllog_doubleline_2" size={24} /></td>
        {@render cells('hmos:ic_contacts_calllog_doubleline_2', 'hmos: (custom channel)', 'icons/ic_contacts_calllog_doubleline_2.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="hmos:ic_public_switch_camera" size={24} /></td>
        {@render cells('hmos:ic_public_switch_camera', 'hmos: (custom channel)', 'icons/ic_public_switch_camera.svg')}
      </tr>
      <tr>
        <td class="preview"><Icon name="editGroup" size={24} /></td>
        {@render cells('editGroup', 'config lane → hmos:', 'icons/ic_Edit Group_filled.svg (space in filename)')}
      </tr>
      <tr>
        <td class="preview"><Icon name="lucide:check" size={24} /></td>
        {@render cells('lucide:check', 'lucide: (default-registered)', 'built-in set — deduped to check')}
      </tr>
    </tbody>
  </table>
</main>

<style>
  main {
    font-family: ui-sans-serif, system-ui, sans-serif;
    max-width: 60rem;
    margin: 2rem auto;
    padding: 0 1rem;
    color: #1a1a1a;
  }
  h1 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
  p {
    color: #555;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.85rem;
  }
  th,
  td {
    border: 1px solid #ddd;
    padding: 0.4rem 0.6rem;
    text-align: left;
    vertical-align: middle;
  }
  th {
    background: #f5f5f5;
    font-weight: 600;
    white-space: nowrap;
  }
  td.preview {
    text-align: center;
    width: 3rem;
    color: #333;
  }
  td code,
  td:nth-child(4) {
    font-family: ui-monospace, monospace;
    font-size: 0.78rem;
    white-space: nowrap;
  }
  td:last-child {
    white-space: nowrap;
    color: #555;
  }
</style>
