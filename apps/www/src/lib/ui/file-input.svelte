<!--
  jixoai file input (registry/files/ui/file-input.svelte).

  Original request (2026-08-20): “开发 File 选择器 和 Date 选择器两个
  Form 组件”. Redesign request (2026-08-23): “辨识度太低，和 button
  没什么区别；宽度溢出等问题” — the trigger must read as a FILE PICKER
  at first glance and never push past its host row. The anatomy is
  borrowed from ant-design Upload (trigger + selected-file list below,
  Dragger drop zone, picture-list rows) with LOCAL-picker semantics:
  no network, no upload progress — statuses stay honest validation
  states. Orthogonal intents:

  1. acquisition — two trigger postures over a visually hidden native
     input: `drop` (default; a dashed 1px --border zone with the upload
     glyph, font-nav "CLICK OR DRAG FILES", and a composed accept/max
     hint — dashed is reserved for drop targets + invalid shells, the
     drag-over state swaps the dash to --primary so it can never read
     as an error) and `button` (the compact inline trigger). Both are
     <button>s AND drop targets: Enter/Space open the platform picker,
     a file drag onto them counts enter-depth and accepts the drop
     (accept violations are gate-rejected — they never enter the value).
  2. presentation — ant-style selected-file list: one bordered box of
     hairline rows, each row [square thumb (image object-URL preview
     or kind glyph) | name (ellipsis + title) | size | remove ×].
  3. identity — File[] is the $bindable contract; FileItem adds an id
     and, for images, an object-URL preview cached per File identity
     (WeakMap) and revoked on remove / unmount.
  4. feedback — zero-dependency type glyphs (inline SVG; "</>" is a
     font-nav text glyph), B→KB→MB formatting, maxFiles overflow
     MERGED into the error line (the array is never truncated), and
     dropped-but-rejected files reported through the same line +
     onreject (they never enter the value — the gate is honest).
  5. hardening — InputGroup law: min-width 0 on every flex child,
     max-width 100% shells, ellipsized names with title tooltips; the
     component survives 390px hosts with unbroken filenames.
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
  import type { Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type FileKind = 'image' | 'video' | 'audio' | 'pdf' | 'code' | 'doc';
  // spec list (.ts/.js/.svelte/.css/.json/.html) plus its obvious siblings
  const CODE_EXTS = new Set(['ts', 'js', 'mjs', 'cjs', 'tsx', 'jsx', 'svelte', 'css', 'json', 'html']);

  interface Props
    extends Omit<
      HTMLInputAttributes,
      'type' | 'files' | 'accept' | 'multiple' | 'disabled' | 'size'
    > {
    /** native accept attribute, passed to the platform picker; dropped
        files that violate it are gate-rejected (never enter the value) */
    accept?: string;
    /** allow several files; the collection appends instead of replacing */
    multiple?: boolean;
    /** field label; renders label[for] above the trigger */
    label?: string;
    /** error text → aria-invalid + aria-describedby + dashed surfaces */
    error?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** freezes the trigger, drops and per-row removal */
    disabled?: boolean;
    /** selected files; $bindable — bound ⇒ controlled File[] */
    files?: File[];
    /** drop (default): dashed drop zone · button: compact inline trigger */
    variant?: 'drop' | 'button';
    /** sm 32px · md 40px (default) · lg 48px rows */
    size?: 'sm' | 'md' | 'lg';
    /** overflow limit — renders an error, never truncates the array */
    maxFiles?: number;
    /** secondary hint inside the drop zone; defaults to a composed
        "accept: … · max: N · single file" line from the other props */
    hint?: string;
    /** fires with files a DROP brought in that violated accept */
    onreject?: (rejected: File[]) => void;
    /** replaces the drop zone's glyph + title + hint content */
    zone?: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    accept,
    multiple = false,
    label,
    id = autoId,
    error,
    disabled = false,
    files = $bindable([]),
    variant = 'drop',
    size = 'md',
    maxFiles,
    hint,
    onreject,
    zone,
    class: className = '',
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const listId = $derived(`${id}-list`);
  // drop-gate rejection notice (set by commit(), cleared by the picker /
  // removal) — declared before the deriveds that read it
  let rejectNotice = $state<string | undefined>(undefined);
  const maxError = $derived(
    maxFiles != null && files.length > maxFiles ? `too many files — max ${maxFiles}` : undefined
  );
  const shownError = $derived(error ?? maxError ?? rejectNotice);
  const invalid = $derived(shownError != null && shownError !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // composed zone hint: the honest machine-readable contract of the field
  const zoneHint = $derived.by(() => {
    if (hint !== undefined) return hint;
    const parts: string[] = [];
    if (accept) parts.push(`accept: ${accept}`);
    if (maxFiles != null) parts.push(`max: ${maxFiles} file${maxFiles === 1 ? '' : 's'}`);
    if (!multiple) parts.push('single file');
    return parts.length > 0 ? parts.join(' · ') : undefined;
  });

  // ---- identity cache -------------------------------------------------
  // WeakMap keyed by File object: external File[] writes keep stable ids
  // and preview URLs, while removed entries GC with their File.
  // a Map (not WeakMap): the external-removal effect below ITERATES it to
  // revoke dropped previews, and it prunes every stale entry itself
  const meta = new Map<File, { id: string; previewUrl?: string }>();
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

  // external removal (Codex r1): a caller splicing the BOUND files array
  // never passes through removeItem/clearAll — release the previews of
  // every file that left the array, else its object URL lives until
  // unmount
  $effect(() => {
    const live = new Set(files);
    for (const [file, m] of meta) {
      if (live.has(file)) continue;
      if (m.previewUrl) {
        URL.revokeObjectURL(m.previewUrl);
        liveUrls.delete(m.previewUrl);
      }
      meta.delete(file);
    }
  });

  // ---- accept gate (drops only — the platform picker filters itself) ---
  function matchesAccept(file: File): boolean {
    if (!accept) return true;
    const patterns = accept.split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    for (const pattern of patterns) {
      if (pattern.startsWith('.')) {
        if (name.endsWith(pattern)) return true;
      } else if (pattern.endsWith('/*')) {
        if (type.startsWith(pattern.slice(0, -1))) return true;
      } else if (type === pattern) {
        return true;
      }
    }
    return false;
  }

  // ---- acquisition: picker + drop + removal -----------------------------
  let inputEl = $state<HTMLInputElement | null>(null);

  function commit(chosen: File[]): void {
    rejectNotice = undefined;
    const accepted = accept ? chosen.filter(matchesAccept) : chosen;
    const rejected = accept ? chosen.filter((f) => !matchesAccept(f)) : [];
    if (rejected.length > 0) {
      rejectNotice = `${rejected.length} dropped file${rejected.length === 1 ? '' : 's'} rejected — accept: ${accept}`;
      onreject?.(rejected);
    }
    if (accepted.length > 0) {
      files = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
    }
  }

  function onInputChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const chosen = Array.from(input.files ?? []);
    if (chosen.length > 0) {
      rejectNotice = undefined;
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

  function clearAll(): void {
    for (const item of items) {
      const m = meta.get(item.file);
      if (m?.previewUrl) {
        URL.revokeObjectURL(m.previewUrl);
        liveUrls.delete(m.previewUrl);
      }
      meta.delete(item.file);
    }
    files = [];
    rejectNotice = undefined;
  }

  // ---- drag-and-drop: enter-depth counter against flicker ---------------
  let dragDepth = $state(0);
  const dragging = $derived(dragDepth > 0 && !disabled);

  function hasFileDrag(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes('Files') ?? false;
  }

  function onDragEnter(event: DragEvent): void {
    if (disabled || !hasFileDrag(event)) return;
    dragDepth += 1;
  }

  function onDragOver(event: DragEvent): void {
    if (disabled || !hasFileDrag(event)) return;
    event.preventDefault(); // without it the drop never fires
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  function onDragLeave(): void {
    if (dragDepth > 0) dragDepth -= 1;
  }

  function onDrop(event: DragEvent): void {
    dragDepth = 0;
    if (disabled) return;
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    if (dropped.length > 0) commit(dropped);
  }
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

{#snippet triggerShell(triggerId: string)}
  {#if variant === 'drop'}
    <button
      type="button"
      id={triggerId}
      class="jx-file-zone"
      class:jx-file-over={dragging}
      class:jx-file-invalid={invalid}
      aria-label={label || (multiple ? 'choose files' : 'choose file')}
      aria-describedby={describedBy}
      disabled={disabled}
      onclick={() => inputEl?.click()}
      ondragenter={onDragEnter}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
    >
      {#if zone}
        {@render zone()}
      {:else}
        <span class="jx-file-zone-glyph" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 15V3.5"></path>
            <path d="m7 8.5 5-5 5 5"></path>
            <path d="M4 15.5v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"></path>
          </svg>
        </span>
        <span class="jx-file-zone-title">{multiple ? 'click or drag files' : 'click or drag file'}</span>
        {#if zoneHint}<span class="jx-file-zone-hint">{zoneHint}</span>{/if}
      {/if}
    </button>
  {:else}
    <button
      type="button"
      id={triggerId}
      class="jx-file-trigger"
      class:jx-file-over={dragging}
      class:jx-file-invalid={invalid}
      aria-label={label || (multiple ? 'choose files' : 'choose file')}
      aria-describedby={describedBy}
      disabled={disabled}
      onclick={() => inputEl?.click()}
      ondragenter={onDragEnter}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
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
  {/if}
{/snippet}

<div class="jx-file jx-file-{size} {className}" class:jx-file-disabled={disabled}>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}

  {@render triggerShell(id)}

  <!-- restProps first: our wiring must win; caller handlers are forwarded.
       ONE accessible control (Codex r1): the visible trigger IS the picker
       for tabs and AT — the clipped native input drops out of the tab
       order and the a11y tree (tabindex -1 + aria-hidden), so keyboard
       and screen-reader users never meet an invisible duplicate. The
       trigger carries the name + aria-describedby (the error line —
       invalid state reads through it; aria-invalid itself trips Svelte's
       button-role warning, so it stays off); the visible label[for]
       points at the trigger too -->
  <input
    bind:this={inputEl}
    {...rest}
    type="file"
    class="jx-file-native"
    tabindex={-1}
    aria-hidden="true"
    {accept}
    {multiple}
    {disabled}
    onchange={onInputChange}
  />

  {#if items.length}
    <ul id={listId} class="jx-file-list" class:jx-file-invalid={invalid} aria-label="selected files">
      {#each items as item (item.id)}
        <li class="jx-file-row">
          <span class="jx-file-thumb" aria-hidden="true">
            {#if item.previewUrl}
              <img class="jx-file-thumb-img" src={item.previewUrl} alt="" loading="lazy" />
            {:else}
              <span class="jx-file-icon jx-file-icon-{fileKind(item.file)}">
                {@render kindIcon(fileKind(item.file))}
              </span>
            {/if}
          </span>
          <span class="jx-file-name" title={item.file.name}>{item.file.name}</span>
          <span class="jx-file-size">{formatSize(item.file.size)}</span>
          <button
            type="button"
            class="jx-file-remove"
            aria-label="remove {item.file.name}"
            disabled={disabled}
            onclick={() => removeItem(item)}
          >&times;</button>
        </li>
      {/each}
      {#if items.length > 1 && !disabled}
        <li class="jx-file-clearrow">
          <button type="button" class="jx-file-clear" onclick={clearAll}>remove all</button>
        </li>
      {/if}
    </ul>
  {/if}

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-file-error-mark" aria-hidden="true">!</span>{shownError}</p>
  {/if}
</div>

<style>
  /* size knobs: row height, thumb size, glyph size, text size */
  .jx-file {
    --jx-file-h: 40px;
    --jx-file-thumb: 28px;
    --jx-file-icon: 16px;
    --jx-file-text: 12.5px;
    --jx-file-zone-pad: 1.5rem;
    --jx-file-zone-glyph: 22px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    width: 100%;
    /* InputGroup hardening: shrink inside flex/grid hosts and never push
       past the host row — long filenames ellipsize inside instead */
    min-width: 0;
    max-width: 100%;
  }
  .jx-file-sm {
    --jx-file-h: 32px;
    --jx-file-thumb: 20px;
    --jx-file-icon: 14px;
    --jx-file-text: 11px;
    --jx-file-zone-pad: 1rem;
    --jx-file-zone-glyph: 18px;
  }
  .jx-file-lg {
    --jx-file-h: 48px;
    --jx-file-thumb: 36px;
    --jx-file-icon: 18px;
    --jx-file-text: 14px;
    --jx-file-zone-pad: 2rem;
    --jx-file-zone-glyph: 26px;
  }
  .jx-file-disabled {
    opacity: 0.5;
  }
  .jx-file-disabled .jx-file-zone,
  .jx-file-disabled .jx-file-trigger {
    cursor: not-allowed;
  }

  /* dashed = drop target (idle, --border) — the invalid shell and the
     drag-over state are the two other dashed/solid signals; drag-over
     swaps to --primary so it can never be mistaken for an error */
  .jx-file-invalid {
    border-style: dashed;
  }

  .jx-label {
    width: fit-content;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  /* ---- drop zone: the unmistakable file-picker surface ---------------- */
  .jx-file-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: calc(var(--jx-file-h) * 2.25);
    padding: var(--jx-file-zone-pad);
    border: 1px dashed var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: inherit;
    cursor: pointer;
    box-shadow: var(--shadow-2xs);
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      border-color 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-file-zone:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-xs);
  }
  .jx-file-zone:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  .jx-file-zone:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-file-zone:disabled {
    cursor: not-allowed;
    pointer-events: none;
  }
  /* drag-over: the dash turns primary + the surface lifts and tints —
     press physics from the trigger law, magnetism from ant's Dragger */
  .jx-file-zone.jx-file-over {
    border-color: var(--primary);
    background: var(--muted);
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-xs);
  }
  .jx-file-zone.jx-file-over .jx-file-zone-glyph,
  .jx-file-zone.jx-file-over .jx-file-zone-title {
    color: var(--primary);
  }
  .jx-file-zone.jx-file-invalid {
    border-style: dashed;
    border-color: var(--destructive);
  }
  .jx-file-zone-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--jx-file-zone-glyph);
    height: var(--jx-file-zone-glyph);
    color: var(--muted-foreground);
    transition: color 150ms ease-out;
  }
  .jx-file-zone-glyph svg {
    width: 100%;
    height: 100%;
  }
  .jx-file-zone-title {
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--foreground);
    max-width: 100%;
    overflow-wrap: anywhere;
    text-align: center;
    transition: color 150ms ease-out;
  }
  .jx-file-zone-hint {
    font-family: var(--font-nav);
    font-size: 10.5px;
    letter-spacing: 0.08em;
    color: var(--muted-foreground);
    max-width: 100%;
    overflow-wrap: anywhere;
    text-align: center;
  }

  /* ---- button variant: compact inline trigger -------------------------- */
  .jx-file-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;
    max-width: 100%;
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
      background-color 150ms ease-out,
      border-color 150ms ease-out;
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
  .jx-file-trigger:disabled {
    cursor: not-allowed;
    pointer-events: none;
  }
  .jx-file-trigger.jx-file-over {
    border-style: dashed;
    border-color: var(--primary);
    background: var(--muted);
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sm);
  }
  .jx-file-trigger.jx-file-invalid {
    border-style: dashed;
    border-color: var(--destructive);
  }
  .jx-file-trigger-glyph {
    width: calc(var(--jx-file-icon) * 0.9);
    height: calc(var(--jx-file-icon) * 0.9);
    flex: none;
    color: var(--muted-foreground);
  }
  .jx-file-trigger.jx-file-over .jx-file-trigger-glyph {
    color: var(--primary);
  }

  /* ---- selected-file list: ant picture-list rows in one bordered box --- */
  .jx-file-list {
    min-width: 0;
    max-width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid var(--border);
    background: var(--background);
  }
  .jx-file-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    min-height: var(--jx-file-h);
    padding-inline: 0.75rem;
  }
  .jx-file-row + .jx-file-row {
    border-top: 1px solid var(--border);
  }
  .jx-file-thumb {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--jx-file-thumb) + 2px);
    height: calc(var(--jx-file-thumb) + 2px);
    border: 1px solid var(--border);
    background: var(--muted);
    overflow: hidden;
  }
  .jx-file-thumb-img {
    display: block;
    width: var(--jx-file-thumb);
    height: var(--jx-file-thumb);
    object-fit: cover;
  }
  .jx-file-icon {
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
  .jx-file-remove:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }

  /* "remove all" tail row for multi-file lists */
  .jx-file-clearrow {
    border-top: 1px solid var(--border);
  }
  .jx-file-clear {
    display: inline-flex;
    align-items: center;
    min-height: calc(var(--jx-file-h) * 0.75);
    padding: 0.15rem 0;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 10.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 150ms ease-out;
  }
  .jx-file-clear:hover {
    color: var(--foreground);
  }
  .jx-file-clear:active {
    transform: translateY(1px);
  }
  .jx-file-clear:focus-visible {
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
    .jx-file-zone,
    .jx-file-trigger,
    .jx-file-remove,
    .jx-file-clear,
    .jx-file-zone-glyph,
    .jx-file-zone-title {
      transition: none;
    }
  }
</style>
