<!--
  Props-discipline passthrough host (props-discipline sweep, 2026-08-25).
  Composes the five representative family parts with consumer attributes
  (id, data-testid, data-*, class) so composition-props.spec.ts can pin
  the standing contract: every part's root element accepts them verbatim.
-->
<script lang="ts">
  import Steps from '../../src/lib/ui/steps/steps.svelte';
  import StepsItem from '../../src/lib/ui/steps/steps-item.svelte';
  import BreadcrumbList from '../../src/lib/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '../../src/lib/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '../../src/lib/ui/breadcrumb/breadcrumb-link.svelte';
  import ToggleGroup from '../../src/lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '../../src/lib/ui/toggle-group/toggle-group-item.svelte';
  import AlertDialog from '../../src/lib/ui/alert-dialog/alert-dialog.svelte';
  import AlertDialogTitle from '../../src/lib/ui/alert-dialog/alert-dialog-title.svelte';
  import Command from '../../src/lib/ui/command/command.svelte';
  import CommandItem from '../../src/lib/ui/command/command-item.svelte';
</script>

<Steps current={0}>
  <StepsItem
    step={0}
    label="first"
    id="probe-steps-item"
    data-testid="steps-item-probe"
    data-probe-kind="steps"
    class="probe-extra"
  >first</StepsItem>
</Steps>

<BreadcrumbList>
  <BreadcrumbItem>
    <BreadcrumbLink
      href="/probe"
      id="probe-breadcrumb-link"
      data-testid="breadcrumb-link-probe"
      data-probe-kind="breadcrumb"
      class="probe-extra"
    >trail</BreadcrumbLink>
  </BreadcrumbItem>
</BreadcrumbList>

<ToggleGroup name="probe" label="probe">
  <ToggleGroupItem
    value="a"
    id="probe-toggle-item"
    data-testid="toggle-item-probe"
    data-probe-kind="toggle"
    class="probe-extra"
  >one</ToggleGroupItem>
</ToggleGroup>

<AlertDialog>
  <AlertDialogTitle
    data-testid="adlg-title-probe"
    data-probe-kind="alert-dialog"
    class="probe-extra"
  >probe title</AlertDialogTitle>
</AlertDialog>

<Command>
  <CommandItem
    label="probe command"
    id="consumer-clobber-attempt"
    data-testid="command-item-probe"
    data-probe-kind="command"
    class="probe-extra"
  />
</Command>
