<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { demo } from '../demo.stylex';
  import Icon from '../families/icon/icon.svelte';
</script>

<h1 {...stylex.attrs(demo.title)}>icon — named-glyph renderer</h1>
<p {...stylex.attrs(demo.note)}>
  currentColor painting by artwork nature, square size edge, round caps/joins; the
  reserved box (async path) rides the typed factory idiom. Sizes respond to nothing but
  the size prop — ink follows the CURRENT text color.
</p>

<section {...stylex.attrs(demo.section)} data-icon-section="glyphs">
  <h2 {...stylex.attrs(demo.sectionTitle)}>glyphs × sizes × stroke weights</h2>
  <div {...stylex.attrs(demo.row)} style="font-size:20px;color:var(--primary)" data-icon-row="colors">
    <Icon name="chevronDown" size={16} />
    <Icon name="check" size={24} strokeWidth={2.5} />
    <Icon name="copy" size={13} data-icon="copy" />
    <Icon name="x" size={32} strokeWidth={1.5} />
    <Icon name="check" size={20} pending data-icon="pending" />
  </div>
</section>
