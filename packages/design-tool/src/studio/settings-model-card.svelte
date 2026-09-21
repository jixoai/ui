<!--
  @jixoai/ui-design (studio) — one model entry's collapsible edit card
  (settings-model-parity T4; skill-creator-v2 ModelListItem ported to
  the studio's registry language).

  Behaviors (the reference's, kernel-adapted):
  1. COLLAPSED header: dirty dot + display name + inline test verdict +
     test/edit/remove icon buttons (the reference's 44px-target trio).
  2. ID completion: a datalist over the parent's candidate pool (the
     current provider's models first, namespace ids purged elsewhere);
     manual entry stays free-form.
  3. PREFILL hook: switching to a KNOWN catalog id re-seats the fields
     the user has not touched (name/context/max output/efforts — the
     efforts ride the kernel-vocabulary clamp); leaving the catalog
     clears the untouched prefills so stale fields never persist.
  4. TOKEN SHORTHAND: context/max-out are text fields; blur/Enter
     commits parseTokenShorthand and re-displays the normalized form;
     an invalid value flags the card (the parent's save gate blocks).
  5. PER-MODEL TEST: probes the route's endpoint via the parent's
     dsh-test lane with THIS model's id (the /v1/models listing
     verdict — no generation cost); without a stored key a test-only
     key input appears (direct probe, never persisted).
-->
<script lang="ts">
  import Icon from '#jixoai/icon';
  import IconButton from '#jixoai/icon-button';
  import Input from '#jixoai/input';

  import {
    THINKING_LEVELS,
    clampModelEfforts,
    formatTokenCount,
    parseTokenShorthand,
    readableModelName,
    type ModelCandidate,
  } from './settings-panel-lib.ts';

  /** the parent's editable draft shape (optional fields ''-initialized) */
  export interface ModelDraftEntry {
    id: string;
    name?: string;
    efforts?: string[];
    contextWindow?: number | string;
    maxOutputTokens?: number | string;
  }

  /** one probe outcome (the dsh-test lane's body) */
  export interface ModelTestResult {
    ok: boolean;
    latencyMs?: number;
    detail: string;
    modelListed?: boolean;
  }

  interface Props {
    entry: ModelDraftEntry;
    /** the route's saved twin (null = a brand-new entry) — the dirty dot */
    saved: ModelDraftEntry | null;
    candidates: ModelCandidate[];
    /** test lane parameters */
    provider: string;
    /** a STORED key exists for this provider (server-side fact — the
     *  probe rides provider injection, no key in the request) */
    keyPresent: boolean;
    /** the CREATE FORM's route key draft (R13 law): when non-empty the
     *  card probes with it DIRECTLY (never stored yet) — it must not be
     *  conflated with keyPresent (Codex r2 P1: the form key used to
     *  masquerade as a stored key, sending anonymous probes) */
    formKey?: string;
    disabled: boolean;
    onchange: (next: ModelDraftEntry) => void;
    onremove: () => void;
    onvalidity: (valid: boolean) => void;
    /** the parent's dsh-test bridge: (modelId, directKey | null) */
    ontest: (modelId: string, directKey: string | null) => Promise<ModelTestResult | null>;
    /** mount expanded (a fresh "+ add model" row) */
    initialexpanded?: boolean;
  }

  let {
    entry,
    saved,
    candidates,
    provider,
    keyPresent,
    formKey = '',
    disabled,
    onchange,
    onremove,
    onvalidity,
    ontest,
    initialexpanded = false,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let expanded = $state(initialexpanded || entry.id === '');

  /* local text drafts (committed to the parent on blur/Enter — never
     per keystroke, so the parent's dirty compare stays stable).
     svelte-ignore state_referenced_locally: init-from-props ONCE is the
     law — the parent keys this card by a stable nonce, so the entry the
     card was mounted with is the entry it edits for its whole life
     (Codex r1 P1: an index key used to rebind these mid-life) */
  // svelte-ignore state_referenced_locally
  let idText = $state(entry.id);
  // svelte-ignore state_referenced_locally
  let nameText = $state(entry.name ?? '');
  // svelte-ignore state_referenced_locally
  let contextText = $state(entry.contextWindow !== undefined && entry.contextWindow !== '' ? formatTokenCount(Number(entry.contextWindow)) : '');
  // svelte-ignore state_referenced_locally
  let maxOutText = $state(entry.maxOutputTokens !== undefined && entry.maxOutputTokens !== '' ? formatTokenCount(Number(entry.maxOutputTokens)) : '');
  // svelte-ignore state_referenced_locally
  let effortsText = $state((entry.efforts ?? []).join(', '));
  // svelte-ignore state_referenced_locally
  // svelte-ignore state_referenced_locally
  let nameTouched = $state(entry.name !== undefined && entry.name !== '');
  let contextTouched = $state(false);
  let maxOutTouched = $state(false);
  /** the user hand-edited efforts — catalog prefills never override
   *  them afterwards (Codex r1 P1: the missing twin of the other
   *  touched flags let one model's efforts leak into the next) */
  let effortsTouched = $state(false);
  let contextInvalid = $state(false);
  let maxOutInvalid = $state(false);
  /** the id the last prefill served — the reset anchor on id change */
  // svelte-ignore state_referenced_locally
  let matchedId = $state<string | null>(entry.id === '' ? null : entry.id);
  let testing = $state(false);
  let testResult = $state<ModelTestResult | null>(null);
  let testOnlyKey = $state('');

  // svelte-ignore state_referenced_locally
  const datalistId = `model-ids-${provider.replace(/[^a-z0-9-]/gi, '')}-${Math.random().toString(36).slice(2, 8)}`;

  const idTrimmed = $derived(idText.trim());
  const idValid = $derived(idTrimmed !== '');
  const candidate = $derived(candidates.find((c) => c.id === idTrimmed) ?? null);
  const effortsInvalid = $derived(
    effortsText.trim() !== '' && effortsText.split(',').some((part) => {
      const token = part.trim();
      return token !== '' && !(THINKING_LEVELS as readonly string[]).includes(token);
    }),
  );
  const valid = $derived(idValid && !contextInvalid && !maxOutInvalid && !effortsInvalid);
  const headerName = $derived(entry.name ?? (entry.id !== '' ? readableModelName(entry.id) : 'new model'));
  const dirty = $derived(
    saved === null
      || saved.id !== entry.id
      || (saved.name ?? '') !== (entry.name ?? '')
      || (saved.contextWindow ?? '') !== (entry.contextWindow ?? '')
      || (saved.maxOutputTokens ?? '') !== (entry.maxOutputTokens ?? '')
      || (saved.efforts ?? []).join(',') !== (entry.efforts ?? []).join(','),
  );
  const hasFormKey = $derived(formKey.trim().length > 0);
  /** the catalog says this model has no reasoning effort — a hint, not a
   *  block (the kernel vocabulary gate stays the law; r2 P2 parity) */
  const effortsUnsupported = $derived(candidate?.supportsReasoningEffort === false);
  const testDisabled = $derived(disabled || testing || !idValid || (!keyPresent && !hasFormKey && testOnlyKey.trim() === ''));

  $effect(() => {
    onvalidity(valid);
  });

  /** catalog effort clamp rides the LIB's single source (Codex r2 P2:
   *  a local twin here drifted from catalogModelDefaults) */
  function onIdInput(value: string): void {
    idText = value;
    const trimmed = value.trim();
    const next = candidates.find((c) => c.id === trimmed);
    const patch: Partial<ModelDraftEntry> = { id: trimmed };
    if (next !== undefined) {
      const switched = trimmed !== matchedId;
      if (switched) {
        // switching to a DIFFERENT known id: untouched fields re-seat
        // (efforts included — the previous model's tiers must not leak
        // into the new one, Codex r1 P1)
        nameTouched = false;
        contextTouched = false;
        maxOutTouched = false;
        effortsTouched = false;
        matchedId = trimmed;
      }
      if (!nameTouched) {
        nameText = next.name ?? readableModelName(next.id);
        patch.name = nameText;
      }
      if (!contextTouched) {
        if (next.contextWindow !== undefined) {
          contextText = formatTokenCount(next.contextWindow);
          patch.contextWindow = next.contextWindow;
        } else if (entry.contextWindow !== undefined && entry.contextWindow !== '') {
          contextText = '';
          patch.contextWindow = '';
        }
      }
      if (!maxOutTouched) {
        if (next.maxOutputTokens !== undefined) {
          maxOutText = formatTokenCount(next.maxOutputTokens);
          patch.maxOutputTokens = next.maxOutputTokens;
        } else if (entry.maxOutputTokens !== undefined && entry.maxOutputTokens !== '') {
          maxOutText = '';
          patch.maxOutputTokens = '';
        }
      }
      // efforts prefill: after a SWITCH (touched flags reset) the new
      // model's clamped tiers re-seat over the residue; on a RE-type of
      // the same id an already-configured entry keeps its efforts (the
      // reference law — hand-work survives, switching re-derives)
      if (!effortsTouched && (switched || entry.efforts === undefined)) {
        patch.efforts = clampModelEfforts(next.effortTiers);
        effortsText = patch.efforts.join(', ');
      }
    } else {
      // left the catalog: the anchor resets so returning to a known id
      // re-runs the prefill; untouched prefills clear (no stale fields —
      // efforts included: an unknown model's capabilities are unknown)
      matchedId = null;
      if (!nameTouched) {
        nameText = '';
        if (entry.name !== undefined) patch.name = '';
      }
      if (!contextTouched && entry.contextWindow !== undefined && entry.contextWindow !== '') {
        contextText = '';
        patch.contextWindow = '';
      }
      if (!maxOutTouched && entry.maxOutputTokens !== undefined && entry.maxOutputTokens !== '') {
        maxOutText = '';
        patch.maxOutputTokens = '';
      }
      if (!effortsTouched && entry.efforts !== undefined) {
        effortsText = '';
        patch.efforts = undefined;
      }
    }
    onchange({ ...entry, ...patch });
  }

  function onNameInput(value: string): void {
    nameText = value;
    nameTouched = true;
    onchange({ ...entry, name: value.trim() === '' ? '' : value.trim() });
  }

  /** token fields: blur/Enter parses, re-displays normalized, flags invalid */
  function commitToken(field: 'contextWindow' | 'maxOutputTokens'): void {
    const raw = field === 'contextWindow' ? contextText : maxOutText;
    const setInvalid = (flag: boolean): void => {
      if (field === 'contextWindow') contextInvalid = flag;
      else maxOutInvalid = flag;
    };
    const trimmed = raw.trim();
    if (trimmed === '') {
      setInvalid(false);
      onchange({ ...entry, [field]: '' });
      return;
    }
    const parsed = parseTokenShorthand(trimmed);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (field === 'contextWindow') {
      contextText = formatTokenCount(parsed);
      contextTouched = true;
      onchange({ ...entry, contextWindow: parsed });
    } else {
      maxOutText = formatTokenCount(parsed);
      maxOutTouched = true;
      onchange({ ...entry, maxOutputTokens: parsed });
    }
  }

  function onEffortsInput(value: string): void {
    effortsText = value;
    effortsTouched = true;
    const parts = value.split(',').map((part) => part.trim()).filter((part) => part !== '');
    onchange({ ...entry, efforts: parts.length === 0 ? undefined : parts });
  }

  async function runTest(): Promise<void> {
    if (testing || !idValid) return;
    // key priority (the reference's R13 ladder): the FORM key rides
    // directly > a stored key rides provider injection > the card's
    // test-only input rides directly (never stored)
    const direct = hasFormKey ? formKey.trim() : keyPresent ? null : testOnlyKey.trim();
    if (!keyPresent && !hasFormKey && direct === '') return;
    testing = true;
    testResult = null;
    const result = await ontest(idTrimmed, direct);
    testing = false;
    if (result !== null) testResult = result;
  }
</script>

<div class="dsh-model-card" aria-label="model {entry.id}">
  <!-- collapsed header: dirty dot + name + verdict + the icon trio -->
  <div class="dsh-model-head">
    <span class="dsh-model-name-line">
      {#if dirty}<span class="dsh-dirty-dot" title="unsaved changes"></span>{/if}
      <span class="dsh-model-name" title={entry.id}>{headerName}</span>
      {#if !expanded && testResult !== null}
        <span class="dsh-model-verdict {testResult.ok ? 'ok' : 'fail'}">
          {testResult.ok ? `ok${testResult.modelListed === false ? ' · not in listing' : ''}` : `failed — ${testResult.detail}`}
        </span>
      {/if}
    </span>
    <span class="dsh-model-trio">
      {#snippet iconTest()}<Icon name="plugZap" size={14} />{/snippet}
      <IconButton
        iconOnly
        icon={iconTest}
        text={testing ? 'testing…' : 'test connection'}
        disabled={testDisabled}
        onclick={() => void runTest()}
      />
      {#snippet iconEdit()}<Icon name={expanded ? 'chevronUp' : 'pencil'} size={14} />{/snippet}
      <IconButton iconOnly icon={iconEdit} text={expanded ? 'collapse model form' : 'edit model fields'} disabled={disabled} onclick={() => (expanded = !expanded)} />
      {#snippet iconRemove()}<Icon name="trash2" size={14} />{/snippet}
      <IconButton iconOnly icon={iconRemove} class="dsh-remove-model" text="remove model" disabled={disabled} onclick={() => onremove()} />
    </span>
  </div>

  {#if expanded}
    <div class="dsh-model-form">
      <label class="dsh-field">
        <span class="dsh-label">model id</span>
        <Input placeholder="glm-5.3" list={datalistId} value={idText} oninput={(event) => onIdInput((event.currentTarget as HTMLInputElement).value)} />
        <datalist id={datalistId}>
          {#each candidates.slice(0, 200) as c (c.id)}<option value={c.id}>{c.name ?? ''}</option>{/each}
        </datalist>
      </label>
      <label class="dsh-field">
        <span class="dsh-label">name</span>
        <Input placeholder={readableModelName(idTrimmed || entry.id)} value={nameText} oninput={(event) => onNameInput((event.currentTarget as HTMLInputElement).value)} />
      </label>
      <label class="dsh-field">
        <span class="dsh-label">context <span class="dsh-hint">(200k / 0.5M / 131072)</span></span>
        <Input
          class={contextInvalid ? 'dsh-invalid' : ''}
          placeholder="200k"
          value={contextText}
          oninput={(event) => (contextText = (event.currentTarget as HTMLInputElement).value)}
          onblur={() => commitToken('contextWindow')}
          onkeydown={(event) => { if (event.key === 'Enter') commitToken('contextWindow'); }}
        />
      </label>
      <label class="dsh-field">
        <span class="dsh-label">max output <span class="dsh-hint">(32k / 131072)</span></span>
        <Input
          class={maxOutInvalid ? 'dsh-invalid' : ''}
          placeholder="32k"
          value={maxOutText}
          oninput={(event) => (maxOutText = (event.currentTarget as HTMLInputElement).value)}
          onblur={() => commitToken('maxOutputTokens')}
          onkeydown={(event) => { if (event.key === 'Enter') commitToken('maxOutputTokens'); }}
        />
      </label>
      <label class="dsh-field dsh-span2">
        <span class="dsh-label">efforts <span class="dsh-hint">(comma-separated · {THINKING_LEVELS.filter((l) => l !== 'off').join('/')})</span></span>
        <Input class={effortsInvalid ? 'dsh-invalid' : ''} placeholder="low, high" value={effortsText} oninput={(event) => onEffortsInput((event.currentTarget as HTMLInputElement).value)} />
      </label>
      {#if effortsUnsupported}
        <p class="dsh-field-error dsh-span2" role="note">catalog marks this model as not supporting reasoning effort</p>
      {/if}
      {#if (contextInvalid || maxOutInvalid)}
        <p class="dsh-field-error dsh-span2" role="alert">invalid token value — plain numbers or shorthand like 253k / 0.5M</p>
      {/if}
      {#if effortsInvalid}
        <p class="dsh-field-error dsh-span2" role="alert">efforts must be kernel levels ({THINKING_LEVELS.join('/')}) — an illegal level gets the profile refused</p>
      {/if}
      {#if !keyPresent && !hasFormKey}
        <label class="dsh-field dsh-span2">
          <span class="dsh-label">api key (test only — never stored)</span>
          <Input type="password" placeholder="paste a key to probe" bind:value={testOnlyKey} />
        </label>
      {/if}
      {#if expanded && testResult !== null}
        <p class="dsh-model-verdict dsh-span2 {testResult.ok ? 'ok' : 'fail'}" role="status">
          {#if testResult.ok}{testResult.modelListed === true ? 'ok — the model is listed at the endpoint' : testResult.modelListed === false ? 'ok — endpoint reachable, model not in listing' : `ok — ${testResult.detail}`}{:else}failed — {testResult.detail}{/if}
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dsh-model-card {
    border: 1px solid var(--border, #262320);
    padding: 0.375rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .dsh-model-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-width: 0;
  }
  .dsh-model-name-line {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 0;
    flex: 1;
  }
  .dsh-model-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
  }
  .dsh-model-trio {
    display: inline-flex;
    flex: none;
    align-items: center;
  }
  .dsh-dirty-dot {
    flex: none;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--warning, #d9a25f);
  }
  .dsh-model-form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem 0.75rem;
  }
  .dsh-span2 {
    grid-column: span 2;
  }
  .dsh-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .dsh-label {
    font-size: 0.6875rem;
    color: var(--muted-foreground, #6f6759);
  }
  .dsh-hint {
    opacity: 0.75;
  }
  .dsh-model-verdict {
    font-size: 0.6875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dsh-model-verdict.ok {
    color: var(--success, #a9c4a9);
  }
  .dsh-model-verdict.fail {
    color: var(--destructive, #e08585);
  }
  .dsh-field-error {
    margin: 0;
    font-size: 0.6875rem;
    color: var(--destructive, #e08585);
  }
  .dsh-model-card :global(.dsh-invalid) {
    border-color: var(--destructive, #e08585);
  }
  /* the icon trio's remove — destructive ink on the button itself */
  :global(.dsh-remove-model) {
    color: var(--destructive, #e08585);
  }
  :global(.dsh-remove-model):hover {
    color: var(--destructive, #e08585);
  }
</style>
