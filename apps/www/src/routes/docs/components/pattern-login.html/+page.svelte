<!--
  Docs page for pattern-login (2026-08-30, terminal-patterns).
  Intents:
  1. Pattern summary from the registry catalog (CATALOG lookup, fail-loud).
  2. Two live demos: the ssh login card and the OTP second-factor
     screen (the two variants the pattern ships).
  3. Accessibility notes: labels, error lanes, the reveal contract
     (the eye belongs to the Input — no pattern-local fallback).
  4. Usage CodeBlock shared with the canvas drawer.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import PatternLogin from '$lib/ui/pattern-login/pattern-login.svelte';
  import PatternLoginOtp from '$lib/ui/pattern-login/pattern-login-otp.svelte';

  import patternLoginSource from '$lib/ui/pattern-login/pattern-login.svelte?raw';
  import patternLoginOtpSource from '$lib/ui/pattern-login/pattern-login-otp.svelte?raw';

  // catalog sync-binding: the summary IS the registry description; a
  // miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'pattern-login');
  if (!entry) {
    throw new Error('catalog miss: "pattern-login" has no registry meta — fix registry.json');
  }

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import PatternLogin from '@ui/pattern-login.svelte';
  import PatternLoginOtp from '@ui/pattern-login/pattern-login-otp.svelte';
${close}

<PatternLogin host="deploy.jixoai.dev" command="npx jixoai-ui init"
  onsignin={() => gotoOtpStep()} />

<!-- the second factor: the joined code submits through onverify -->
<PatternLoginOtp host="deploy.jixoai.dev" length={6}
  hint="code sent to operator@deploy.jixoai.dev"
  onverify={(code) => verify(code)} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/pattern-login/pattern-login.svelte', content: patternLoginSource },
    { name: 'registry/files/ui/pattern-login/pattern-login-otp.svelte', content: patternLoginOtpSource },
    { name: 'src/lib/pattern-login-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Pattern login · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui pattern-login component: the ssh-style login card — user/host lanes over plain Input slots, the passphrase reveal riding the input's own toggle, an OTP second-factor screen over input-otp, and the copyable npx bootstrap footer."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Layout"
      title="pattern-login — ssh user@host, the card"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">input + innerInlineStart slots</span>
        <span class="pill">input-otp 2FA</span>
        <span class="pill">press-button submit</span>
        <span class="pill">bootstrap copy footer</span>
      </div>
    </SectionCard>
  </div>

  <div id="demo" data-reveal="">
    <ComponentCanvas
      title="pattern-login"
      stage="center"
      description="The login card: the echo line composes the live user@host as you type, the passphrase field carries the Input's own reveal eye (starts hidden — the value is never revealed by default), and the footer is the copyable bootstrap command — the terminal idiom's magic link."
      sourceUrl={registrySourceUrl('pattern-login')}
      install="pattern-login"
      files={canvasFiles}
    >
      <PatternLogin host="deploy.jixoai.dev" command="npx jixoai-ui init --hue 210" />
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            type into the <code class="text-accent">user</code> lane — the header echo recomposes
            <code>ssh …@deploy.jixoai.dev</code> live. Press the eye in the passphrase shell: only
            the input's type flips, focus and value stay put (there is no pattern-local toggle —
            the reveal is the Input's contract). <code class="text-accent">connect</code> submits
            the form; <code class="text-accent">copy</code> in the footer puts the bootstrap
            command on the clipboard and flips to the copied surface for 1.4s.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="otp" data-reveal="">
    <ComponentCanvas
      title="pattern-login — the 2FA variant"
      stage="center"
      description="The second-factor screen: input-otp owns the slot mechanics (auto-advance, paste distribution, the joined form value — incomplete codes submit empty, never a partial lie), the verify step is a press-button, and the same card law carries the frame."
      sourceUrl={registrySourceUrl('pattern-login')}
      install="pattern-login"
      files={canvasFiles}
    >
      <PatternLoginOtp host="deploy.jixoai.dev" hint="code sent to operator@deploy.jixoai.dev — expires 05:00" />
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            type or paste a six-digit code — the slots advance themselves; the footer line states
            the bridge contract: the joined code submits as one value under
            <code>name="otp"</code>, an incomplete code submits empty.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Two screens, one story: the card signs in, the OTP screen verifies. Pair them by swapping on onsignin."
    >
      <CodeBlock code={usage} lang="svelte" meta="pattern-login usage" />
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="Every lane is a labeled native input; the echo line is decorative (aria-hidden) so nothing is announced twice; the reveal is the Input's own aria-pressed toggle."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Walks user → host → passphrase eye → connect → footer copy in reading order' },
          { key: 'Enter / Space', action: 'Activates the focused control — the eye flips the type, connect submits, copy hits the clipboard' },
        ]}
        aria={[
          { name: 'label[for]', value: 'every lane', description: 'user / host / passphrase each render a real label wired to the native input' },
          { name: 'aria-hidden', value: 'true', description: 'On the decorative ssh echo line — the typed fields are the truth' },
          { name: 'aria-pressed', value: 'the input reveal', description: 'Mirrors the passphrase visibility state (starts false — hidden)' },
          { name: 'error lanes', value: 'Input error prop', description: 'Pass an error string to any lane: aria-invalid + aria-describedby + the dashed ! message line, all the Input\'s own' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="PatternLogin props — plus PatternLoginOtp (the named export) below."
    >
      <PropsTable
        props={[
          { name: 'host', type: 'string', default: "'jixoai.dev'", description: 'The host the card addresses (echo line + host lane value).' },
          { name: 'user', type: 'string', default: "''", description: 'The user lane; bindable — the echo line mirrors it live.' },
          { name: 'password', type: 'string', default: "''", description: 'The passphrase lane; bindable. The reveal is the Input\'s own (default on).' },
          { name: 'command', type: 'string', default: "'npx jixoai-ui init'", description: 'The bootstrap footer command — copy payload.' },
          { name: 'onsignin', type: '() => void', default: '—', description: 'Fires on submit; the card never navigates on its own.' },
          { name: 'children', type: 'Snippet', default: '—', description: 'Extra lanes between the passphrase and the submit.' },
          { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the card root.' },
          { name: 'PatternLoginOtp: host', type: 'string', default: "'jixoai.dev'", description: 'The host being verified (hint + echo).' },
          { name: 'PatternLoginOtp: length', type: 'number', default: '6', description: 'Slot count of the one-time code.' },
          { name: 'PatternLoginOtp: value', type: 'string', default: "''", description: 'The joined code; bindable.' },
          { name: 'PatternLoginOtp: hint', type: 'string', default: "''", description: 'One-line context under the slots (where the code was sent).' },
          { name: 'PatternLoginOtp: onverify', type: '(code: string) => void', default: '—', description: 'Fires with the joined code on submit.' },
        ]}
      />
    </SectionCard>
  </div>
</div>
