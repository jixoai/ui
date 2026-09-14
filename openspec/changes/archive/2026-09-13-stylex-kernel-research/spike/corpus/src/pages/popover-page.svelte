<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { demo } from '../demo.stylex';
  import Popover from '../families/popover/popover.svelte';
</script>

<h1 {...stylex.attrs(demo.title)}>popover — floating-surface kernel</h1>
<p {...stylex.attrs(demo.note)}>
  Native Popover API + CSS Anchor Positioning (geometry rides the css residue); trigger,
  caret, surface body (acrylic/solid variants), and scroll ring are StyleX. Open one —
  the caret flips, the panel anchors under the trigger with flip fallbacks.
</p>

<section {...stylex.attrs(demo.section)} data-pop-section="basic">
  <h2 {...stylex.attrs(demo.sectionTitle)}>anchored panel (bottom-end, auto surface)</h2>
  <!-- right-aligned row: bottom-end's right-edge-flush placement fits
       the viewport WITHOUT the position-try flip chain engaging -->
  <div {...stylex.attrs(demo.row)} style="justify-content:flex-end">
    <Popover id="pop-demo" triggerLabel="options">
      <div {...stylex.attrs(demo.note)}>
        The panel body carries the variant fill; the shadow child carries the fixed
        backdrop treatment. Light-dismiss and Escape are the platform's.
      </div>
    </Popover>
  </div>
</section>
