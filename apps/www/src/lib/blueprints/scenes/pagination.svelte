<!-- pagination blueprint: the page window — page 4 of 30 with both
     ellipses and the active fill, and the first-page bound where
     ‹ prev renders as a dead span. -->
<script lang="ts">
  import Pagination from '$lib/ui/pagination/pagination.svelte';

  const href = (page: number): string => `/components?page=${page}`;
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-8 p-10">
  <Pagination page={4} pageCount={30} {href} label="registry items" />
  <Pagination page={1} pageCount={8} {href} label="threads" />
</div>
