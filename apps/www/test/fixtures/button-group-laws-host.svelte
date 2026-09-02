<!--
  button-group-laws-host — test fixture (button-group.spec.ts, r13).
  Hosts the r13 contract surfaces: the group variant context (adopted
  vs explicitly-won), the separator policy matrix (ghost default,
  explicit on/off), and an IconButton adoption pair — each as its own
  named group so one render covers the matrix.
-->
<script lang="ts">
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
</script>

<!-- ghost group: separators on by default; children adopt ghost, the
     explicit outline wins -->
<ButtonGroup label="ghost laws" variant="ghost" data-testid="ghost-group">
  <PressButton>copy</PressButton>
  <PressButton>move</PressButton>
  <PressButton variant="outline">delete</PressButton>
</ButtonGroup>

<!-- the leading seam (r14-13): the ghost cluster opens with its own
     boundary line — the first button's seam pseudo, flush -->
<ButtonGroup label="lead laws" variant="ghost" leadingSeam data-testid="lead-group">
  <PressButton>alpha</PressButton>
  <PressButton>beta</PressButton>
</ButtonGroup>

<!-- leadingSeam without an active seam policy stays off (bordered
     rungs read through the -1px law — an opening line would double) -->
<ButtonGroup label="lead plain" leadingSeam data-testid="lead-plain-group">
  <PressButton>one</PressButton>
  <PressButton>two</PressButton>
</ButtonGroup>

<!-- explicit separators on a bordered group -->
<ButtonGroup label="sep laws" separator data-testid="sep-group">
  <PressButton>alpha</PressButton>
  <PressButton>beta</PressButton>
</ButtonGroup>

<!-- separator={false} overrides the ghost default -->
<ButtonGroup label="no sep" variant="ghost" separator={false} data-testid="nosep-group">
  <PressButton>one</PressButton>
  <PressButton>two</PressButton>
</ButtonGroup>

<!-- bordered group: no separators unless asked -->
<ButtonGroup label="plain" data-testid="plain-group">
  <PressButton>solo</PressButton>
</ButtonGroup>

<!-- the r14-10 regression (Owner: DialogFooter buttons had no seams): a
     group with NO variant of its own under a ghost variant SCOPE
     inherits ghost — the seam policy must follow the EFFECTIVE
     variant, not the local prop alone -->
<ButtonVariantScope variant="ghost">
  <ButtonGroup label="scope inherited" data-testid="scope-ghost-group">
    <PressButton>inherited-a</PressButton>
    <PressButton>inherited-b</PressButton>
  </ButtonGroup>
  <!-- an explicit non-ghost variant shadows the scope AND the seam -->
  <ButtonGroup label="scope shadowed" variant="tonal" data-testid="scope-tonal-group">
    <PressButton>shadow-a</PressButton>
    <PressButton>shadow-b</PressButton>
  </ButtonGroup>
</ButtonVariantScope>

<!-- tonal group: IconButton adoption (iconOnly + text postures) -->
<ButtonGroup label="icon laws" variant="tonal" data-testid="icon-group">
  <IconButton text="move">
    {#snippet icon()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9Z" /></svg>{/snippet}
  </IconButton>
  <IconButton text="delete" variant="fill">
    {#snippet icon()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9Z" /></svg>{/snippet}
  </IconButton>
</ButtonGroup>
