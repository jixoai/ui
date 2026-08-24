<!-- breadcrumb blueprint: a trail with the middle collapsed. -->
<script lang="ts">
  import Breadcrumb from '$lib/ui/breadcrumb/breadcrumb.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <Breadcrumb
    collapse={4}
    crumbs={[
      { href: '/', label: 'ui.jixoai.com' },
      { href: '/components/overview.html', label: 'components' },
      { href: '/components/form.html', label: 'data entry' },
      { href: '/components/form.html#example-form', label: 'checkbox' },
    ]}
  />
</div>
