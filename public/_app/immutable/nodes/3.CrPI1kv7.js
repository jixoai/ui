import{$ as e,A as t,B as n,C as r,D as i,G as a,H as o,I as s,J as c,K as l,M as u,N as d,O as f,P as p,T as m,V as h,W as g,X as _,Y as v,Z as y,_ as b,a as x,at as S,b as C,c as w,d as T,et as ee,g as E,h as D,it as O,m as k,n as A,q as j,tt as M}from"../chunks/BRzkkxAc.js";import"../chunks/xihTtKlq.js";import{t as N}from"../chunks/DH0BeFh4.js";import{n as P,r as F,t as I}from"../chunks/CbJthWt5.js";import{i as L,n as R,r as z,t as B}from"../chunks/BVrTu_pp.js";function V(e,t={}){let n=t.lineOffset??1,r=(typeof t.scrollRoot==`string`?document.querySelector(t.scrollRoot):t.scrollRoot??null)??window,i=Array.from(document.querySelectorAll(`[data-region]`)),a=Array.from(document.querySelectorAll(`[data-family]`)),o=0,s=``,c=(e,t,n)=>{let r=Math.max(0,Math.min(e.right,t)-Math.max(e.left,0)),i=Math.max(0,Math.min(e.bottom,n)-Math.max(e.top,0));if(r<=0||i<=0)return 0;let a=r*i,o=Math.min(e.width*e.height,t*n);return o>0?Math.min(1,a/o):0},l=()=>{o=0;let t=innerWidth,r=innerHeight,l=n,u=new Map,d=new Map;for(let e of a){let n=c(e.getBoundingClientRect(),t,r);n>0&&d.set(e.dataset.family,n)}for(let e of i){let n=c(e.getBoundingClientRect(),t,r);n>0&&u.set(e.dataset.region,n)}let f=i.length>0?i[i.length-1].dataset.region:null;for(let e of i)if(e.getBoundingClientRect().bottom>l){f=e.dataset.region;break}let p=f+`|`+[...u.entries()].map(([e,t])=>e+t.toFixed(2)).sort().join(`,`);p!==s&&(s=p,e({weights:u,pick:f,familyWeights:d}))},u=()=>{o||=requestAnimationFrame(l)};return r.addEventListener(`scroll`,u,{passive:!0}),addEventListener(`resize`,u,{passive:!0}),l(),()=>{r.removeEventListener(`scroll`,u),removeEventListener(`resize`,u),o&&cancelAnimationFrame(o)}}var H=t(`<li><a> </a></li>`),te=t(`<li><a><span class="jx-cursor" aria-hidden="true">❯</span> <span> </span></a></li>`),U=t(`<div class="jx-toc"><nav class="jx-toc-desktop" aria-label="Table of contents"><span class="jx-spine"><span class="jx-spine-fill"></span></span> <p class="jx-toc-title"> </p> <ol></ol></nav> <div class="jx-toc-mobile jx-glass"><div class="jx-viewport"><ol></ol></div> <button type="button" class="jx-toggle" aria-label="Expand table of contents">▾</button></div></div>`);function W(e,t){M(t,!0);let n=x(t,`title`,3,`reading progress`),l=x(t,`scrollRoot`,3,null),u=y(()=>t.sections.flatMap((e,t)=>[{id:e.id,label:e.label,level:1,index:t+1},...(e.children??[]).map(e=>({id:e.id,label:e.label,level:2,index:t+1}))])),d=y(()=>s(u).map(e=>e.id)),m=y(()=>new Map(t.sections.flatMap(e=>(e.children??[]).map(t=>[t.id,e.id])))),g=c([]),b=c([]),C=_(null),E=_(null),O=_(null),A=_(!1);o(()=>{let e=V(({weights:e,pick:t})=>{for(let t of g)t.style.setProperty(`--w`,(e.get(t.dataset.id)??0).toFixed(3));for(let t of b)t.style.setProperty(`--w`,(e.get(t.dataset.id)??0).toFixed(3));if(!t)return;let n=s(m).get(t);for(let e of g){let r=e.dataset.id===t||e.dataset.id===n;e.classList.toggle(`active`,r)}for(let e of b){let n=e.dataset.id===t;e.style.setProperty(`--jx-cur`,n?`1`:`0`),n?e.setAttribute(`aria-current`,`true`):e.removeAttribute(`aria-current`)}let r=b.find(e=>e.dataset.id===t)?.closest(`li`);if(s(E)&&r){let e=matchMedia(`(prefers-reduced-motion: reduce)`).matches;s(E).scrollTo({top:r.offsetTop,behavior:e?`auto`:`smooth`})}},{lineOffset:innerWidth<900?76:1,scrollRoot:l()}),t=typeof l()==`string`?document.querySelector(l()):l(),n=()=>{if(!s(C))return;let e=t?t.scrollHeight-t.clientHeight:document.documentElement.scrollHeight-innerHeight,n=t?t.scrollTop:scrollY,r=e>0?Math.min(1,Math.max(0,n/e)):0;s(C).style.setProperty(`--jx-progress`,Math.max(.02,r).toFixed(3))};return(t??window).addEventListener(`scroll`,n,{passive:!0}),n(),()=>{e(),(t??window).removeEventListener(`scroll`,n)}});let N=()=>{v(A,!1)};var P=U(),F=a(P),I=a(F),L=a(I);w(L,e=>v(C,e),()=>s(C)),S(I);var R=j(I,2),z=a(R,!0);S(R);var B=j(R,2);r(B,21,()=>s(u),e=>e.id,(e,t)=>{var n=H(),r=a(n),o=a(r,!0);S(r),S(n),w(n,(e,t)=>g[s(d).indexOf(t.id)]=e,e=>g?.[s(d).indexOf(e.id)],()=>[s(t)]),h(()=>{k(n,1,D(s(t).level===2?`lvl-2`:``)),T(n,`data-id`,s(t).id),T(r,`href`,`#${s(t).id}`),i(o,s(t).label)}),f(e,n)}),S(B),S(F);var W=j(F,2),G=a(W),K=a(G);r(K,21,()=>s(u),e=>e.id,(e,t)=>{var n=te(),r=a(n),o=j(a(r),2),c=a(o,!0);S(o),S(r),w(r,(e,t)=>b[s(d).indexOf(t.id)]=e,e=>b?.[s(d).indexOf(e.id)],()=>[s(t)]),S(n),h(()=>{k(r,1,D(s(t).level===2?`lvl-2`:``)),T(r,`href`,`#${s(t).id}`),T(r,`data-id`,s(t).id),i(c,s(t).label)}),p(`click`,r,N),f(e,n)}),S(K),S(G),w(G,e=>v(E,e),()=>s(E));var ne=j(G,2);S(W),w(W,e=>v(O,e),()=>s(O)),S(P),h(()=>{i(z,n()),T(W,`data-open`,s(A)||void 0),T(ne,`aria-expanded`,s(A))}),p(`click`,ne,()=>v(A,!s(A))),f(e,P),ee()}d([`click`]);var G=t(`<div class="jx-float-anchor" aria-hidden="true"></div> <div class="jx-float-content"><!></div>`,1);function K(t,n){M(n,!0);let r=e(`jx-scaffold-float`),i=_(null),o=_(null);A(()=>{if(!s(i))return;let e=r.set(s(i));return()=>{e(),s(o)?.appendChild(s(i))}});var c=G(),u=l(c);w(u,e=>v(o,e),()=>s(o));var d=j(u,2),p=a(d);C(p,()=>n.children),S(d),w(d,e=>v(i,e),()=>s(i)),f(t,c),ee()}var ne=t(`<meta name="description" content="The jixoai component gallery: press-button, section-card, theme-toggle, reveal, the Combo ToC, the typing terminal, the hero, the app shell, and the terminal chrome — every demo rendered from the registry files this site consumes."/>`),re=t(`<aside class="docs-aside svelte-9maxek" aria-label="On this page"><!></aside>`),ie=t(`<div class="flex flex-wrap gap-3"><span class="pill">9 live components</span> <span class="pill">2 framework-free libs</span> <span class="pill">1 dogfooded ToC</span> <span class="pill">zero network</span></div>`),ae=t(`<div class="flex flex-col gap-7" data-region="press-variants"><div id="press-variants" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Variants, one physics</h3> <div class="flex flex-wrap items-center gap-3"><!> <!> <!></div> <p class="text-muted-foreground text-pretty text-[13px] leading-6">The third button is the copied feedback state — click it: the command is copied and
              the variant flips to <code class="text-accent">copied</code> (secondary surface) for
              1.6s. Reduced-motion users get instant state changes.</p></div> <!></div>`),oe=t(`<p class="text-muted-foreground text-pretty text-[13px] leading-6">Same component, same markup, no special variant. The outer card's body slot simply
                renders another one.</p>`),se=t(`<div class="flex flex-col gap-7" data-region="section-nesting"><div id="section-nesting" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Self-nesting</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">Cards compose with themselves — a card inside a card body keeps the same border and
              header law at a smaller scale. This is how dense reference pages stay coherent.</p> <!></div> <!></div>`),ce=t(`<div class="flex flex-col gap-5"><div class="flex flex-wrap items-center gap-x-8 gap-y-4"><label class="text-muted-foreground flex items-center gap-2 text-xs"><span>full</span><!></label> <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>compact</span><!></label> <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>icon</span><!></label> <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>text</span><!></label></div> <p class="text-muted-foreground text-pretty text-[13px] leading-6">All four control the same live theme — click any of them and the whole site re-themes.
            full sets a mode directly; the other three cycle light → dark → system. The toggle
            adapts to its container: light here, dark in the terminal header above.</p> <!></div>`),le=t(`<div class="border border-border bg-card shadow-xs px-4 py-5" data-reveal=""><p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]"> </p> <p class="text-muted-foreground mt-2 text-[12.5px] leading-5">threshold 0 · first-pixel entry · unobserve after reveal</p></div>`),ue=t(`<div class="flex flex-col gap-7" data-region="reveal-demo"><div id="reveal-demo" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Live demo</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">Scroll these blocks in and out — each carries a static <code class="text-accent">data-reveal=""</code> attribute in the prerendered markup
              and staggers 90ms behind its sibling. The initial-state law: the hidden state lives
              in the template, never in mount-time JS, so flat-file page loads never flash content
              before the animation runs.</p> <div class="grid gap-3 min-[760px]:grid-cols-3"></div> <div class="bg-border mt-2 h-px w-full" data-reveal="rule"></div> <p class="text-muted-foreground text-[12.5px]">↑ the rule variant: <code class="text-accent">data-reveal="rule"</code> draws a
              horizontal line scaleX(0 → 1) instead of rising.</p></div> <!></div>`),de=t(`<div class="flex flex-col gap-7" data-region="toc-contract"><div id="toc-contract" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Content contract</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">The engine (registry item <code class="text-accent">toc-engine</code>) computes IoM
              weights — intersection area over min(block, viewport) — and a single line pick: the
              viewport-top line on desktop, the sticky-bar bottom + 2em (76px) on mobile. A line in
              a margin between blocks belongs to the block below. Your content only owes the
              wrapper attributes:</p> <!></div></div>`),fe=t(`<div class="flex flex-col gap-7" data-region="terminal-replay"><div id="terminal-replay" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Live typing</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">The exact card from the homepage hero. Replay remounts the component —
              the typing story restarts from the first character.</p> <div class="max-w-[36rem]"><!></div> <div><!></div></div></div>`),pe=t(`<div class="flex flex-col gap-7" data-region="hero-demo"><div id="hero-demo" class="flex flex-col gap-4"><h3 class="text-[15px] font-bold tracking-tight">Demo</h3> <div class="border border-border bg-muted/40"><!></div> <!></div></div>`),me=t(`<div class="flex flex-col gap-7" data-region="shell-scaffold"><div id="shell-scaffold" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Scaffold + transitions</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">This site runs on it: the header band above is sticky, carries
              view-transition-name "site-header" (it persists across page navigations),
              and this content column animates as "page-main". Route-typed variants
              (from-/to-<route>) follow the view-transitions-toolkit pageswap/pagereveal
              pattern wired in app.html.</route></p> <!></div></div>`),he=t(`<div class="flex flex-col gap-7" data-region="shell-code"><div id="shell-code" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Integration</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">The ghost wordmark recipe: clamp(3rem, 11vw, 9rem), transparent fill, 1px
              text-stroke of the border color at 55%, with an @supports fallback — decorative,
              aria-hidden, unselectable.</p> <!></div></div>`),ge=t(`<!> <div class="docs-frame svelte-9maxek"><div class="docs-main svelte-9maxek"><div data-family="gallery"><div id="gallery" data-region="gallery" data-reveal=""><!></div></div> <div id="press-button" data-family="press-button" data-reveal=""><!></div> <div id="section-card" data-family="section-card" data-reveal=""><!></div> <div id="theme-toggle" data-family="theme-toggle" data-region="theme-toggle" data-reveal=""><!></div> <div id="reveal" data-family="reveal" data-reveal=""><!></div> <div id="toc" data-family="toc" data-reveal=""><!></div> <div id="terminal-card" data-family="terminal-card" data-reveal=""><!></div> <div id="hero-section" data-family="hero-section" data-reveal=""><!></div> <div id="app-shell" data-family="app-shell" data-reveal=""><!></div> <div id="shell" data-family="shell" data-reveal=""><!></div></div></div>`,1);function q(e){let t=[{id:`gallery`,label:`Gallery`},{id:`press-button`,label:`press-button`,children:[{id:`press-variants`,label:`Variants`}]},{id:`section-card`,label:`section-card`,children:[{id:`section-nesting`,label:`Nesting`}]},{id:`theme-toggle`,label:`theme-toggle`},{id:`reveal`,label:`reveal`,children:[{id:`reveal-demo`,label:`Live demo`}]},{id:`toc`,label:`toc`,children:[{id:`toc-contract`,label:`Content contract`}]},{id:`terminal-card`,label:`terminal-card`,children:[{id:`terminal-replay`,label:`Live typing`}]},{id:`hero-section`,label:`hero-section`,children:[{id:`hero-demo`,label:`Demo`}]},{id:`app-shell`,label:`app-shell`,children:[{id:`shell-scaffold`,label:`Scaffold + transitions`}]},{id:`shell`,label:`terminal-header / footer`,children:[{id:`shell-code`,label:`Integration`}]}],o=_(0),c=`<\/script>`,d=`<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import TerminalCard from '@ui/terminal-card.svelte';
${c}

<HeroSection
  eyebrow="my-app · v1"
  titleLead="Ship terminals anywhere. "
  titleAccent="One hue."
  summary="..."
  badges={['OKLCH tokens', 'Svelte 5', 'MIT']}
  copyCommand="npx jixoai-ui init --hue 200"
>
  {#snippet secondary()}
    <a href="/docs" class="...">Get started</a>
  {/snippet}
  {#snippet terminal()}
    <TerminalCard barTitle="quick-start — zsh"
      command="npx jixoai-ui init --hue 200"
      outputs={['theme installed', 'hue applied']} />
  {/snippet}
</HeroSection>`,p=`<script lang="ts">
  import AppShell from '@ui/app-shell.svelte';
  import '$lib/app-shell.css';
${c}

<AppShell>
  {#snippet header()}
    <TerminalHeader ... />
  {/snippet}

  {#snippet footer()}
    <TerminalFooter ... />
  {/snippet}

  <!-- default snippet: the page -->
</AppShell>`,y=`<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
${c}

<PressButton variant="primary" href="/docs.html">Read the docs</PressButton>
<PressButton variant="outline" onclick={save}>Save</PressButton>`,x=String.raw`<SectionCard
  eyebrow="Quick start"
  title="Acquire a Backend. Spawn a shell."
  summary="One paragraph of text-pretty context."
>
  <p>Body slot: any content.</p>
</SectionCard>`,C=`<script lang="ts">
  import ThemeToggle from '@ui/theme-toggle.svelte';
${c}

<!-- pair with the no-flash inline bootstrap in app.html (localStorage
     "theme" light|dark|system, .dark class, colorScheme, html.js) -->
<ThemeToggle variant="full" />
<ThemeToggle variant="compact" />
<ThemeToggle variant="icon" />
<ThemeToggle variant="text" />`,w=`<script lang="ts">
  import { reveal } from '@lib/reveal';
${c}

<!-- the hidden state is a STATIC attribute in the markup (never mount-time
     JS), so flat-file loads never flash content -->
<div data-reveal="" use:reveal={{ delay: 70, rise: 12 }}>
  <SectionCard eyebrow="Law" title="Reveal" />
</div>

<hr data-reveal="rule" use:reveal />`,T=String.raw`<!-- content contract: non-overlapping leaves carry data-region;
     parent extents carry data-family. Ids match the outline. -->
<div data-family="core">
  <h2 id="core">Core usage</h2>
  <section id="spawn" data-region="core-spawn">…</section>
  <section id="write" data-region="core-write">…</section>
</div>

<!-- the aside precedes main content in the DOM; the page grid places it
     right on desktop (sticky) and as a sticky height:0 rail on mobile -->
<aside class="docs-aside">
  <Toc {sections} title="on this page" scrollRoot=".jx-shell-body" />
</aside>`,ee=`<script lang="ts">
  import TerminalFooter from '@ui/terminal-footer.svelte';
  import TerminalHeader from '@ui/terminal-header.svelte';
  import ThemeToggle from '@ui/theme-toggle.svelte';
${c}

<TerminalHeader
  brand="jixoai/ui"
  domain="ui.jixoai.com"
  subtitle="the jixoai design language"
  items={[
    { href: '/', label: 'Overview', active: true },
    { href: 'https://github.com/jixoai/ui', label: 'GitHub', external: true },
  ]}
>
  {#snippet switcher()}
    <ThemeToggle />
  {/snippet}
</TerminalHeader>

<!-- … page content … -->

<TerminalFooter
  ghost="JIXOAI/UI"
  links={[{ label: 'GitHub', href: 'https://github.com/jixoai/ui' }]}
/>`;var D=ge();b(`9maxek`,e=>{var t=ne();n(()=>{g.title=`Components · jixoai/ui`}),f(e,t)});var k=l(D);K(k,{children:(e,n)=>{var r=re();W(a(r),{get sections(){return t},title:`on this page`,scrollRoot:`.jx-shell-body`}),S(r),f(e,r)},$$slots:{default:!0}});var A=j(k,2),M=a(A),V=a(M),H=a(V),te=a(H);B(te,{headingLevel:1,tone:`hero`,eyebrow:`Gallery`,title:`Every component, rendered from the registry`,summary:`Each section below consumes the exact same-source copy this site installed from registry/files — nothing is reimplemented for the showcase. The table of contents tracking this page is itself the toc component: the Rule Tracker on the right (desktop) or the glass Terminal Rail above (mobile).`,children:(e,t)=>{var n=ie();f(e,n)},$$slots:{default:!0}}),S(H),E(H,e=>R?.(e)),S(V);var U=j(V,2),G=a(U);B(G,{eyebrow:`registry:ui`,title:`press-button`,summary:`The brutalist press-physics button: hover lifts toward the viewer (shadow xs grows), active presses back into the page. The shadow is the affordance — there is no other button style in the grammar.`,children:(e,t)=>{var n=ae(),r=a(n),i=j(a(r),2),o=a(i);z(o,{variant:`primary`,children:(e,t)=>{O();var n=u(`primary`);f(e,n)},$$slots:{default:!0}});var s=j(o,2);z(s,{variant:`outline`,children:(e,t)=>{O();var n=u(`outline`);f(e,n)},$$slots:{default:!0}});var c=j(s,2);F(c,{command:`npx jixoai-ui add press-button`,label:`copied (press me)`}),S(i),O(2),S(r);var l=j(r,2);L(l,{code:y,lang:`svelte`,meta:`usage`}),S(n),f(e,n)},$$slots:{default:!0}}),S(U),E(U,e=>R?.(e));var q=j(U,2),_e=a(q);B(_e,{eyebrow:`registry:ui`,title:`section-card`,summary:`The content atom of the site grammar: a bordered card, header block with eyebrow (brand hue, Share Tech Mono, tracked 0.24em), font-nav title, text-pretty summary, and a body snippet slot.`,children:(e,t)=>{var n=se(),r=a(n),i=j(a(r),4);B(i,{eyebrow:`inner`,title:`A card, nested`,children:(e,t)=>{var n=oe();f(e,n)},$$slots:{default:!0}}),S(r);var o=j(r,2);L(o,{get code(){return x},lang:`svelte`,meta:`usage`}),S(n),f(e,n)},$$slots:{default:!0}}),S(q),E(q,e=>R?.(e));var J=j(q,2),ve=a(J);B(ve,{eyebrow:`registry:ui`,title:`theme-toggle`,summary:`light / dark / system in four variants: full (segmented icon+label selector — click a mode to set it), compact (icon + current, cycles), icon (icon only, cycles), text (label only, cycles). Inline SVG icons, no icon-library dependency; drives the shared theme contract (localStorage “theme”, .dark class, colorScheme) with the no-flash bootstrap.`,children:(e,t)=>{var n=ce(),r=a(n),i=a(r),o=j(a(i));N(o,{variant:`full`}),S(i);var s=j(i,2),c=j(a(s));N(c,{variant:`compact`}),S(s);var l=j(s,2),u=j(a(l));N(u,{variant:`icon`}),S(l);var d=j(l,2),p=j(a(d));N(p,{variant:`text`}),S(d),S(r);var m=j(r,4);L(m,{code:C,lang:`svelte`,meta:`usage`}),S(n),f(e,n)},$$slots:{default:!0}}),S(J),E(J,e=>R?.(e));var Y=j(J,2),ye=a(Y);B(ye,{eyebrow:`registry:lib`,title:`reveal`,summary:`The scroll-reveal action. Motion is restrained to exactly two patterns: entrance (opacity + rise, or a rule that draws in) and press physics. Every animated element on this site uses one of them.`,children:(e,t)=>{var n=ue(),o=a(n),s=j(a(o),4);r(s,20,()=>[0,1,2],e=>e,(e,t)=>{var n=le(),r=a(n),o=a(r);S(r),O(2),S(n),E(n,(e,t)=>R?.(e,t),()=>({delay:t*90,rise:12})),h(()=>i(o,`block ${t+1}`)),f(e,n)}),S(s);var c=j(s,2);E(c,e=>R?.(e)),O(2),S(o);var l=j(o,2);L(l,{code:w,lang:`svelte`,meta:`usage`}),S(n),f(e,n)},$$slots:{default:!0}}),S(Y),E(Y,e=>R?.(e));var X=j(Y,2),be=a(X);B(be,{eyebrow:`registry:ui`,title:`toc — the Combo ToC`,summary:`You are looking at it. Desktop gets the Rule Tracker: a scroll-progress spine, square weight-driven nodes on level-1 entries, and the pick + parent markers. Mobile gets the Terminal Rail: a glass single-row viewport where page scroll drives the row to the current entry, and expanding changes ONLY the height.`,children:(e,t)=>{var n=de(),r=a(n),i=j(a(r),4);L(i,{get code(){return T},lang:`svelte`,meta:`contract`}),S(r),S(n),f(e,n)},$$slots:{default:!0}}),S(X),E(X,e=>R?.(e));var Z=j(X,2),xe=a(Z);B(xe,{eyebrow:`registry:ui`,title:`terminal-card`,summary:`The Broadside hero terminal, composed after the openspecui reference: traffic-light title bar, one large typed command, outputs surfacing line by line, 6px hard offset shadow. One-shot typing entrance (never looping), static block cursor per the motion law; prerendered/no-JS shows the settled terminal and reduced motion renders instantly.`,children:(e,t)=>{var n=fe(),r=a(n),i=j(a(r),4),c=a(i);m(c,()=>s(o),e=>{I(e,{barTitle:`quick-start — zsh`,command:`npx jixoai-ui add terminal-card`,outputs:[`terminal-card.svelte → src/lib/ui/`,`one-shot typing · static cursor · no blink`]})}),S(i);var l=j(i,2),d=a(l);z(d,{onclick:()=>v(o,s(o)+1),children:(e,t)=>{O();var n=u(`Replay ↻`);f(e,n)},$$slots:{default:!0}}),S(l),S(r),S(n),f(e,n)},$$slots:{default:!0}}),S(Z),E(Z,e=>R?.(e));var Q=j(Z,2),Se=a(Q);B(Se,{eyebrow:`registry:ui`,title:`hero-section`,summary:`The Broadside hero, composed after the openspecui reference: clamp-scaled bold lead type with a primary accent tail, badge row, a copy-command PRIMARY CTA with copied feedback, and the terminal card in a bottom-aligned second column at min-1100px. The homepage is the full-bleed demo; this is the component rendered in place.`,children:(e,t)=>{var n=pe(),r=a(n),i=j(a(r),2),o=a(i);P(o,{eyebrow:`your-app · v0`,titleLead:`Your product line here. `,titleAccent:`Your accent.`,summary:`A compact instance with the real composition rules — swap the copy, keep the law.`,badges:[`badges`,`copy CTA`,`terminal demo`],copyCommand:`npx jixoai-ui init --hue 210`,terminal:e=>{I(e,{barTitle:`demo`,command:`echo hello jixoai`,outputs:[`→ composed from the registry files`]})},$$slots:{terminal:!0}}),S(i);var s=j(i,2);L(s,{code:d,lang:`svelte`,meta:`usage`}),S(r),S(n),f(e,n)},$$slots:{default:!0}}),S(Q),E(Q,e=>R?.(e));var $=j(Q,2),Ce=a($);B(Ce,{eyebrow:`registry:ui`,title:`app-shell`,summary:`The page scaffold: a sticky, always-visible header band (this page's navigation never scrolls away), the main column, an optional footer band, and a skip link. It also ships the systematized MPA view transitions — cross-document navigation with a persistent site-header and a horizontal-slide + blur crossfade on page-main (navigate this site in Chrome/Edge to feel it; reduced motion crossfades).`,children:(e,t)=>{var n=me(),r=a(n),i=j(a(r),4);L(i,{code:p,lang:`svelte`,meta:`usage`}),S(r),S(n),f(e,n)},$$slots:{default:!0}}),S($),E($,e=>R?.(e));var we=j($,2),Te=a(we);B(Te,{eyebrow:`registry:ui`,title:`terminal-header / terminal-footer`,summary:`The site shell. The header is an always-dark CRT bezel (never a themed surface) with the brand eyebrow in brand hue, nav pills, and the theme slot at the far right; the footer is a giant ghost wordmark that closes the narrative. This page does not render a second pair — you're wearing one — so here is how they attach instead.`,children:(e,t)=>{var n=he(),r=a(n),i=j(a(r),4);L(i,{code:ee,lang:`svelte`,meta:`shell`}),S(r),S(n),f(e,n)},$$slots:{default:!0}}),S(we),E(we,e=>R?.(e)),S(M),S(A),f(e,D)}export{q as component};