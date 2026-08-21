<!--
  jixoai file input (registry/files/ui/file-input.svelte).

  Original request (2026-08-20): “开发 File 选择器 和 Date 选择器两个
  Form 组件”。 file outgrew input.svelte's type="file" lane — that
  component keeps the bare native passthrough; this is the professional
  control for when files are first-class data. Orthogonal intents:

  1. acquisition — press-button outline trigger + visually hidden native
     input (the platform picker; keyboard reaches it through the
     trigger's Enter/Space, focus-visible lights the trigger).
  2. presentation — variants list (rows) / cards (thumbnail grid) /
     compact (summary + disclosure); sizes sm / md / lg scale the
     trigger and the rows through three custom properties.
  3. identity — File[] is the $bindable contract; FileItem adds an id
     and, for images, an object-URL preview cached per File identity
     (WeakMap) and revoked on remove / unmount.
  4. feedback — zero-dependency type glyphs (inline SVG; "</>" is a
     font-nav text glyph like number-input's -/+), B→KB→MB formatting,
     and maxFiles overflow MERGED into the error line — the array is
     never truncated, the caller decides.

  TODO (v1 延展): drag & drop drop-zone target around the trigger.
-->
<script module lang="ts">
  /** One selected file with component-managed identity. */
  export interface FileItem {
    /** the native File object, exactly as the platform handed it over */
    file: File;
    /** internal management id — stable across re-renders per File identity */
    id: string;
    /** image preview URL (URL.createObjectURL); absent for non-images */
    previewUrl?: string;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type FileKind = 'image' | 'video' | 'audio' | 'pdf' | 'code' | 'doc';
  // spec list (.ts/.js/.svelte/.css/.json/.html) plus its obvious siblings
  const CODE_EXTS = new Set(['ts', 'js', 'mjs', 'cjs', 'tsx', 'jsx', 'svelte', 'css', 'json', 'html']);

  interface Props extends Omit<HTMLInputAttributes, 'type' | 'files' | 'accept' | 'multiple'> {
    /** native accept attribute, passed to the platform picker */
    accept?: string;
    /** allow several files; the collection appends instead of replacing */
    multiple?: boolean;
    /** field label; renders label[for] above the trigger */
    label?: string;
    /** error text → aria-invalid + aria-describedby + dashed surfaces */
    error?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** selected files; $bindable — bound ⇒ controlled File[] */
    files?: File[];
    /** list (default) · cards · compact */
    variant?: 'list' | 'cards' | 'compact';
    /** sm 32px · md 40px (default) · lg 48px rows */
    size?: 'sm' | 'md' | 'lg';
    /** overflow limit — renders an error, never truncates the array */
    maxFiles?: number;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    accept,
    multiple = false,
    label,
    id = autoId,
    error,
    files = $bindable([]),
    variant = 'list',
    size = 'md',
    maxFiles,
    class: className = '',
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const listId = $derived(`${id}-list`);
  const maxError = $derived(
    maxFiles != null && files.length > maxFiles ? `too many files — max ${maxFiles}` : undefined
  );
  const shownError = $derived(error ?? maxError);
  const invalid = $derived(shownError != null && shownError !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // ---- identity cache -------------------------------------------------
  // WeakMap keyed by File object: external File[] writes keep stable ids
  // and preview URLs, while removed entries GC with their File.
  const meta = new WeakMap<File, { id: string; previewUrl?: string }>();
  const liveUrls = new Set<string>();
  let uid = 0;

  function fileKind(file: File): FileKind {
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    const dot = file.name.lastIndexOf('.');
    const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : '';
    if (ext === 'pdf') return 'pdf';
    if (CODE_EXTS.has(ext)) return 'code';
    return 'doc';
  }

  /** B → KB → MB, one decimal from KB up */
  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const canPreview = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';

  const items = $derived.by(() => {
    // side-effect guarded: the WeakMap makes re-computation idempotent
    return files.map((file): FileItem => {
      let m = meta.get(file);
      if (!m) {
        const previewUrl =
          canPreview && fileKind(file) === 'image' ? URL.createObjectURL(file) : undefined;
        if (previewUrl) liveUrls.add(previewUrl);
        m = { id: `${id}-f${++uid}`, previewUrl };
        meta.set(file, m);
      }
      return { file, ...m };
    });
  });

  // revoke every URL we created when the component unmounts
  onMount(() => () => {
    for (const url of liveUrls) URL.revokeObjectURL(url);
  });

  // ---- acquisition / removal -------------------------------------------
  let inputEl = $state<HTMLInputElement | null>(null);

  function onInputChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const chosen = Array.from(input.files ?? []);
    if (chosen.length > 0) {
      files = multiple ? [...files, ...chosen] : chosen.slice(0, 1);
    }
    input.value = ''; // re-choosing the same file fires change again
    // forward a caller-supplied change handler from the rest props
    (rest as { onchange?: (event: Event) => void }).onchange?.(event);
  }

  function removeItem(item: FileItem): void {
    const m = meta.get(item.file);
    if (m?.previewUrl) {
      URL.revokeObjectURL(m.previewUrl);
      liveUrls.delete(m.previewUrl);
    }
    meta.delete(item.file);
    files = files.filter((f) => f !== item.file);
  }

  // ---- compact disclosure ------------------------------------------------
  let expanded = $state(false);
  const summary = $derived(
    files.length === 0
      ? 'no file selected'
      : `${files.length} file${files.length === 1 ? '' : 's'} selected`
  );
</script>

{#snippet kindIcon(kind: FileKind)}
  {#if kind === 'image'}
    <!-- 山+太阳: the photo glyph -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16"></rect>
      <circle cx="8.75" cy="9.75" r="1.75"></circle>
      <path d="m2.5 16.75 5.75-5.75 4 4 3.25-3.25 6 6"></path>
    </svg>
  {:else if kind === 'video'}
    <!-- 播放三角 in a frame -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16"></rect>
      <path d="m10.25 9 5 3-5 3z" fill="currentColor"></path>
    </svg>
  {:else if kind === 'audio'}
    <!-- 音符: beam + two note heads -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 17.5V6l10-2.5V15"></path>
      <circle cx="6.75" cy="17.75" r="2.25" fill="currentColor" stroke="none"></circle>
      <circle cx="16.75" cy="15.25" r="2.25" fill="currentColor" stroke="none"></circle>
    </svg>
  {:else if kind === 'pdf'}
    <!-- 文档图形 + text lines -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6 2.5h8l4 4v15H6z"></path>
      <path d="M14 2.5v4h4"></path>
      <path d="M9 12h6M9 15.5h6"></path>
    </svg>
  {:else if kind === 'code'}
    <!-- "</>" as a font-nav text glyph — no SVG needed -->
    <span class="jx-file-code-glyph">&lt;/&gt;</span>
  {:else}
    <!-- 通用文档图形 -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6 2.5h8l4 4v15H6z"></path>
      <path d="M14 2.5v4h4"></path>
    </svg>
  {/if}
{/snippet}

{#snippet rows()}
  <div class="jx-file-rows" class:jx-file-invalid={invalid}>
    {#each items as item (item.id)}
      <div class="jx-file-row">
        <span class="jx-file-icon jx-file-icon-{fileKind(item.file)}" aria-hidden="true">
          {@render kindIcon(fileKind(item.file))}
        </span>
        <span class="jx-file-name" title={item.file.name}>{item.file.name}</span>
        <span class="jx-file-size">{formatSize(item.file.size)}</span>
        <button
          type="button"
          class="jx-file-remove"
          aria-label="remove {item.file.name}"
          onclick={() => removeItem(item)}
        >&times;</button>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet trigger(triggerId?: string)}
  <button
    type="button"
    id={triggerId}
    class="jx-file-trigger"
    class:jx-file-invalid={invalid}
    aria-invalid={invalidAttr}
    aria-describedby={describedBy}
    onclick={() => inputEl?.click()}
  >
    <svg
      class="jx-file-trigger-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 15V3"></path>
      <path d="m7 8 5-5 5 5"></path>
      <path d="M4 21h16"></path>
    </svg>
    {multiple ? 'choose files' : 'choose file'}
  </button>
{/snippet}

<div class="jx-file jx-file-{size} {className}">
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}

  {#if variant === 'compact'}
    <button
      type="button"
      id={id}
      class="jx-file-summary"
      class:jx-file-invalid={invalid}
      aria-expanded={expanded}
      aria-controls={listId}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      onclick={() => (expanded = !expanded)}
    >
      <span class="jx-file-summary-text" class:jx-file-dim={files.length === 0}>{summary}</span>
      <svg
        class="jx-file-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  {:else}
    {@render trigger(id)}
  {/if}

  <!-- restProps first: our wiring must win; caller handlers are forwarded.
       The visually-hidden input stays in the a11y tree (it is the real
       file control), so it carries its own name — the visible label[for]
       points at the trigger button, not here -->
  <input
    bind:this={inputEl}
    {...rest}
    type="file"
    class="jx-file-native"
    aria-label={label || (multiple ? 'choose files' : 'choose file')}
    {accept}
    {multiple}
    onchange={onInputChange}
  />

  {#if variant === 'compact'}
    {#if expanded}
      <div id={listId} class="jx-file-expand">
        {@render trigger()}
        {#if items.length}{@render rows()}{/if}
      </div>
    {/if}
  {:else if variant === 'cards'}
    {#if items.length}
      <div class="jx-file-cards">
        {#each items as item (item.id)}
          <div class="jx-file-card">
            <div class="jx-file-card-thumb">
              {#if item.previewUrl}
                <img class="jx-file-card-img" src={item.previewUrl} alt="" loading="lazy" />
              {:else}
                <span class="jx-file-card-icon jx-file-icon-{fileKind(item.file)}" aria-hidden="true">
                  {@render kindIcon(fileKind(item.file))}
                </span>
              {/if}
            </div>
            <span class="jx-file-card-name" title={item.file.name}>{item.file.name}</span>
            <button
              type="button"
              class="jx-file-card-remove"
              aria-label="remove {item.file.name}"
              onclick={() => removeItem(item)}
            >&times;</button>
          </div>
        {/each}
      </div>
    {/if}
  {:else if items.length}
    {@render rows()}
  {/if}

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-file-error-mark" aria-hidden="true">!</span>{shownError}</p>
  {/if}
</div>

<style>
  /* size knobs: row height, glyph size, text size (list rows + trigger) */
  .jx-file {
    --jx-file-h: 40px;
    --jx-file-icon: 16px;
    --jx-file-text: 12.5px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    width: 100%;
  }
  .jx-file-sm {
    --jx-file-h: 32px;
    --jx-file-icon: 14px;
    --jx-file-text: 11px;
  }
  .jx-file-lg {
    --jx-file-h: 48px;
    --jx-file-icon: 20px;
    --jx-file-text: 14px;
  }
  .jx-file:has(.jx-file-native:disabled) {
    opacity: 0.5;
  }
  .jx-file:has(.jx-file-native:disabled) .jx-file-trigger,
  .jx-file:has(.jx-file-native:disabled) .jx-file-summary {
    cursor: not-allowed;
    pointer-events: none;
  }

  .jx-file-invalid {
    border-style: dashed;
  }

  .jx-label {
    width: fit-content;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  /* ---- the visually hidden native input (family clip) ---------------- */
  .jx-file-native {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* ---- trigger: press-button outline physics -------------------------- */
  .jx-file-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;
    min-height: var(--jx-file-h);
    padding: 0.45rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: inherit;
    font-size: var(--jx-file-text);
    font-weight: 500;
    box-shadow: var(--shadow-xs);
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-file-trigger:hover {
    transform: translate(-2px, -2px);
    background: var(--muted);
    box-shadow: var(--shadow-sm);
  }
  .jx-file-trigger:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  .jx-file-trigger:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-file-trigger-glyph {
    width: calc(var(--jx-file-icon) * 0.9);
    height: calc(var(--jx-file-icon) * 0.9);
    flex: none;
  }

  /* ---- compact summary: the closed select's paint, on a <button> ------ */
  .jx-file-summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    min-height: var(--jx-file-h);
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: inherit;
    font-size: var(--jx-file-text);
    text-align: start;
    cursor: pointer;
    transition: box-shadow 150ms ease-out;
  }
  .jx-file-summary:hover {
    box-shadow: var(--shadow-2xs);
  }
  .jx-file-summary:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-file-summary[aria-expanded='true'] .jx-file-chevron {
    transform: rotate(180deg);
  }
  .jx-file-summary-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: start;
  }
  .jx-file-dim {
    color: var(--muted-foreground);
  }
  .jx-file-chevron {
    flex: none;
    width: 0.75rem;
    height: 0.75rem;
    color: var(--muted-foreground);
    transition: transform 150ms ease-out;
  }
  .jx-file-expand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  /* ---- list rows: hairline-divided rows in one bordered box ----------- */
  .jx-file-rows {
    border: 1px solid var(--border);
    background: var(--background);
  }
  .jx-file-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: var(--jx-file-h);
    padding-inline: 0.75rem;
  }
  .jx-file-row + .jx-file-row {
    border-top: 1px solid var(--border);
  }
  .jx-file-icon {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--jx-file-icon);
    height: var(--jx-file-icon);
    color: var(--muted-foreground);
  }
  .jx-file-icon svg {
    width: 100%;
    height: 100%;
  }
  .jx-file-icon-image {
    color: var(--primary);
  }
  .jx-file-code-glyph {
    font-family: var(--font-nav);
    font-weight: 700;
    font-size: calc(var(--jx-file-icon) * 0.72);
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .jx-file-name {
    flex: 1 1 0%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--jx-file-text);
    color: var(--foreground);
  }
  .jx-file-size {
    flex: none;
    font-size: var(--jx-file-text);
    font-variant-numeric: tabular-nums;
    color: var(--muted-foreground);
  }
  .jx-file-remove {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    font-family: inherit;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    transition: color 150ms ease-out, transform 150ms ease-out;
  }
  .jx-file-remove:hover {
    color: var(--foreground);
  }
  /* press physics: press back into the page */
  .jx-file-remove:active {
    transform: translateY(1px);
  }
  .jx-file-remove:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  /* ---- cards: thumbnail grid, remove on hover ------------------------- */
  .jx-file-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }
  .jx-file-card {
    position: relative;
    width: 7.5rem;
    border: 1px solid var(--border);
    background: var(--background);
  }
  .jx-file-card-thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 4 / 3;
    border-bottom: 1px solid var(--border);
    background: var(--muted);
  }
  .jx-file-card-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .jx-file-card-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--jx-file-icon) * 1.75);
    height: calc(var(--jx-file-icon) * 1.75);
    color: var(--muted-foreground);
  }
  .jx-file-card-icon svg {
    width: 100%;
    height: 100%;
  }
  .jx-file-card-icon.jx-file-icon-image {
    color: var(--primary);
  }
  .jx-file-card-name {
    display: block;
    padding: 0.4rem 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--jx-file-text);
    color: var(--foreground);
  }
  .jx-file-card-remove {
    position: absolute;
    top: 0.25rem;
    inset-inline-end: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--muted-foreground);
    font-family: inherit;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 150ms ease-out, color 150ms ease-out;
  }
  .jx-file-card:hover .jx-file-card-remove,
  .jx-file-card-remove:focus-visible {
    opacity: 1;
  }
  .jx-file-card-remove:hover {
    color: var(--foreground);
  }
  .jx-file-card-remove:active {
    transform: translateY(1px);
  }
  .jx-file-card-remove:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  /* ---- error line (family law) ----------------------------------------- */
  .jx-error {
    display: flex;
    gap: 0.5em;
    margin: 0;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-file-error-mark {
    font-weight: 700;
    color: var(--destructive);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-file-trigger,
    .jx-file-chevron,
    .jx-file-remove,
    .jx-file-card-remove,
    .jx-file-summary {
      transition: none;
    }
  }
</style>
