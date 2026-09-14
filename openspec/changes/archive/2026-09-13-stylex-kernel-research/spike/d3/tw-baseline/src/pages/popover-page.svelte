<script lang="ts">
  import Popover from '../ui/popover/index.ts';
</script>

<h1 class="text-lg font-semibold mb-2">popover — floating-surface kernel</h1>
<p class="text-muted-foreground mb-4 max-w-prose">
  The TW form: native Popover API + inline anchor wiring; the surface kernel rides the
  theme sheet; light-dismiss and Escape are the platform's.
</p>

<section data-pop-section="basic" class="mb-4">
  <h2 class="mb-2">bottom-end surface</h2>
  <div class="flex gap-4">
    <Popover id="pop-demo" triggerLabel="options">
      <div class="text-muted-foreground">
        The panel body carries the variant fill; the shadow child carries the fixed backdrop
        treatment.
      </div>
    </Popover>
  </div>
</section>
