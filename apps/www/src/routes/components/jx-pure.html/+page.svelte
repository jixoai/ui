<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { onMount } from 'svelte';

  // ToC lives in +page.ts (firstpaint era: the layout's chrome snippet
  // owns the rail from page data) — keep the section ids in sync there.

  // the REAL registry copies this site runs, inlined as text (?raw —
  // the same-source law; no fetch, identical dev/build behavior)
  import tokenCssRaw from '$lib/jixoai.css?raw';
  import pureCssRaw from '$lib/jx-pure.css?raw';

  const install = `# the componentless face — one css, zero js
npx jixoai-ui add jx-pure`;

  const usage = `<!-- tokens first, then the face -->
<link rel="stylesheet" href="jixoai.css" />
<link rel="stylesheet" href="jx-pure.css" />

<!-- mount the class anywhere — the subtree's bare HTML is jixoai now -->
<main class="jx-pure">
  <h1>Static page</h1>
  <p>No build. No framework. No JS.</p>
  <form>
    <label for="q">search</label>
    <input id="q" type="search" placeholder="grep…" />
    <button type="submit">go</button>
  </form>
</main>

<!-- dark: the token sheet's class, on the root or any ancestor -->
<html class="dark">
  …
</html>

<!-- scoped light island inside a dark page -->
<div class="jx-light jx-pure">…stays light…</div>`;

  // the 3-line system-follow bootstrap (JS, host-owned — jx-pure ships none).
  const bootstrap = `const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark', sysDark);
// ^ the host's OWN bootstrap — jx-pure deliberately ships no JS (Codex D4)`;

  const autoDark = `<!-- OS-follow dark with ZERO JS — the generated Part D:
     tokens flip under prefers-color-scheme: dark; an explicit
     .dark always wins; .jx-light islands stay light -->
<html class="jx-pure jx-auto-dark">
  …
</html>`;

  const shadowRecipe = `// a CustomElement adopting the face inside its own shadow root
// (document css never crosses the boundary — bring the two sheets):
const style = document.createElement('style');
// tokenCss/pureCss = the two registry files' text (bundled ?raw, or
// fetched from resolved URLs — beware: dev-time ?url serves a JS
// module, not the css text)
style.textContent = tokenCss.replace(/^@import.*$/gm, '') + pureCss;
this.shadowRoot.append(style);
// ^ a <style> node, NOT replaceSync: constructable sheets THROW on the
// token sheet's build-time at-rules (@theme/@custom-variant), while a
// style node parses tolerantly. Strip the fontsource @imports (bare
// specifiers cannot resolve in shadow css; fonts are document-scoped)`;

  // the live CustomElement fixture: real shadow root, real style nodes
  // fed from the real registry text (fonts ride the document)
  onMount(() => {
    if (customElements.get('jx-pure-island')) return;
    customElements.define(
      'jx-pure-island',
      class extends HTMLElement {
        constructor() {
          super();
          const root = this.attachShadow({ mode: 'open' });
          root.innerHTML = `<div class="jx-pure" style="max-width:22rem">
  <p><label>shadow lane</label><br />
    <input type="text" placeholder="painted inside the shadow root" /></p>
  <p>
    <button type="button">shadow button</button>
    <label><input type="checkbox" checked /> check</label>
  </p>
</div>`;
          // strip the fontsource @imports (bare specifiers cannot
          // resolve inside a shadow style; the document owns the fonts
          // anyway), then inject as <style> nodes — tolerant of the
          // token sheet's build-time at-rules, unlike constructable
          // sheets whose replaceSync would throw on them
          const stripped = tokenCssRaw.replace(/^@import.*$/gm, '');
          for (const text of [stripped, pureCssRaw]) {
            const style = document.createElement('style');
            style.textContent = text;
            root.append(style);
          }
        }
      },
    );
  });
</script>

