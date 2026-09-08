<!--
  button-bar-host — test fixture (button-bar.spec.ts).
  Hosts the lane's whole context surface: the ghost+flat defaults vs
  the bare contrast, the explicit escape hatches (member and lane
  level), the inherit-then-provide pass-through (both axes), the
  nested joined cluster, and the layout/role faces. The context
  assertions need a real composition — the zone keys are only
  written by the components themselves. PressButton passes no rest
  attrs, so wrapper spans carry the testids (the defaults-buttons
  precedent).
-->
<script lang="ts">
  import ButtonBar from '$lib/ui/button-bar/button-bar.svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<!-- the frozen contrast: outside the lane, outline + convex -->
<span data-testid="outside-bare"><PressButton>outside</PressButton></span>

<!-- the lane's identity: members fall to ghost + flat with zero props -->
<ButtonBar label="identity" data-testid="bar-identity">
  <span data-testid="member-bare"><PressButton>bare</PressButton></span>
  <span data-testid="member-fill"><PressButton variant="fill">fill</PressButton></span>
  <span data-testid="member-raised"><PressButton raised={true}>raised</PressButton></span>
</ButtonBar>

<!-- the lane-level re-rung / re-texture -->
<ButtonBar label="tonal lane" variant="tonal" data-testid="bar-tonal">
  <span data-testid="tonal-member"><PressButton>tonal member</PressButton></span>
</ButtonBar>
<ButtonBar label="convex lane" raised={true} data-testid="bar-convex">
  <span data-testid="convex-member"><PressButton>convex member</PressButton></span>
</ButtonBar>

<!-- inherit-then-provide: an opinion-less lane passes the enclosing
     zone through on BOTH axes (the ButtonVariantScope boundary) -->
<ButtonVariantScope variant="tonal">
  <ButtonBar label="shadowed lane" data-testid="bar-shadowed-variant">
    <span data-testid="shadowed-variant-member"><PressButton>member</PressButton></span>
  </ButtonBar>
</ButtonVariantScope>
<ButtonVariantScope raised={false}>
  <ButtonBar label="flat lane" data-testid="bar-shadowed-texture">
    <span data-testid="shadowed-texture-member"><PressButton>member</PressButton></span>
  </ButtonBar>
</ButtonVariantScope>

<!-- a joined cluster as ONE member: inherits ghost, cluster shadow dark -->
<ButtonBar label="with cluster" data-testid="bar-cluster">
  <span data-testid="cluster-lane-member"><PressButton>copy link</PressButton></span>
  <ButtonGroup label="publish" data-testid="nested-cluster">
    <span data-testid="cluster-member"><PressButton>draft</PressButton></span>
    <span data-testid="cluster-member-2"><PressButton>publish</PressButton></span>
  </ButtonGroup>
</ButtonBar>
<!-- the cluster's own explicit variant still wins over the lane -->
<ButtonBar label="fill cluster lane" data-testid="bar-cluster-fill">
  <ButtonGroup label="actions" variant="fill" data-testid="nested-cluster-fill">
    <span data-testid="cluster-fill-member"><PressButton>go</PressButton></span>
  </ButtonGroup>
</ButtonBar>

<!-- layout faces: vertical, between, density provide, role override -->
<ButtonBar orientation="vertical" label="stack" data-testid="bar-vertical">
  <span data-testid="vertical-member"><PressButton>one</PressButton></span>
  <PressButton>two</PressButton>
</ButtonBar>
<ButtonBar justify="between" label="spread" data-testid="bar-between">
  <PressButton>left note</PressButton>
  <PressButton>right action</PressButton>
</ButtonBar>
<ButtonBar label="dense" density="sm" data-testid="bar-dense">
  <span data-testid="dense-member"><PressButton>dense</PressButton></span>
</ButtonBar>
<ButtonBar role="toolbar" label="tools" aria-label="real tools" data-testid="bar-role">
  <PressButton>tool</PressButton>
</ButtonBar>
