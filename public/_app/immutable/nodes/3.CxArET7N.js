import{A as e,B as t,C as n,D as r,G as i,H as a,I as o,J as s,M as c,N as l,O as u,P as d,T as f,V as p,W as m,X as h,Y as g,Z as _,_ as v,a as ee,at as y,c as b,d as x,et as te,g as S,h as C,it as w,m as T,q as E,tt as D}from"../chunks/BRzkkxAc.js";import"../chunks/xihTtKlq.js";import{t as O}from"../chunks/DH0BeFh4.js";import{n as k,r as A,t as j}from"../chunks/CbJthWt5.js";import{i as M,n as N,r as P,t as F}from"../chunks/BVrTu_pp.js";function I(e,t={}){let n=t.lineOffset??1,r=Array.from(document.querySelectorAll(`[data-region]`)),i=Array.from(document.querySelectorAll(`[data-family]`)),a=0,o=``,s=(e,t,n)=>{let r=Math.max(0,Math.min(e.right,t)-Math.max(e.left,0)),i=Math.max(0,Math.min(e.bottom,n)-Math.max(e.top,0));if(r<=0||i<=0)return 0;let a=r*i,o=Math.min(e.width*e.height,t*n);return o>0?Math.min(1,a/o):0},c=()=>{a=0;let t=innerWidth,c=innerHeight,l=n,u=new Map,d=new Map;for(let e of i){let n=s(e.getBoundingClientRect(),t,c);n>0&&d.set(e.dataset.family,n)}for(let e of r){let n=s(e.getBoundingClientRect(),t,c);n>0&&u.set(e.dataset.region,n)}let f=r.length>0?r[r.length-1].dataset.region:null;for(let e of r)if(e.getBoundingClientRect().bottom>l){f=e.dataset.region;break}let p=f+`|`+[...u.entries()].map(([e,t])=>e+t.toFixed(2)).sort().join(`,`);p!==o&&(o=p,e({weights:u,pick:f,familyWeights:d}))},l=()=>{a||=requestAnimationFrame(c)};return addEventListener(`scroll`,l,{passive:!0}),addEventListener(`resize`,l,{passive:!0}),c(),()=>{removeEventListener(`scroll`,l),removeEventListener(`resize`,l),a&&cancelAnimationFrame(a)}}var L=e(`<li><a> </a></li>`),R=e(`<li><a><span class="jx-cursor" aria-hidden="true">❯</span> <span> </span></a></li>`),z=e(`<div class="jx-toc"><nav class="jx-toc-desktop" aria-label="Table of contents"><span class="jx-spine"><span class="jx-spine-fill"></span></span> <p class="jx-toc-title"> </p> <ol></ol></nav> <div class="jx-toc-mobile jx-glass"><div class="jx-viewport"><ol></ol></div> <button type="button" class="jx-toggle" aria-label="Expand table of contents">▾</button></div></div>`);function B(e,t){D(t,!0);let c=ee(t,`title`,3,`reading progress`),l=_(()=>t.sections.flatMap((e,t)=>[{id:e.id,label:e.label,level:1,index:t+1},...(e.children??[]).map(e=>({id:e.id,label:e.label,level:2,index:t+1}))])),f=_(()=>o(l).map(e=>e.id)),m=_(()=>new Map(t.sections.flatMap(e=>(e.children??[]).map(t=>[t.id,e.id])))),v=s([]),S=s([]),w=h(null),O=h(null),k=h(null),A=h(!1);a(()=>{let e=I(({weights:e,pick:t})=>{for(let t of v)t.style.setProperty(`--w`,(e.get(t.dataset.id)??0).toFixed(3));for(let t of S)t.style.setProperty(`--w`,(e.get(t.dataset.id)??0).toFixed(3));if(!t)return;let n=o(m).get(t);for(let e of v){let r=e.dataset.id===t||e.dataset.id===n;e.classList.toggle(`active`,r)}for(let e of S){let n=e.dataset.id===t;e.style.setProperty(`--jx-cur`,n?`1`:`0`),n?e.setAttribute(`aria-current`,`true`):e.removeAttribute(`aria-current`)}let r=S.find(e=>e.dataset.id===t)?.closest(`li`);if(o(O)&&r){let e=matchMedia(`(prefers-reduced-motion: reduce)`).matches;o(O).scrollTo({top:r.offsetTop,behavior:e?`auto`:`smooth`})}},{lineOffset:innerWidth<900?76:1}),t=()=>{if(!o(w))return;let e=document.documentElement.scrollHeight-innerHeight,t=e>0?Math.min(1,Math.max(0,scrollY/e)):0;o(w).style.setProperty(`--jx-progress`,Math.max(.02,t).toFixed(3))};return addEventListener(`scroll`,t,{passive:!0}),t(),()=>{e(),removeEventListener(`scroll`,t)}});let j=()=>{g(A,!1)};var M=z(),N=i(M),P=i(N),F=i(P);b(F,e=>g(w,e),()=>o(w)),y(P);var B=E(P,2),ne=i(B,!0);y(B);var V=E(B,2);n(V,21,()=>o(l),e=>e.id,(e,t)=>{var n=L(),a=i(n),s=i(a,!0);y(a),y(n),b(n,(e,t)=>v[o(f).indexOf(t.id)]=e,e=>v?.[o(f).indexOf(e.id)],()=>[o(t)]),p(()=>{T(n,1,C(o(t).level===2?`lvl-2`:``)),x(n,`data-id`,o(t).id),x(a,`href`,`#${o(t).id}`),r(s,o(t).label)}),u(e,n)}),y(V),y(N);var H=E(N,2),U=i(H),W=i(U);n(W,21,()=>o(l),e=>e.id,(e,t)=>{var n=R(),a=i(n),s=E(i(a),2),c=i(s,!0);y(s),y(a),b(a,(e,t)=>S[o(f).indexOf(t.id)]=e,e=>S?.[o(f).indexOf(e.id)],()=>[o(t)]),y(n),p(()=>{T(a,1,C(o(t).level===2?`lvl-2`:``)),x(a,`href`,`#${o(t).id}`),x(a,`data-id`,o(t).id),r(c,o(t).label)}),d(`click`,a,j),u(e,n)}),y(W),y(U),b(U,e=>g(O,e),()=>o(O));var G=E(U,2);y(H),b(H,e=>g(k,e),()=>o(k)),y(M),p(()=>{r(ne,c()),x(H,`data-open`,o(A)||void 0),x(G,`aria-expanded`,o(A))}),d(`click`,G,()=>g(A,!o(A))),u(e,M),te()}l([`click`]);var ne=e(`<meta name="description" content="The jixoai component gallery: press-button, section-card, theme-toggle, reveal, the Combo ToC, the typing terminal, the hero, the app shell, and the terminal chrome — every demo rendered from the registry files this site consumes."/>`),V=e(`<div class="flex flex-wrap gap-3"><span class="pill">9 live components</span> <span class="pill">2 framework-free libs</span> <span class="pill">1 dogfooded ToC</span> <span class="pill">zero network</span></div>`),H=e(`<div class="flex flex-col gap-7" data-region="press-variants"><div id="press-variants" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Variants, one physics</h3> <div class="flex flex-wrap items-center gap-3"><!> <!> <!></div> <p class="text-muted-foreground text-pretty text-[13px] leading-6">The third button is the copied feedback state — click it: the command is copied and
              the variant flips to <code class="text-accent">copied</code> (secondary surface) for
              1.6s. Reduced-motion users get instant state changes.</p></div> <!></div>`),U=e(`<p class="text-muted-foreground text-pretty text-[13px] leading-6">Same component, same markup, no special variant. The outer card's body slot simply
                renders another one.</p>`),W=e(`<div class="flex flex-col gap-7" data-region="section-nesting"><div id="section-nesting" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Self-nesting</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">Cards compose with themselves — a card inside a card body keeps the same border and
              header law at a smaller scale. This is how dense reference pages stay coherent.</p> <!></div> <!></div>`),G=e(`<div class="flex flex-col gap-5"><div class="flex flex-wrap items-center gap-x-8 gap-y-4"><label class="text-muted-foreground flex items-center gap-2 text-xs"><span>full</span><!></label> <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>compact</span><!></label> <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>icon</span><!></label> <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>text</span><!></label></div> <p class="text-muted-foreground text-pretty text-[13px] leading-6">All four control the same live theme — click any of them and the whole site re-themes.
            full sets a mode directly; the other three cycle light → dark → system. The toggle
            adapts to its container: light here, dark in the terminal header above.</p> <!></div>`),re=e(`<div class="border border-border bg-card shadow-xs px-4 py-5" data-reveal=""><p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]"> </p> <p class="text-muted-foreground mt-2 text-[12.5px] leading-5">threshold 0 · first-pixel entry · unobserve after reveal</p></div>`),ie=e(`<div class="flex flex-col gap-7" data-region="reveal-demo"><div id="reveal-demo" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Live demo</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">Scroll these blocks in and out — each carries a static <code class="text-accent">data-reveal=""</code> attribute in the prerendered markup
              and staggers 90ms behind its sibling. The initial-state law: the hidden state lives
              in the template, never in mount-time JS, so flat-file page loads never flash content
              before the animation runs.</p> <div class="grid gap-3 min-[760px]:grid-cols-3"></div> <div class="bg-border mt-2 h-px w-full" data-reveal="rule"></div> <p class="text-muted-foreground text-[12.5px]">↑ the rule variant: <code class="text-accent">data-reveal="rule"</code> draws a
              horizontal line scaleX(0 → 1) instead of rising.</p></div> <!></div>`),ae=e(`<div class="flex flex-col gap-7" data-region="toc-contract"><div id="toc-contract" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Content contract</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">The engine (registry item <code class="text-accent">toc-engine</code>) computes IoM
              weights — intersection area over min(block, viewport) — and a single line pick: the
              viewport-top line on desktop, the sticky-bar bottom + 2em (76px) on mobile. A line in
              a margin between blocks belongs to the block below. Your content only owes the
              wrapper attributes:</p> <!></div></div>`),oe=e(`<div class="flex flex-col gap-7" data-region="terminal-replay"><div id="terminal-replay" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Live typing</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">The exact card from the homepage hero. Replay remounts the component —
              the typing story restarts from the first character.</p> <div class="max-w-[36rem]"><!></div> <div><!></div></div></div>`),se=e(`<div class="flex flex-col gap-7" data-region="hero-demo"><div id="hero-demo" class="flex flex-col gap-4"><h3 class="text-[15px] font-bold tracking-tight">Demo</h3> <div class="border border-border bg-muted/40"><!></div> <!></div></div>`),ce=e(`<div class="flex flex-col gap-7" data-region="shell-scaffold"><div id="shell-scaffold" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Scaffold + transitions</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">This site runs on it: the header band above is sticky, carries
              view-transition-name "site-header" (it persists across page navigations),
              and this content column animates as "page-main". Route-typed variants
              (from-/to-<route>) follow the view-transitions-toolkit pageswap/pagereveal
              pattern wired in app.html.</route></p> <!></div></div>`),le=e(`<div class="flex flex-col gap-7" data-region="shell-code"><div id="shell-code" class="flex flex-col gap-3"><h3 class="text-[15px] font-bold tracking-tight">Integration</h3> <p class="text-muted-foreground text-pretty text-[13px] leading-6">The ghost wordmark recipe: clamp(3rem, 11vw, 9rem), transparent fill, 1px
              text-stroke of the border color at 55%, with an @supports fallback — decorative,
              aria-hidden, unselectable.</p> <!></div></div>`),ue=e(`<div class="docs-frame svelte-136c6pl"><aside class="docs-aside svelte-136c6pl" aria-label="On this page"><!></aside> <div class="docs-main svelte-136c6pl"><div data-family="gallery"><div id="gallery" data-region="gallery" data-reveal=""><!></div></div> <div id="press-button" data-family="press-button" data-reveal=""><!></div> <div id="section-card" data-family="section-card" data-reveal=""><!></div> <div id="theme-toggle" data-family="theme-toggle" data-region="theme-toggle" data-reveal=""><!></div> <div id="reveal" data-family="reveal" data-reveal=""><!></div> <div id="toc" data-family="toc" data-reveal=""><!></div> <div id="terminal-card" data-family="terminal-card" data-reveal=""><!></div> <div id="hero-section" data-family="hero-section" data-reveal=""><!></div> <div id="app-shell" data-family="app-shell" data-reveal=""><!></div> <div id="shell" data-family="shell" data-reveal=""><!></div></div></div>`);function de(e){let a=[{id:`gallery`,label:`Gallery`},{id:`press-button`,label:`press-button`,children:[{id:`press-variants`,label:`Variants`}]},{id:`section-card`,label:`section-card`,children:[{id:`section-nesting`,label:`Nesting`}]},{id:`theme-toggle`,label:`theme-toggle`},{id:`reveal`,label:`reveal`,children:[{id:`reveal-demo`,label:`Live demo`}]},{id:`toc`,label:`toc`,children:[{id:`toc-contract`,label:`Content contract`}]},{id:`terminal-card`,label:`terminal-card`,children:[{id:`terminal-replay`,label:`Live typing`}]},{id:`hero-section`,label:`hero-section`,children:[{id:`hero-demo`,label:`Demo`}]},{id:`app-shell`,label:`app-shell`,children:[{id:`shell-scaffold`,label:`Scaffold + transitions`}]},{id:`shell`,label:`terminal-header / footer`,children:[{id:`shell-code`,label:`Integration`}]}],s=h(0),l=`<\/script>`,d=`<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import TerminalCard from '@ui/terminal-card.svelte';
${l}

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
</HeroSection>`,_=`<script lang="ts">
  import AppShell from '@ui/app-shell.svelte';
  import '$lib/app-shell.css';
${l}

<AppShell>
  {#snippet header()}
    <TerminalHeader ... />
  {/snippet}

  {#snippet footer()}
    <TerminalFooter ... />
  {/snippet}

  <!-- default snippet: the page -->
</AppShell>`,ee=`<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
${l}

<PressButton variant="primary" href="/docs.html">Read the docs</PressButton>
<PressButton variant="outline" onclick={save}>Save</PressButton>`,b=String.raw`<SectionCard
  eyebrow="Quick start"
  title="Acquire a Backend. Spawn a shell."
  summary="One paragraph of text-pretty context."
>
  <p>Body slot: any content.</p>
</SectionCard>`,x=`<script lang="ts">
  import ThemeToggle from '@ui/theme-toggle.svelte';
${l}

<!-- pair with the no-flash inline bootstrap in app.html (localStorage
     "theme" light|dark|system, .dark class, colorScheme, html.js) -->
<ThemeToggle variant="full" />
<ThemeToggle variant="compact" />
<ThemeToggle variant="icon" />
<ThemeToggle variant="text" />`,te=`<script lang="ts">
  import { reveal } from '@lib/reveal';
${l}

<!-- the hidden state is a STATIC attribute in the markup (never mount-time
     JS), so flat-file loads never flash content -->
<div data-reveal="" use:reveal={{ delay: 70, rise: 12 }}>
  <SectionCard eyebrow="Law" title="Reveal" />
</div>

<hr data-reveal="rule" use:reveal />`,C=String.raw`<!-- content contract: non-overlapping leaves carry data-region;
     parent extents carry data-family. Ids match the outline. -->
<div data-family="core">
  <h2 id="core">Core usage</h2>
  <section id="spawn" data-region="core-spawn">…</section>
  <section id="write" data-region="core-write">…</section>
</div>

<!-- the aside precedes main content in the DOM; the page grid places it
     right on desktop (sticky) and as a sticky height:0 rail on mobile -->
<aside class="docs-aside">
  <Toc {sections} title="on this page" />
</aside>`,T=`<script lang="ts">
  import TerminalFooter from '@ui/terminal-footer.svelte';
  import TerminalHeader from '@ui/terminal-header.svelte';
  import ThemeToggle from '@ui/theme-toggle.svelte';
${l}

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
/>`;var D=ue();v(`136c6pl`,e=>{var n=ne();t(()=>{m.title=`Components · jixoai/ui`}),u(e,n)});var I=i(D);B(i(I),{get sections(){return a},title:`on this page`}),y(I);var L=E(I,2),R=i(L),z=i(R),de=i(z);F(de,{headingLevel:1,tone:`hero`,eyebrow:`Gallery`,title:`Every component, rendered from the registry`,summary:`Each section below consumes the exact same-source copy this site installed from registry/files — nothing is reimplemented for the showcase. The table of contents tracking this page is itself the toc component: the Rule Tracker on the right (desktop) or the glass Terminal Rail above (mobile).`,children:(e,t)=>{var n=V();u(e,n)},$$slots:{default:!0}}),y(z),S(z,e=>N?.(e)),y(R);var K=E(R,2),fe=i(K);F(fe,{eyebrow:`registry:ui`,title:`press-button`,summary:`The brutalist press-physics button: hover lifts toward the viewer (shadow xs grows), active presses back into the page. The shadow is the affordance — there is no other button style in the grammar.`,children:(e,t)=>{var n=H(),r=i(n),a=E(i(r),2),o=i(a);P(o,{variant:`primary`,children:(e,t)=>{w();var n=c(`primary`);u(e,n)},$$slots:{default:!0}});var s=E(o,2);P(s,{variant:`outline`,children:(e,t)=>{w();var n=c(`outline`);u(e,n)},$$slots:{default:!0}});var l=E(s,2);A(l,{command:`npx jixoai-ui add press-button`,label:`copied (press me)`}),y(a),w(2),y(r);var d=E(r,2);M(d,{code:ee,lang:`svelte`,meta:`usage`}),y(n),u(e,n)},$$slots:{default:!0}}),y(K),S(K,e=>N?.(e));var q=E(K,2),pe=i(q);F(pe,{eyebrow:`registry:ui`,title:`section-card`,summary:`The content atom of the site grammar: a bordered card, header block with eyebrow (brand hue, Share Tech Mono, tracked 0.24em), font-nav title, text-pretty summary, and a body snippet slot.`,children:(e,t)=>{var n=W(),r=i(n),a=E(i(r),4);F(a,{eyebrow:`inner`,title:`A card, nested`,children:(e,t)=>{var n=U();u(e,n)},$$slots:{default:!0}}),y(r);var o=E(r,2);M(o,{get code(){return b},lang:`svelte`,meta:`usage`}),y(n),u(e,n)},$$slots:{default:!0}}),y(q),S(q,e=>N?.(e));var J=E(q,2),me=i(J);F(me,{eyebrow:`registry:ui`,title:`theme-toggle`,summary:`light / dark / system in four variants: full (segmented icon+label selector — click a mode to set it), compact (icon + current, cycles), icon (icon only, cycles), text (label only, cycles). Inline SVG icons, no icon-library dependency; drives the shared theme contract (localStorage “theme”, .dark class, colorScheme) with the no-flash bootstrap.`,children:(e,t)=>{var n=G(),r=i(n),a=i(r),o=E(i(a));O(o,{variant:`full`}),y(a);var s=E(a,2),c=E(i(s));O(c,{variant:`compact`}),y(s);var l=E(s,2),d=E(i(l));O(d,{variant:`icon`}),y(l);var f=E(l,2),p=E(i(f));O(p,{variant:`text`}),y(f),y(r);var m=E(r,4);M(m,{code:x,lang:`svelte`,meta:`usage`}),y(n),u(e,n)},$$slots:{default:!0}}),y(J),S(J,e=>N?.(e));var Y=E(J,2),he=i(Y);F(he,{eyebrow:`registry:lib`,title:`reveal`,summary:`The scroll-reveal action. Motion is restrained to exactly two patterns: entrance (opacity + rise, or a rule that draws in) and press physics. Every animated element on this site uses one of them.`,children:(e,t)=>{var a=ie(),o=i(a),s=E(i(o),4);n(s,20,()=>[0,1,2],e=>e,(e,t)=>{var n=re(),a=i(n),o=i(a);y(a),w(2),y(n),S(n,(e,t)=>N?.(e,t),()=>({delay:t*90,rise:12})),p(()=>r(o,`block ${t+1}`)),u(e,n)}),y(s);var c=E(s,2);S(c,e=>N?.(e)),w(2),y(o);var l=E(o,2);M(l,{code:te,lang:`svelte`,meta:`usage`}),y(a),u(e,a)},$$slots:{default:!0}}),y(Y),S(Y,e=>N?.(e));var X=E(Y,2),ge=i(X);F(ge,{eyebrow:`registry:ui`,title:`toc — the Combo ToC`,summary:`You are looking at it. Desktop gets the Rule Tracker: a scroll-progress spine, square weight-driven nodes on level-1 entries, and the pick + parent markers. Mobile gets the Terminal Rail: a glass single-row viewport where page scroll drives the row to the current entry, and expanding changes ONLY the height.`,children:(e,t)=>{var n=ae(),r=i(n),a=E(i(r),4);M(a,{get code(){return C},lang:`svelte`,meta:`contract`}),y(r),y(n),u(e,n)},$$slots:{default:!0}}),y(X),S(X,e=>N?.(e));var Z=E(X,2),_e=i(Z);F(_e,{eyebrow:`registry:ui`,title:`terminal-card`,summary:`The Broadside hero terminal, composed after the openspecui reference: traffic-light title bar, one large typed command, outputs surfacing line by line, 6px hard offset shadow. One-shot typing entrance (never looping), static block cursor per the motion law; prerendered/no-JS shows the settled terminal and reduced motion renders instantly.`,children:(e,t)=>{var n=oe(),r=i(n),a=E(i(r),4),l=i(a);f(l,()=>o(s),e=>{j(e,{barTitle:`quick-start — zsh`,command:`npx jixoai-ui add terminal-card`,outputs:[`terminal-card.svelte → src/lib/ui/`,`one-shot typing · static cursor · no blink`]})}),y(a);var d=E(a,2),p=i(d);P(p,{onclick:()=>g(s,o(s)+1),children:(e,t)=>{w();var n=c(`Replay ↻`);u(e,n)},$$slots:{default:!0}}),y(d),y(r),y(n),u(e,n)},$$slots:{default:!0}}),y(Z),S(Z,e=>N?.(e));var Q=E(Z,2),ve=i(Q);F(ve,{eyebrow:`registry:ui`,title:`hero-section`,summary:`The Broadside hero, composed after the openspecui reference: clamp-scaled bold lead type with a primary accent tail, badge row, a copy-command PRIMARY CTA with copied feedback, and the terminal card in a bottom-aligned second column at min-1100px. The homepage is the full-bleed demo; this is the component rendered in place.`,children:(e,t)=>{var n=se(),r=i(n),a=E(i(r),2),o=i(a);k(o,{eyebrow:`your-app · v0`,titleLead:`Your product line here. `,titleAccent:`Your accent.`,summary:`A compact instance with the real composition rules — swap the copy, keep the law.`,badges:[`badges`,`copy CTA`,`terminal demo`],copyCommand:`npx jixoai-ui init --hue 210`,terminal:e=>{j(e,{barTitle:`demo`,command:`echo hello jixoai`,outputs:[`→ composed from the registry files`]})},$$slots:{terminal:!0}}),y(a);var s=E(a,2);M(s,{code:d,lang:`svelte`,meta:`usage`}),y(r),y(n),u(e,n)},$$slots:{default:!0}}),y(Q),S(Q,e=>N?.(e));var $=E(Q,2),ye=i($);F(ye,{eyebrow:`registry:ui`,title:`app-shell`,summary:`The page scaffold: a sticky, always-visible header band (this page's navigation never scrolls away), the main column, an optional footer band, and a skip link. It also ships the systematized MPA view transitions — cross-document navigation with a persistent site-header and a horizontal-slide + blur crossfade on page-main (navigate this site in Chrome/Edge to feel it; reduced motion crossfades).`,children:(e,t)=>{var n=ce(),r=i(n),a=E(i(r),4);M(a,{code:_,lang:`svelte`,meta:`usage`}),y(r),y(n),u(e,n)},$$slots:{default:!0}}),y($),S($,e=>N?.(e));var be=E($,2),xe=i(be);F(xe,{eyebrow:`registry:ui`,title:`terminal-header / terminal-footer`,summary:`The site shell. The header is an always-dark CRT bezel (never a themed surface) with the brand eyebrow in brand hue, nav pills, and the theme slot at the far right; the footer is a giant ghost wordmark that closes the narrative. This page does not render a second pair — you're wearing one — so here is how they attach instead.`,children:(e,t)=>{var n=le(),r=i(n),a=E(i(r),4);M(a,{code:T,lang:`svelte`,meta:`shell`}),y(r),y(n),u(e,n)},$$slots:{default:!0}}),y(be),S(be,e=>N?.(e)),y(L),y(D),u(e,D)}export{de as component};