<svelte:head>
  <title>jx-pure · jixoai-ui</title>
  <meta
    name="description"
    content="jx-pure — the componentless face of jixoai-ui: one stylesheet, mount the jx-pure class on any DOM, and the subtree's bare native elements (typography, buttons, forms, disclosure, lists, tables) carry the jixoai law. Pure CSS, zero JS, static-page friendly; dark mode rides the token sheet's .dark / .jx-light."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:lib · Engines &amp; Theme"
        title="jx-pure — the componentless face"
        summary="One stylesheet, the whole jixoai face, zero JS. Mount the jx-pure class on any DOM and the subtree's BARE native elements get the law — inspired by Pico CSS (classless element defaults) and daisyUI (semantic class vocabulary). No framework, no build step, no jixoai-ui knowledge: plain HTML in, jixoai out. The opt-in class vocabulary from the former native-form sheet rides along verbatim (Part A), so the Tier-2 components consume the same file."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">pure CSS · 0 JS</span>
          <span class="pill">:where() + @layer components</span>
          <span class="pill">type allowlist</span>
          <span class="pill">.dark / .jx-light</span>
        </div>
      </SectionCard>
    </div>

    <div id="getting-started" data-reveal="">
      <SectionCard
        family="getting-started"
        headerRegion="getting-started"
        eyebrow="install"
        title="Getting started"
        summary="jx-pure consumes the token custom properties, so the token sheet comes first. Two link tags and one class — that is the entire runtime. It also drops into any CustomElement's shadow root: import the same two sheets from the shadow <style> (document CSS never crosses the shadow boundary)."
      >
        <div class="grid gap-4 min-[760px]:grid-cols-2">
          <CodeBlock code={install} lang="bash" meta="terminal" />
          <CodeBlock code={usage} lang="html" meta="static page" />
        </div>
      </SectionCard>
    </div>

    <div id="typography" data-reveal="">
      <SectionCard
        family="typography"
        headerRegion="typography"
        eyebrow="demo"
        title="Typography"
        summary="Headings, prose, quotes, code, marks and rules — the document-flow elements preflight usually strips, restored with the jixoai law: mono-first fonts, 1px var(--border) edges, muted-foreground for the secondary voice. Everything below is BARE HTML inside a single .jx-pure div — view source, there is not one utility class in the demo."
      >
        <div class="jx-pure" style="max-width: 46rem">
          <h3>Heading level three</h3>
          <p>
            A paragraph of ordinary copy. The quick brown fox jumps over the lazy dog while
            <strong>strong</strong> and <small>small</small> keep their voices —
            <a href="#typography">a primary link</a> underlines on hover, and
            <code>inline code</code> sits in a muted box. Press <kbd>⌘K</kbd> to open the palette.
          </p>
          <blockquote>
            The platform already built the semantics — the separator, the quote, the term list.
            jx-pure only paints them.
          </blockquote>
          <pre><code>const law = 'one stylesheet, zero js';
