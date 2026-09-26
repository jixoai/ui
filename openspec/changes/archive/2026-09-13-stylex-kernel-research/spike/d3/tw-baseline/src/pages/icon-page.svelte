<script lang="ts">
  import Icon from '../ui/icon/index.ts';
</script>

<h1 class="text-lg font-semibold mb-2">icon — the carrier hierarchy</h1>
<p class="text-muted-foreground mb-4 max-w-prose">
  The TW form: inline SVG carrier, factory sizing, reserved box for pending glyphs.
</p>

<section data-icon-section="set" class="mb-4">
  <h2 class="mb-2">a pinned glyph set</h2>
  <div class="flex flex-wrap items-center gap-4" data-icon-row="set">
    <Icon name="chevronDown" size={16} />
    <Icon name="check" size={24} strokeWidth={2.5} />
    <Icon name="copy" size={13} data-icon="copy" />
    <Icon name="x" size={32} strokeWidth={1.5} />
    <Icon name="check" size={20} pending data-icon="pending" />
  </div>
</section>
