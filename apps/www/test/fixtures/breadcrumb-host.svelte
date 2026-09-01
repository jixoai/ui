<!--
  Test host for the breadcrumb family contract (composition-first,
  2026-08-25): a plain three-crumb trail, an eight-page trail with the
  middle wrapped in BreadcrumbCollapse (the opt-in fold), and a
  child()-escape trail where BreadcrumbLink hands its merged anchor
  props to a consumer element.
-->
<script lang="ts">
  import Breadcrumb from '../../src/lib/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '../../src/lib/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '../../src/lib/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '../../src/lib/ui/breadcrumb/breadcrumb-link.svelte';
  import BreadcrumbPage from '../../src/lib/ui/breadcrumb/breadcrumb-page.svelte';
  import BreadcrumbSeparator from '../../src/lib/ui/breadcrumb/breadcrumb-separator.svelte';
  import BreadcrumbCollapse from '../../src/lib/ui/breadcrumb/breadcrumb-collapse.svelte';
  import BreadcrumbEllipsis from '../../src/lib/ui/breadcrumb/breadcrumb-ellipsis.svelte';
  import BreadcrumbDropdown from '../../src/lib/ui/breadcrumb/breadcrumb-dropdown.svelte';
  import { cn } from '../../src/lib/utils';

  const middle = [2, 3, 4, 5, 6];
</script>

<div data-testid="plain">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink href="/">root</BreadcrumbLink></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbPage href="/leaf">leaf</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>

<div data-testid="folded">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink href="/1">p1</BreadcrumbLink></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbCollapse>
        {#each middle as n (n)}
          <BreadcrumbItem><BreadcrumbLink href={`/${n}`}>p{n}</BreadcrumbLink></BreadcrumbItem>
        {/each}
      </BreadcrumbCollapse>
      <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbPage href="/8">p8</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>

<div data-testid="manual-gap">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink href="/1">p1</BreadcrumbLink></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbPage href="/9">p9</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>

<div data-testid="child-escape">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">
          {#snippet child({ props })}
            <a {...props} class={cn(props.class, 'text-primary')}>root</a>
          {/snippet}
        </BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>

<div data-testid="dropdown">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink href="/">ui.jixoai.com</BreadcrumbLink></BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbDropdown
          label="components"
          current="/docs/components/toast.html"
          items={[
            { label: 'tabs', href: '/docs/components/tabs.html' },
            { label: 'toast', href: '/docs/components/toast.html' },
            { label: 'breadcrumb', href: '/docs/components/breadcrumb.html' },
          ]}
        />
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbSeparator><span data-testid="slash">/</span></BreadcrumbSeparator>
      </BreadcrumbItem>
      <BreadcrumbItem><BreadcrumbPage href="/docs/components/toast.html">toast</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>