document.body.classList.add('jx-pure');</code></pre>
          <p><mark>Marked text</mark> rides the secondary hue at 45% — a token mix, never a hardcoded yellow.</p>
          <hr />
          <p>Below the rule, the document keeps flowing.</p>
        </div>
      </SectionCard>
    </div>

    <div id="buttons" data-reveal="">
      <SectionCard
        family="buttons"
        headerRegion="buttons"
        eyebrow="demo"
        title="Buttons"
        summary="The .jx-press physics restated element-scoped: hover grows the token shadow over a muted fill, active presses +1px into the page with the *-press twin — no WAAPI, no second geometry law. Links that must LOOK like buttons take the explicit .jx-button class (never an auto-styled a[role=button] — CSS cannot add command semantics)."
      >
        <div class="grid gap-6 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">inside .jx-pure — the law</span>
            <div class="jx-pure flex flex-wrap items-center gap-3">
              <button type="button">plain button</button>
              <button type="button" disabled>disabled</button>
              <input type="button" value="input button" />
              <a class="jx-button" href="#buttons">a.jx-button</a>
              <a href="#buttons">plain link</a>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">outside the scope — untouched UA paint</span>
            <div class="flex flex-wrap items-center gap-3">
              <button type="button">plain button</button>
              <button type="button" disabled>disabled</button>
              <a href="#buttons">plain link</a>
            </div>
            <span class="text-muted-foreground text-[11px]">
              opt-in is structural: no class on the ancestor, no jixoai face
            </span>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="forms" data-reveal="">
      <SectionCard
        family="forms"
        headerRegion="forms"
        eyebrow="demo"
        title="Forms"
        summary="The migrated native-form law, now element-scoped under a TYPE ALLOWLIST: text-like lanes take the bordered box; checkbox/radio/range/color are full pure-CSS repaints (native state, label and FormData keep working — appearance:none strips paint only). select keeps its platform arrow by default; .jx-select opts into the gradient chevron (single-select only). hidden/file are never touched."
      >
        <div class="jx-pure grid gap-5 min-[760px]:grid-cols-2" style="max-width: 60rem">
          <form onsubmit={(e) => e.preventDefault()}>
            <fieldset>
              <legend>account</legend>
              <p><label for="f-user">username</label><br />
                <input id="f-user" name="user" type="text" placeholder="gaubee" /></p>
              <p><label for="f-mail">email</label><br />
                <input id="f-mail" name="mail" type="email" placeholder="you@host.tld" /></p>
              <p><label for="f-pass">password</label><br />
                <input id="f-pass" name="pass" type="password" placeholder="••••••••" /></p>
            </fieldset>
            <p><label for="f-bio">bio</label><br />
              <textarea id="f-bio" name="bio" placeholder="a line or two…"></textarea></p>
            <p>
              <button type="submit">create account</button>
              <button type="reset">reset</button>
            </p>
          </form>
          <div>
            <p><label for="f-sel">select — platform arrow (default)</label><br />
              <select id="f-sel">
                <option>first option</option>
                <option>second option</option>
                <option>third option</option>
              </select></p>
            <p><label for="f-sel2">select.jx-select — the opt-in chevron</label><br />
              <select id="f-sel2" class="jx-select">
                <option>first option</option>
                <option>second option</option>
              </select></p>
            <p><label for="f-date">date</label> <label for="f-num">number</label><br />
              <input id="f-date" type="date" /> <input id="f-num" type="number" min="0" placeholder="42" /></p>
            <p><label for="f-range">range</label><br />
              <input id="f-range" type="range" min="0" max="100" value="40" /></p>
            <p>
              <label><input type="checkbox" checked /> checkbox</label><br />
              <label><input type="checkbox" /> unchecked</label><br />
              <label><input type="radio" name="f-radio" checked /> radio one</label>
              <label><input type="radio" name="f-radio" /> radio two</label>
            </p>
            <p><label for="f-color">color</label><br />
              <input id="f-color" type="color" value="#007924" /></p>
            <p><label for="f-off">disabled lane</label><br />
              <input id="f-off" type="text" placeholder="not allowed" disabled /></p>
            <!-- the ONE-opacity-owner law (Codex review A3): the disabled
                 fieldset dims to .5 and the controls inside stay at 1 —
                 two stacked .5 layers would composite to ~.25 -->
            <fieldset disabled>
              <legend>locked section</legend>
              <p><label for="f-locked">group-disabled lane</label><br />
                <input id="f-locked" type="text" placeholder="one opacity owner: the fieldset" /></p>
              <p><button type="button">frozen</button></p>
            </fieldset>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="disclosure" data-reveal="">
      <SectionCard
        family="disclosure"
        headerRegion="disclosure"
        eyebrow="demo"
        title="details / summary"
        summary="Document-flow disclosure only — dialog, popover and tooltip surfaces stay Tier-2 (their top-layer + closing-order laws are component territory). The summary row carries a bordered square marker that statically swaps + ↔ −; the visible focus ring is never replaced by the marker; no open/close animation ships (progressive enhancement, reduced-motion safe by construction)."
      >
        <div class="jx-pure" style="max-width: 40rem">
          <details>
            <summary>What is included in v1?</summary>
            <p>Typography, links, buttons, the form lanes, disclosure, lists, and tables — everything on this page.</p>
          </details>
          <details open>
            <summary>And what is deliberately not?</summary>
            <p>Floating surfaces (dialog / popover / tooltip — Tier-2 territory) and select popup internals. The platform keeps those: their top-layer and closing-order laws are component ground.</p>
          </details>
        </div>
      </SectionCard>
    </div>

    <div id="nav-lists" data-reveal="">
      <SectionCard
        family="nav-lists"
        headerRegion="nav-lists"
        eyebrow="demo"
        title="nav · lists · dl"
        summary="Nav links read as chrome — foreground at rest, primary + underline on hover (prose links are primary at rest). ol/ul get their document-flow markers back (preflight strips them) themed muted; dl pairs as a two-column definition grid with the nav-font term voice."
      >
        <div class="grid gap-6 min-[760px]:grid-cols-2">
          <div class="jx-pure" style="max-width: 28rem">
            <nav>
              <a href="#nav-lists">docs</a> · <a href="#nav-lists">registry</a> · <a href="#nav-lists">tokens</a>
            </nav>
            <ul>
              <li>an unordered item</li>
              <li>another one, marker themed muted</li>
            </ul>
            <ol>
              <li>ordered steps keep decimals</li>
              <li>second step</li>
            </ol>
          </div>
          <div class="jx-pure" style="max-width: 28rem">
            <dl>
              <dt>tier 0</dt>
              <dd>jx-pure — the componentless face (this page)</dd>
              <dt>tier 1</dt>
              <dd>the class vocabulary, Part A of the same file</dd>
              <dt>tier 2</dt>
              <dd>the Svelte components consuming the classes</dd>
            </dl>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="tables" data-reveal="">
      <SectionCard
        family="tables"
        headerRegion="tables"
        eyebrow="demo"
        title="Tables"
        summary="The bordered grid law: 1px var(--border) cells, nav-font small-caps headers on a muted fill, hover leans rows via a token mix. Caption rides the bottom as the documentation voice."
      >
        <div class="jx-pure" style="max-width: 44rem">
          <table>
            <caption>engine coverage for the v1 repaints</caption>
            <thead>
              <tr><th>element</th><th>chromium</th><th>firefox</th><th>webkit</th></tr>
            </thead>
            <tbody>
              <tr><td>checkbox / radio</td><td>verified: clip-path + dot</td><td>same law, unverified build</td><td>same law, unverified build</td></tr>
              <tr><td>range</td><td>verified: webkit pseudos</td><td>-moz pseudos authored</td><td>webkit pseudos authored</td></tr>
              <tr><td>date/time indicator</td><td>verified: mask glyph</td><td>native indicator</td><td>native indicator</td></tr>
              <tr><td>select.jx-select</td><td>verified: gradient chevron</td><td>same law, unverified build</td><td>same law, unverified build</td></tr>
              <tr><td>progress / meter</td><td>verified: track family + token fills</td><td>-moz bar pseudos authored</td><td>native bar (webkit pseudos)</td></tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted-foreground mt-3 text-[13px] leading-6">
          Chromium is the verified engine of record for v1 — the other columns state the authored
          law, not a verified build. Every repaint degrades to native paint under forced-colors,
          so unverified engines never lose the control.
        </p>
      </SectionCard>
    </div>

    <div id="media-flow" data-reveal="">
      <SectionCard
        family="media-flow"
        headerRegion="media-flow"
        eyebrow="demo"
        title="progress · meter · output · figure"
        summary="The completion round (2026-08-24): progress and meter ride the 8px track family — meter maps its semantics onto tokens (optimum=primary, suboptimal=secondary, even-less-good=destructive; no hardcoded traffic lights), progress's indeterminate state trades the fill for a sliding stripe that parks under reduced motion. output is the mono result lane; figure carries the bordered plate with the caption law below, and media never overflows its lane."
      >
        <div class="grid gap-6 min-[760px]:grid-cols-2">
          <div class="jx-pure flex flex-col gap-4" style="max-width: 30rem">
            <div>
              <small>progress · 60%</small><br />
              <progress value="60" max="100"></progress>
            </div>
            <div>
              <small>progress · indeterminate (stripe; static under reduced motion)</small><br />
              <progress max="100"></progress>
            </div>
            <div>
              <small>meter · optimum / suboptimum / even-less-good</small><br />
              <meter value="70" min="0" max="100" low="30" high="90" optimum="80"></meter>
              <meter value="20" min="0" max="100" low="30" high="90" optimum="80"></meter>
              <meter value="95" min="0" max="100" low="30" high="90" optimum="80"></meter>
            </div>
            <form onsubmit={(e) => e.preventDefault()} class="flex flex-wrap items-center gap-2">
              <label for="mf-a">a</label>
              <input id="mf-a" type="number" value="6" style="width: 5rem" />
              <label for="mf-b">b</label>
              <input id="mf-b" type="number" value="7" style="width: 5rem" />
              <button type="button" onclick={(e) => { const f = e.currentTarget.closest('form'); f.querySelector('output').value = Number(f.querySelector('#mf-a').value) * Number(f.querySelector('#mf-b').value); }}>a × b =</button>
              <output name="result" for="mf-a mf-b">42</output>
            </form>
          </div>
          <div class="jx-pure" style="max-width: 30rem">
            <figure>
              <img src="/blueprints/jx-pure.svg" alt="the jx-pure blueprint scene" style="background: var(--muted)" />
              <figcaption>figure · the componentless face — its own blueprint</figcaption>
            </figure>
            <p><small>media (img / video) never exceeds its lane; the plate's 1px border is the figure law.</small></p>
          </div>
        </div>
      </SectionCard>
    </div>

