<!-- breadcrumb blueprint: a composed trail with a collapsed middle
     (the fold opts in by nesting BreadcrumbCollapse around it). -->
<script lang="ts">
  import Breadcrumb from '$lib/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '$lib/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '$lib/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '$lib/ui/breadcrumb/breadcrumb-link.svelte';
  import BreadcrumbPage from '$lib/ui/breadcrumb/breadcrumb-page.svelte';
  import BreadcrumbSeparator from '$lib/ui/breadcrumb/breadcrumb-separator.svelte';
  import BreadcrumbCollapse from '$lib/ui/breadcrumb/breadcrumb-collapse.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">ui.jixoai.com</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbCollapse>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs/components/overview.html">components</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbCollapse>
      <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/docs/components/form.html">data entry</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage href="/docs/components/form.html#example-form">checkbox</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>
