<!--
  jixoai pattern-pricing (registry/files/ui/pattern-pricing/
  pattern-pricing.svelte, 2026-08-30, openspec 2026-08-30-terminal-patterns).
  The `$ plan --compare` pricing section — a composition product: the
  matrix rides the Table family (consumer authors thead/tbody in the
  children snippet — same contract as the bare Table), each tier's
  install command rides a CodeCard, the plan labels ride Badge, and
  the copy action rides PressButton. The recommended tier is a paint
  LAW, not a prop fork: consumer cells opt the column in with
  data-jx-recommended on the th AND its td's (pattern css paints the
  brand rules + tinted head inside @layer components — hover law
  intact), and the recommended CARD takes the border-primary rung in
  markup.

  Composition-only laws (terminal-patterns delta): no atom prop is
  patched, no atom paint re-implemented; commands/labels are
  value-domain payload (code strings), the matrix rows stay authored
  content.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { icons } from '$lib/icons';
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Table from '$lib/ui/table/table.svelte';
  import './pattern-pricing.css';

  /** one tier's install strip — commands are payload, cards are paint */
  export interface PricingTier {
    /** the plan label (badge + aria name of the copy control) */
    plan: string;
    /** the copyable install command (the card's code payload) */
    command: string;
    /** brand-hue paint on the tier card; pair with the table column opt-in */
    recommended?: boolean;
    /** muted qualifier under the plan label (e.g. 'per seat / month') */
    note?: string;
  }

  interface Props {
    /** the section's mono eyebrow line */
    eyebrow?: string;
    /** the Table caption (the matrix's visible title) */
    caption?: string;
    /** per-tier install cards; commands are copy payload */
    tiers: readonly PricingTier[];
    /** the comparison matrix: author thead/tbody here (Table contract);
     *  recommended cells opt in with data-jx-recommended */
    children: Snippet;
    class?: string;
  }

  let {
    eyebrow = '$ plan --compare',
    caption = 'plans — feature matrix',
    tiers,
    children,
    class: className = '',
  }: Props = $props();

  /** the plan whose command was just copied ('' = none) */
  let copiedPlan = $state('');
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function copyTierCommand(tier: PricingTier): Promise<void> {
    try {
      await navigator.clipboard.writeText(tier.command);
    } catch {
      // preview servers / embedded contexts without a clipboard grant
      const area = document.createElement('textarea');
      area.value = tier.command;
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copiedPlan = tier.plan;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copiedPlan = ''), 1400);
  }
</script>

<section data-jx-pattern-pricing="" class={`jx-pattern-pricing w-full ${className}`}>
  <p class="m-0 font-nav text-[11px] uppercase tracking-[0.24em] text-primary">{eyebrow}</p>

  <div class="mt-4">
    <Table {caption}>
      {@render children()}
    </Table>
  </div>

  <div
    class="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]"
  >
    {#each tiers as tier (tier.plan)}
      <div
        data-jx-pattern-pricing-tier={tier.recommended ? 'recommended' : 'standard'}
        class={`flex flex-col gap-3 border bg-card p-3 rounded-(--radius) ${
          tier.recommended ? 'border-primary' : 'border-border'
        }`}
      >
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <Badge variant={tier.recommended ? 'fill' : 'outline'}>{tier.plan}</Badge>
          {#if tier.note}
            <span class="font-nav text-[11px] tracking-[0.08em] text-muted-foreground">{tier.note}</span>
          {/if}
        </div>
        <CodeCard lang="bash" code={tier.command} copyable={false} class="min-w-0">
          {#snippet footer()}
            <PressButton
              variant={tier.recommended ? 'fill' : 'ghost'}
              onclick={() => copyTierCommand(tier)}
              ariaLabel={`${copiedPlan === tier.plan ? 'copied' : 'copy'} ${tier.command}`}
            >
              {#if copiedPlan === tier.plan}
                <span class="inline-flex [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:stroke-[2.5]">{@html icons.check}</span>
                <span>copied</span>
              {:else}
                <span class="inline-flex [&_svg]:h-3.5 [&_svg]:w-3.5">{@html icons.copy}</span>
                <span>copy add command</span>
              {/if}
            </PressButton>
          {/snippet}
        </CodeCard>
      </div>
    {/each}
  </div>
</section>
