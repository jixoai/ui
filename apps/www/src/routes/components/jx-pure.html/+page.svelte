<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import { reveal } from '$lib/reveal';

  // ToC outline: the eight demo sections below, in page order.
  const tocSections = [
    { id: 'getting-started', label: 'Getting started' },
    { id: 'typography', label: 'Typography' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'forms', label: 'Forms' },
    { id: 'disclosure', label: 'details / summary' },
    { id: 'nav-lists', label: 'nav · lists · dl' },
    { id: 'tables', label: 'Tables' },
    { id: 'dark-mode', label: 'Dark mode' },
    { id: 'scope-laws', label: 'Scope laws' },
  ];

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
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
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

    <div id="getting-started" data-reveal="" use:reveal>
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

    <div id="typography" data-reveal="" use:reveal>
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

    <div id="buttons" data-reveal="" use:reveal>
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

    <div id="forms" data-reveal="" use:reveal>
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

    <div id="disclosure" data-reveal="" use:reveal>
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
            <p>progress, meter, output and figure repaints; floating surfaces; select popup internals. The platform keeps those until a cross-engine contract exists.</p>
          </details>
        </div>
      </SectionCard>
    </div>

    <div id="nav-lists" data-reveal="" use:reveal>
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

    <div id="tables" data-reveal="" use:reveal>
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

    <div id="dark-mode" data-reveal="" use:reveal>
      <SectionCard
        family="dark-mode"
        headerRegion="dark-mode"
        eyebrow="law"
        title="Dark mode"
        summary="v1 rides ONLY the token sheet's theme classes — zero token copies, zero prefers-color-scheme auto-dark, zero bootstrap JS inside jx-pure (Codex D4: a copied .dark block would drift, and a hidden bootstrap is not 'zero JS'). .dark on the root (or any ancestor, or the scope itself) flips every token; the scope root carries color-scheme so native pickers and scrollbars follow. Both panels below are the SAME bare markup — the only difference is the theme class."
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
          <h3 class="text-[15px] font-bold tracking-tight">System-follow is the host's 3 lines</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            A static page that wants to follow the OS theme ships its own bootstrap before first
            paint — jx-pure deliberately never does this for you:
          </p>
          <div class="mt-3 max-w-xl">
            <CodeBlock code={bootstrap} lang="js" meta="host-owned bootstrap" />
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="scope-laws" data-reveal="" use:reveal>
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
              Document css never crosses the shadow boundary. A CustomElement that wants the face
              imports the same two sheets inside its own shadow &lt;style&gt; (or adoptedStyleSheets) —
              resource paths resolve against the import site.
            </p>
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
            <h3 class="text-[15px] font-bold tracking-tight">Deferred from v1</h3>
            <p class="text-muted-foreground">
              progress / meter / output / figure repaints; select popup internals; floating
              surfaces (dialog / popover / tooltip — Tier-2 territory); disclosure open/close
              animation. Forced-colors: custom-painted controls revert to appearance:auto so the
              system palette speaks.
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
