<!--
  prototype-kit test fixture: a canvas + one page frame + one component
  frame, everything else driven through props (the host-component
  pattern of the registry suite — assertions read the DOM, hosts carry
  the wiring).
-->
<script lang="ts">
  import PrototypeCanvas, {
    PrototypeComponent,
    PrototypePage,
  } from '../../../../../registry/files/ui/prototype-kit';

  let {
    canvasProps = {},
    pageProps = {},
    componentProps = {},
  }: {
    canvasProps?: Record<string, unknown>;
    pageProps?: Record<string, unknown>;
    componentProps?: Record<string, unknown>;
  } = $props();
</script>

<PrototypeCanvas prototype="welcome" {...canvasProps}>
  <PrototypePage
    id="hero-light"
    ref="./pages/hero.svelte"
    width={390}
    height={844}
    theme="light"
    {...pageProps}
  />
  <PrototypeComponent
    id="press-idle"
    ref="./components/press-idle.svelte"
    width={240}
    height={96}
    {...componentProps}
  />
</PrototypeCanvas>