<div id="switch" data-reveal="">
  <SectionCard
    family="switch"
    headerRegion="switch"
    eyebrow="demo"
    title="switch — role=switch on a checkbox"
    summary="The Pico contract, zero classes: put role='switch' on a bare checkbox inside .jx-pure and it becomes the jixoai switch — square track, square sliding thumb, native state/label/FormData untouched (appearance:none strips paint only). Checked rides primary; the Tier-2 toggle component remains the rich lane (labels, postures, sizes) for component consumers."
  >
    <div class="jx-pure flex flex-wrap items-center gap-6" style="max-width: 40rem">
      <label><input type="checkbox" role="switch" /> auto-save</label>
      <label><input type="checkbox" role="switch" checked /> notifications</label>
      <label><input type="checkbox" role="switch" disabled /> locked</label>
      <label><input type="checkbox" role="switch" aria-invalid="true" checked /> failing</label>
    </div>
  </SectionCard>
</div>

--- #validation section ---

<div id="validation" data-reveal="">
  <SectionCard
    family="validation"
    headerRegion="validation"
    eyebrow="law"
    title="Validation states — the aria-invalid matrix"
    summary="The Pico state contract on the jixoai monochrome palette: aria-invalid='false' leans every accent primary (the one-hue positive); aria-invalid='true' FLIPS every primary accent to destructive — lanes go dashed with the '!' ink glyph, valid lanes carry the '✓' glyph, checkbox/radio/switch checked fills flip, and the range's fill + thumb flip. Native :invalid is deliberately NOT hooked — the state is always the author's explicit aria (no empty-required surprises)."
  >
    <div class="jx-pure grid gap-5 min-[760px]:grid-cols-2" style="max-width: 52rem">
      <form onsubmit={(e) => e.preventDefault()} class="flex flex-col gap-3">
        <label for="v-ok">valid lane (aria-invalid='false')</label>
        <input id="v-ok" type="text" value="gaubee" aria-invalid="false" />
        <label for="v-bad">invalid lane (aria-invalid='true')</label>
        <input id="v-bad" type="text" value="nope!" aria-invalid="true" />
        <label for="v-sel-bad">invalid select</label>
        <select id="v-sel-bad" aria-invalid="true"><option>pick…</option></select>
      </form>
      <div class="flex flex-col gap-3">
        <label><input type="checkbox" aria-invalid="true" checked /> invalid checkbox</label>
        <label><input type="checkbox" aria-invalid="false" checked /> valid checkbox</label>
        <label><input type="radio" name="v-radio" aria-invalid="true" checked /> invalid radio</label>
        <label><input type="checkbox" role="switch" aria-invalid="true" checked /> invalid switch</label>
        <div>
          <small>invalid range — fill + thumb flip destructive</small><br />
          <input type="range" min="0" max="100" value="70" aria-invalid="true" />
        </div>
      </div>
    </div>
  </SectionCard>
