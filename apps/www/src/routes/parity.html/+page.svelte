<!--
  The native-parity fixture page (native-contract-fusion Phase 6,
  2026-08-27): every vocabulary row rendered TWICE — tier0 (the bare
  DOM the jx-pure law paints) beside tier1 (the registry component) —
  under identical density/darkness. scripts/verify-native-parity.mjs
  probes both sides' computed styles across the state matrix and
  fails on drift. Not linked from any navigation; a gate surface.
-->
<script lang="ts">
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
  import Radio from '$lib/ui/radio/radio.svelte';
  import Toggle from '$lib/ui/toggle/toggle.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import Textarea from '$lib/ui/textarea/textarea.svelte';

  // the radio state channel is bind:group (the radio component's law)
  let radioGroup = $state('a');
</script>

<svelte:head>
  <title>native parity fixtures</title>
</svelte:head>

<main class="flex flex-col gap-10 p-10">
  <!-- row: toggle-group — both renderers consume the SAME Part A law
       (.jx-tgroup), so parity here guards against component-side
       overrides ever creeping in -->
  <section data-parity="toggle-group" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-html-tgroup" role="radiogroup" aria-label="parity tgroup">
        <label><input type="radio" name="parity-tg-0" value="a" checked /><span>a</span></label>
        <label><input type="radio" name="parity-tg-0" value="b" /><span>b</span></label>
        <label><input type="radio" name="parity-tg-0" value="c" disabled /><span>c</span></label>
      </div>
    </div>
    <div data-renderer="tier1" data-density="default">
      <ToggleGroup name="parity-tg-1" label="parity tgroup" type="single" value="a">
        <ToggleGroupItem value="a">a</ToggleGroupItem>
        <ToggleGroupItem value="b">b</ToggleGroupItem>
        <ToggleGroupItem value="c" disabled>c</ToggleGroupItem>
      </ToggleGroup>
    </div>
  </section>

  <!-- row: native-select — tier0 is the BARE select under the .jx-pure
       face (B4's select law); tier1 is the component's @apply mirror
       sheet OUTSIDE the face (isolated mirror paint). The chevron
       (token-gradient pseudo vs inline SVG) is a visual-oracle matter,
       not computed parity. -->
  <section data-parity="native-select" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-pure">
        <select data-probe="select">
          <option value="a">alpha</option>
          <option value="b">beta</option>
        </select>
      </div>
    </div>
    <div data-renderer="tier1" data-density="default">
      <NativeSelect name="parity-select">
        <option value="a">alpha</option>
        <option value="b">beta</option>
      </NativeSelect>
    </div>
  </section>

  <!-- row: select-multi — the LISTBOX posture regression lock (Codex
       r2 P0): tier0 is the bare select[multiple] under the face;
       tier1 is the utility class consumed directly (the component
       posture, no face scope). In Chromium the @supports chevron
       gate HOLDS, so the listbox override must still win:
       background-image: none, cursor: default, min-height 5.75rem. -->
  <section data-parity="select-multi" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-pure">
        <select data-probe="select-multi" multiple>
          <option value="a">alpha</option>
          <option value="b">beta</option>
        </select>
      </div>
    </div>
    <div data-renderer="tier1" data-density="default">
      <select class="jx-html-select" multiple>
        <option value="a">alpha</option>
        <option value="b">beta</option>
      </select>
    </div>
  </section>

  <!-- row: checkbox — tier0 is the bare input under the face (B5's
       checkbox law); tier1 is the component's .jx-checkbox mirror.
       Pseudo-glyph builds are screenshot-oracle territory. -->
  <section data-parity="checkbox" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-pure flex items-center gap-2">
        <input type="checkbox" data-probe="check" checked />
        <input type="checkbox" data-probe="check-off" />
        <input type="checkbox" data-probe="check-disabled" disabled checked />
      </div>
    </div>
    <div data-renderer="tier1" data-density="default" class="flex items-center gap-2">
      <Checkbox checked />
      <Checkbox />
      <Checkbox checked disabled />
    </div>
  </section>

  <!-- row: radio — B5's radio law ⇄ the .jx-radio mirror -->
  <section data-parity="radio" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-pure flex items-center gap-2">
        <input type="radio" name="parity-radio-0" data-probe="dot" checked />
        <input type="radio" name="parity-radio-0" data-probe="dot-off" />
      </div>
    </div>
    <div data-renderer="tier1" data-density="default" class="flex items-center gap-2">
      <Radio label="a" name="parity-radio-1" value="a" bind:group={radioGroup} />
      <Radio label="b" name="parity-radio-1" value="b" bind:group={radioGroup} />
    </div>
  </section>

  <!-- row: toggle — B13's switch law (input[role=switch] under the
       face) ⇄ the component's sr-hidden driver + track mirror -->
  <section data-parity="toggle" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-pure">
        <input type="checkbox" role="switch" data-probe="switch" checked />
      </div>
    </div>
    <div data-renderer="tier1" data-density="default">
      <Toggle checked label="on" />
    </div>
  </section>

  <!-- matrix variants: same laws under xs density and dark theme —
       row ids carry an @variant suffix; the gate maps them to the
       base row's probe spec -->
  <!-- row: input — tier0 is Part A's single-box posture (.jx-control on
       the bare input); tier1 is the component's shell+lane (the wrapper
       posture). The box law must compute identically on both owners. -->
  <section data-parity="input" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <input class="jx-control" data-probe="box" value="static.html" />
    </div>
    <div data-renderer="tier1" data-density="default" class="w-40">
      <Input label="page" value="static.html" />
    </div>
  </section>

  <!-- row: textarea — tier0 is the bare textarea under the face (B4);
       tier1 the component's shell (the box owner) -->
  <section data-parity="textarea" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-pure">
        <textarea data-probe="box" rows="3">alpha</textarea>
      </div>
    </div>
    <div data-renderer="tier1" data-density="default" class="w-40">
      <Textarea label="notes" rows={3} value="alpha" />
    </div>
  </section>

  <section data-parity="native-select@lg" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="lg">
      <div class="jx-pure">
        <select data-probe="select">
          <option value="a">alpha</option>
        </select>
      </div>
    </div>
    <div data-renderer="tier1" data-density="lg">
      <NativeSelect name="parity-select-lg" density="lg">
        <option value="a">alpha</option>
      </NativeSelect>
    </div>
  </section>

  <section data-parity="checkbox@xs" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="xs">
      <div class="jx-pure flex items-center gap-2">
        <input type="checkbox" data-probe="check" checked />
        <input type="checkbox" data-probe="check-off" />
      </div>
    </div>
    <div data-renderer="tier1" data-density="xs" class="flex items-center gap-2">
      <Checkbox checked density="xs" />
      <Checkbox density="xs" />
    </div>
  </section>

  <section data-parity="checkbox@dark" class="dark flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-pure flex items-center gap-2">
        <input type="checkbox" data-probe="check" checked />
        <input type="checkbox" data-probe="check-off" />
      </div>
    </div>
    <div data-renderer="tier1" data-density="default" class="flex items-center gap-2">
      <Checkbox checked />
      <Checkbox />
    </div>
  </section>
</main>
