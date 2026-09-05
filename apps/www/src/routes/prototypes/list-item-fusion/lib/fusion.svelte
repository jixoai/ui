<!--
  FUSION — the single list-item fusion prototype (2026-09-05).
  Owner rulings baked in: (1) auto-stack — narrow lists fold label
  above control with zero opt-in; (2) input-group mind — the row keeps
  the border, in-row controls dissolve theirs (placeholder + suffix
  icons are the anchors); (3) one refined prototype instead of a
  strategy picker. Ambient chrome inheritance rides the production
  paint zone (the Events group goes quiet without touching call
  sites); density flows from the group provider as shipped.
-->
<script lang="ts">
  import './fusion.css';
  import Section from './section.svelte';
  import Zone from './zone.svelte';
  import { notifRows, members, events, tagSuggestions } from './matrix.svelte.ts';
  import { Item, ItemGroup, ItemContent, ItemTitle, ItemDescription, ItemMedia, ItemEnd, ItemAfter, ItemChevron, ItemToggle, ItemSelect, ItemInput, ItemCheckbox } from '$lib/ui/list-item';
  import Badge from '$lib/ui/badge/badge.svelte';
  import Chip from '$lib/ui/chip/chip.svelte';
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import Spin from '$lib/ui/spin/spin.svelte';
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
  import BadgeIndicator from '$lib/ui/badge-indicator/badge-indicator.svelte';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { ItemActions } from '$lib/ui/list-item';
  import Input from '$lib/ui/input/input.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';
  import TagsInput from '$lib/ui/tags-input/tags-input.svelte';
  import Range from '$lib/ui/range/range.svelte';
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import Progress from '$lib/ui/progress/progress.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';

  let mentions = $state(true);
  let frequency = $state('Instantly');
  let smsRoute = $state(false);
  let address = $state('ops@jixoai.dev');
  let retention = $state(30);
  let layout = $state('grid');
  let storage = $state(0.62);
  let labels = $state<string[]>(['urgent', 'flaky']);
</script>