</div>

    <div id="dark-mode" data-reveal="">
      <SectionCard
        family="dark-mode"
        headerRegion="dark-mode"
        eyebrow="law"
        title="Dark mode"
        summary="Theme rides the token sheet's classes — .dark on the root (or any ancestor, or the scope itself) flips every token; the scope root carries color-scheme so native pickers and scrollbars follow. NO hand-copied tokens and NO bootstrap JS: OS-following dark for zero-JS pages is the GENERATED .jx-auto-dark variant (below). The panels are the SAME bare markup — the only difference is the theme class."
      >
        <div class="grid gap-6 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-2">
            <span class="text-muted-foreground text-[11px]">&lt;div class="jx-pure"&gt; — light (inherits :root)</span>
            <div class="jx-pure" style="max-width: 26rem">
              <p><label for="d-l">label</label><br />
                <input id="d-l" type="text" placeholder="light lane" /></p>
              <p>
                <button type="button">button</button>
                <label><input type="checkbox" checked /> check</label>
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-muted-foreground text-[11px]">&lt;div class="dark jx-pure"&gt; — scoped dark island</span>
            <div class="dark jx-pure" style="max-width: 26rem">
              <p><label for="d-d">label</label><br />
                <input id="d-d" type="text" placeholder="dark lane" /></p>
              <p>
                <button type="button">button</button>
                <label><input type="checkbox" checked /> check</label>
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-muted-foreground text-[11px]">&lt;div class="jx-light jx-pure"&gt; — forced light under a dark root</span>
            <div class="dark jx-pure" style="padding: 0.75rem; max-width: 26rem">
              <div class="jx-light jx-pure">
                <p><label for="d-lf">label</label><br />
                  <input id="d-lf" type="text" placeholder="stays light" /></p>
                <p>
                  <button type="button">button</button>
                  <label><input type="checkbox" checked /> check</label>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="border-border mt-5 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">System-follow, still zero JS — .jx-auto-dark</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            The zero-JS answer to OS-following dark: mount
            <code class="text-accent">jx-auto-dark</code> next to the scope class and Part D's
            <em>generated</em> media-query variant flips the tokens — derived 1:1 from the token
            sheet's .dark block by <code class="text-accent">scripts/gen-jx-auto-dark.mjs</code>
            (single source; the parity suite fails on drift). An explicit <code class="text-accent">.dark</code>
            always wins, <code class="text-accent">.jx-light</code> islands stay light:
          </p>
          <div class="mt-3 max-w-xl">
            <CodeBlock code={autoDark} lang="html" meta="zero-JS system follow" />
          </div>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            Prefer a theme toggle over OS-follow? The host's own 3-line bootstrap remains the
            fully-JS route:
          </p>
          <div class="mt-3 max-w-xl">
            <CodeBlock code={bootstrap} lang="js" meta="host-owned bootstrap (the JS alternative)" />
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="custom-element" data-reveal="">
      <SectionCard
        family="custom-element"
        headerRegion="custom-element"
        eyebrow="demo"
        title="CustomElement — the shadow-root adoption"
        summary="Document css never crosses the shadow boundary, so a CustomElement brings the two sheets ITSELF: inline the registry copies' text (bundled ?raw here) into <style> nodes inside the shadow root — style nodes parse tolerantly where constructable sheets would throw on the token sheet's build-time at-rules. The fixture below is LIVE — a real <jx-pure-island> element defined by this page, carrying the real token + face sheets this site runs. Fonts stay document-level (@font-face is document-scoped; the shadow inherits the loaded families)."
      >
        <div class="grid gap-6 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">the live island (shadow internals, view source: it's empty light DOM)</span>
            <jx-pure-island></jx-pure-island>
            <span class="text-muted-foreground text-[11px]">
              the SAME markup sits outside any shadow root below — painted by the page's own
              import, not the island's sheets (two adoptions, one law):
            </span>
            <div class="jx-pure" style="max-width: 22rem">
              <p><label for="ce-lane">light-dom lane</label><br />
                <input id="ce-lane" type="text" placeholder="painted by the page import" /></p>
              <p><button type="button">light-dom button</button></p>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <CodeBlock code={shadowRecipe} lang="js" meta="the adoption recipe" />
            <p class="text-muted-foreground text-[13px] leading-6">
              Resource note: inject as <code class="text-accent">&lt;style&gt;</code> nodes, not
              constructable sheets — <code class="text-accent">replaceSync</code> throws on the
              token sheet's build-time at-rules while a style node parses tolerantly; strip the
              fontsource <code class="text-accent">@import</code>s (bare specifiers cannot resolve
              inside a shadow style; fonts belong to the document anyway).
            </p>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="scope-laws" data-reveal="">
      <SectionCard
        family="scope-laws"
        headerRegion="scope-laws"
        eyebrow="law"
        title="Scope laws"
        summary="The contract edges, so nothing surprises you later."
      >
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3 text-[13px] leading-6">
            <h3 class="text-[15px] font-bold tracking-tight">Opt-in is structural</h3>
            <p class="text-muted-foreground">
              Everything rides <code class="text-accent">:where(.jx-pure)</code> inside
              <code class="text-accent">@layer components</code> — the scope class contributes zero
              specificity, so Tailwind utilities and any unlayered author css override it cheaply.
              Outside the wrapper the UA paint stands (see the buttons section's contrast column).
            </p>
            <div class="jx-pure flex flex-wrap items-center gap-3">
              <button type="button">the law paints me</button>
              <button type="button" class="bg-muted">…but one utility wins</button>
            </div>
            <p class="text-muted-foreground">
              same .jx-pure subtree, one Tailwind class on the second button — the utilities
              layer beats the components layer regardless of source order.
            </p>
            <h3 class="text-[15px] font-bold tracking-tight">Shadow DOM needs its own import</h3>
            <p class="text-muted-foreground">
              Document css never crosses the shadow boundary — the live adoption fixture is the
              CustomElement section above.
            </p>
            <h3 class="text-[15px] font-bold tracking-tight">The escape hatch — data-jx-pure-skip</h3>
            <p class="text-muted-foreground">
              A subtree that must keep its OWN paint (third-party widget, legacy island) mounts
              <code class="text-accent">data-jx-pure-skip</code>: every B-law surface inside
              <code class="text-accent">revert</code>s to the USER-AGENT cascade — author styling
              steps aside entirely. It is fully native; re-opting one element back in needs a
              selector that beats the hatch's (0,2,1).
            </p>
            <div class="jx-pure flex flex-wrap items-center gap-3">
              <button type="button">the law</button>
              <span data-jx-pure-skip style="display: inline-flex; align-items: center; gap: 0.75rem">
                <button type="button">skipped button</button>
                <input class="jx-input" type="text" placeholder="even .jx-input reverts" style="width: 14rem" aria-label="skipped jx-input" />
              </span>
            </div>
            <h3 class="text-[15px] font-bold tracking-tight">The type allowlist</h3>
            <p class="text-muted-foreground">
              Text-like styling catches ONLY the 13 text types + no-type inputs. hidden / file /
              checkbox / radio / range / color / button-family are never caught by the box law —
              they have their own lanes or stay native.
            </p>
          </div>
          <div class="flex flex-col gap-3 text-[13px] leading-6">
            <h3 class="text-[15px] font-bold tracking-tight">Deprecated: native-form → jx-pure</h3>
            <p class="text-muted-foreground">
              The native-form sheet lives on verbatim as Part A of this file. The
              <code class="text-accent">native-form</code> registry item is a same-source alias for
              one release window (old target <code class="text-accent">@lib/native-form.css</code>);
              input / range / number-input now declare
              <code class="text-accent">@jixoai/jx-pure</code>.
            </p>
            <h3 class="text-[15px] font-bold tracking-tight">Still deferred</h3>
            <p class="text-muted-foreground">
              Select popup internals; floating surfaces (dialog / popover / tooltip — Tier-2
              territory); disclosure open/close animation; input repaints beyond the allowlist;
              the Firefox/WebKit measured matrix (authored laws + forced-colors fallbacks are in
              place — the engine table states exactly what is verified). Forced-colors:
              custom-painted controls revert to appearance:auto so the system palette speaks.
            </p>
            <h3 class="text-[15px] font-bold tracking-tight">Focus is the host's law</h3>
            <p class="text-muted-foreground">
              jx-pure paints focus rings only where repainting would otherwise destroy them
              (checkbox / radio / range / color / summary / lanes). Plain buttons and links keep
              the host's focus law — the site's base layer here, the UA ring on static pages.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</div>