<div class="fusion">
  <Section title="Form rows" hint="Controls ride the row bare — placeholder and suffix icons are the anchors; the group frame is the one border.">
    <ItemGroup label="Delivery">
      <ItemToggle label={notifRows[0].label} description={notifRows[0].description} bind:checked={mentions} />
      <ItemSelect fit="lg" label={notifRows[1].label} description={notifRows[1].description} bind:value={frequency}>
        <option>Instantly</option>
        <option>Daily digest</option>
        <option>Off</option>
      </ItemSelect>
      <ItemCheckbox label={notifRows[2].label} description={notifRows[2].description} bind:checked={smsRoute} />
      <ItemInput fit="lg" label={notifRows[3].label} description={notifRows[3].description} bind:value={address} placeholder="you@workspace.dev" />
      <ItemInput type="number" fit="md" label={notifRows[4].label} description={notifRows[4].description} bind:value={retention} />
    </ItemGroup>
  </Section>

  <Section title="Feedback inline" hint="Inline stamps (kbd · code · badge) ride the content flow; media rows need the group's media ruler; two skeleton rows simulate loading.">
    <ItemGroup mode="muted" label="Signals" ruler="media-content-end">
      <Item>
        <ItemContent>
          <ItemTitle>Keyboard-first triage <Kbd>⌘K</Kbd> opens the palette</ItemTitle>
          <ItemDescription>Bind <InlineCode>jx notify --on</InlineCode> per repo, then forget the settings page.</ItemDescription>
        </ItemContent>
        <ItemEnd wrap="never"><Badge>beta</Badge></ItemEnd>
      </Item>
      <Item>
        <ItemContent>
          <ItemTitle>Mirror to cold storage</ItemTitle>
          <ItemDescription>Artifacts replicate to the glacier bucket.</ItemDescription>
        </ItemContent>
        <ItemEnd wrap="never"><Spin label="syncing" /><ItemAfter>syncing</ItemAfter></ItemEnd>
      </Item>
      <Item>
        <ItemContent>
          <ItemTitle>Storage</ItemTitle>
          <ItemDescription>62% of the 20 GB tier used</ItemDescription>
          <Progress value={storage} />
        </ItemContent>
      </Item>
      {#each [0, 1] as i (i)}
        <Item>
          <ItemMedia><Skeleton class="size-8 rounded-sm" /></ItemMedia>
          <ItemContent>
            <ItemTitle><Skeleton class="h-3.5 w-40" /></ItemTitle>
            <ItemDescription><Skeleton class="h-3 w-56" /></ItemDescription>
          </ItemContent>
          <ItemEnd wrap="never"><Skeleton class="h-3.5 w-10" /></ItemEnd>
        </Item>
      {/each}
      <Item>
        <ItemMedia><Avatar name={members[0].name} /></ItemMedia>
        <ItemContent>
          <ItemTitle>{members[0].name}</ItemTitle>
          <ItemDescription>Unread mentions on three threads</ItemDescription>
        </ItemContent>
        <ItemEnd wrap="never">
          <BadgeIndicator count={3} label="3 unread mentions">
            <IconButton iconOnly text="Open mentions">
              {#snippet icon()}<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 2a3 3 0 0 0-3 3v2L3.5 10v1.5h9V10L11 7V5a3 3 0 0 0-3-3ZM6.5 13a1.5 1.5 0 0 0 3 0" /></svg>{/snippet}
            </IconButton>
          </BadgeIndicator>
        </ItemEnd>
      </Item>
    </ItemGroup>
  </Section>

  <Section title="Action rows" hint="A ghost paint zone quiets every press control in the subtree — no call site changed; explicit variant still wins (Rerun stays solid).">
    <Zone variant="ghost">
      <ItemGroup label="Events">
        {#each events as ev (ev.title)}
          <Item>
            <ItemContent>
              <ItemTitle>{ev.title}</ItemTitle>
              <ItemDescription>{ev.meta}</ItemDescription>
            </ItemContent>
            <ItemEnd wrap="never">
              {#if ev.when === 'now'}
                <Spin label="running" />
              {:else}
                <IconButton iconOnly text="Rerun workflow">
                  {#snippet icon()}<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" /></svg>{/snippet}
                </IconButton>
              {/if}
              {#if ev.meta.startsWith('failed')}
                <PressButton variant="tonal">Rerun</PressButton>
              {/if}
              <ItemAfter>{ev.when}</ItemAfter>
            </ItemEnd>
          </Item>
        {/each}
        <Item>
          <ItemContent>
            <ItemTitle>Default layout</ItemTitle>
            <ItemDescription>Applies to new triage boards</ItemDescription>
          </ItemContent>
          <ItemEnd fit="md">
            <ToggleGroup type="single" name="layout" label="Layout" bind:value={layout}>
              <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
              <ToggleGroupItem value="list">List</ToggleGroupItem>
            </ToggleGroup>
          </ItemEnd>
        </Item>
        <Item href="#fusion-log">
          <ItemContent>
            <ItemTitle>View full audit log</ItemTitle>
            <ItemDescription>Every routing decision, with actors</ItemDescription>
          </ItemContent>
          <ItemEnd wrap="never"><ItemChevron /></ItemEnd>
        </Item>
        <Item>
          <ItemContent>
            <ItemTitle>Escalation actions</ItemTitle>
            <ItemDescription>Joined clusters ride the lane — seams and radius belong to the cluster, the lane only gives gap and alignment</ItemDescription>
          </ItemContent>
          <ItemActions label="Escalation actions">
            <PressButton>Acknowledge</PressButton>
            <PressButton>Snooze</PressButton>
            <PressButton>Escalate</PressButton>
          </ItemActions>
        </Item>
        <Item>
          <ItemContent>
            <ItemTitle>Quick triage</ItemTitle>
            <ItemDescription>A control cluster beside a free control — two independent surfaces</ItemDescription>
          </ItemContent>
          <ItemEnd wrap="never">
            <PressButton>Merge</PressButton>
            <PressButton>Close</PressButton>
            <IconButton iconOnly text="More options">
              {#snippet icon()}<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="3" cy="8" r="1" /><circle cx="8" cy="8" r="1" /><circle cx="13" cy="8" r="1" /></svg>{/snippet}
            </IconButton>
          </ItemEnd>
        </Item>
      </ItemGroup>
    </Zone>
  </Section>

  <Section title="Identity and media" hint="Avatar media in the group's image track; role stamps and chevron share the end lane.">
    <ItemGroup label="Members" ruler="media-content-end">
      {#each members as m (m.handle)}
        <Item href="#fusion-member">
          <ItemMedia><Avatar name={m.name} /></ItemMedia>
          <ItemContent>
            <ItemTitle>{m.name} <Kbd>{m.handle}</Kbd></ItemTitle>
            <ItemDescription>Last active 2h ago · owns <InlineCode>infra/*</InlineCode></ItemDescription>
          </ItemContent>
          <ItemEnd wrap="never">
            {#if m.role === 'Owner'}<Badge>{m.role}</Badge>{:else}<Chip>{m.role}</Chip>{/if}
            <ItemChevron />
          </ItemEnd>
        </Item>
      {/each}
    </ItemGroup>
  </Section>

  <Section title="Context matrix" hint="Group modes × selected/link × density — one surface, six readings.">
    <div class="fusion-context">
      <ItemGroup label="Default group">
        <Item selected>
          <ItemContent><ItemTitle>Selected row</ItemTitle><ItemDescription>Carries the inset primary edge</ItemDescription></ItemContent>
          <ItemEnd wrap="never"><Badge>current</Badge></ItemEnd>
        </Item>
        <Item href="#fusion-link">
          <ItemContent><ItemTitle>Link row</ItemTitle><ItemDescription>Whole-row anchor with hover paint</ItemDescription></ItemContent>
          <ItemEnd wrap="never"><ItemChevron /></ItemEnd>
        </Item>
      </ItemGroup>
      <ItemGroup mode="muted" label="Muted group">
        <Item selected>
          <ItemContent><ItemTitle>Selected in muted</ItemTitle><ItemDescription>No frame, slab chrome</ItemDescription></ItemContent>
          <ItemEnd wrap="never"><Spin label="working" /></ItemEnd>
        </Item>
        <Item>
          <ItemContent><ItemTitle>Digest detail</ItemTitle><ItemDescription>Twelve items per section</ItemDescription></ItemContent>
          <ItemEnd wrap="never"><ItemAfter>12 items</ItemAfter></ItemEnd>
        </Item>
      </ItemGroup>
      <ItemGroup mode="plain" label="Plain group">
        <Item>
          <ItemContent><ItemTitle>Host-owned chrome</ItemTitle><ItemDescription>Plain mode paints nothing itself</ItemDescription></ItemContent>
          <ItemEnd wrap="never"><Badge>raw</Badge></ItemEnd>
        </Item>
      </ItemGroup>
      <ItemGroup density="sm" label="Density sm">
        <ItemToggle label="Compact toggles" description="Density flows from the group provider" bind:checked={smsRoute} />
        <Item>
          <ItemContent><ItemTitle>Compact row</ItemTitle><ItemDescription>Kbd still aligns <Kbd>⇧A</Kbd></ItemDescription></ItemContent>
          <ItemEnd wrap="never"><ItemAfter>sm</ItemAfter></ItemEnd>
        </Item>
      </ItemGroup>
    </div>
  </Section>

  <Section title="Size ladder" hint="Declared at composition time, the way responsive dev declares md:/lg: — fixed lanes (toggle/checkbox/badge) never restack; md steps 10rem → 7rem → full; lg steps 16rem → 11rem → full; full is always 100%. Same rows in 36rem / 24rem / 17rem panes.">
    <div class="fusion-ladder">
      {#each [['36rem pane — mid tier: ladders stepped down, still one row', 'fusion-pane-mid'], ['24rem pane — narrow tier: declared lanes stack, fixed lanes stay inline', 'fusion-pane-mid2'], ['17rem pane — same laws, tighter', 'fusion-narrow']] as [caption, paneClass] (caption)}
        <div>
          <p class="p-ladder-caption">{caption}</p>
          <div class={paneClass}>
            <ItemGroup label="Controls">
              <ItemToggle label="Sync over cellular" description="Fixed size — never folds" bind:checked={mentions} />
              <ItemCheckbox label="Include prereleases" description="Fixed size — never folds" bind:checked={smsRoute} />
              <Item>
                <ItemContent><ItemTitle>Timeout</ItemTitle><ItemDescription>md ladder — number-class control</ItemDescription></ItemContent>
                <ItemEnd fit="md"><Input type="number" bind:value={retention} aria-label="Timeout seconds" /></ItemEnd>
              </Item>
              <Item>
                <ItemContent><ItemTitle>Channel</ItemTitle><ItemDescription>lg ladder — select can be either class; this one is long</ItemDescription></ItemContent>
                <ItemEnd fit="lg">
                  <NativeSelect bind:value={frequency} aria-label="Channel">
                    <option>Instantly</option>
                    <option>Daily digest</option>
                    <option>Weekly rollup</option>
                  </NativeSelect>
                </ItemEnd>
              </Item>
              <Item>
                <ItemContent><ItemTitle>Webhook URL</ItemTitle><ItemDescription>lg ladder — text-class control</ItemDescription></ItemContent>
                <ItemEnd fit="lg"><Input bind:value={address} placeholder="https://" aria-label="Webhook URL" /></ItemEnd>
              </Item>
              <Item>
                <ItemContent><ItemTitle>Labels</ItemTitle><ItemDescription>full — greedy by nature</ItemDescription></ItemContent>
                <ItemEnd fit="full">
                  <TagsInput bind:tags={labels} suggestions={tagSuggestions} placeholder="Add label" />
                </ItemEnd>
              </Item>
            </ItemGroup>
          </div>
        </div>
      {/each}
    </div>
  </Section>
</div>
