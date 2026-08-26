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

  tw4 (2026-08-24): the static paint (size knobs as arbitrary-property
  utilities per size, zone/trigger shells, list rows, thumbs, glyphs)
  is token utilities in the markup; the .jx-label/.jx-error scaffolding
  is consumed from the jx-pure sheet's Part A; the press poses ride the
  global .jx-press law via --jx-press-shadow* custom-property utilities.
  Only the drag-over poses (they must out-rank the unlayered .jx-press
  law at the original (0,3,0) precedence), the sibling hairline, the
  icon svg sizing, the hover/focus/disabled machines and the
  reduced-motion kill remain in file-input.css (D1-exempt residue under
  the layer law).
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
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import './file-input.css';

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
    /** density policy: explicit, inherited, then default */
    density?: Density;
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
    density,
    'data-density': _callerDensity,
    maxFiles,
    hint,
    onreject,
    zone,
    class: className = '',
    ...rest
  }: Props = $props();

  // Family-local geometry names are one-line aliases to the closed control contract.
  const densityUtilities = '[--jx-file-h:var(--jx-hit)] [--jx-file-thumb:var(--jx-icon)] [--jx-file-icon:var(--jx-icon)] [--jx-file-text:var(--jx-text)] [--jx-file-zone-pad:var(--jx-inset)] [--jx-file-zone-glyph:var(--jx-icon)]';
  const outerDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, outerDensity));

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
    <span data-jx-file-code-glyph class="font-nav font-bold text-[calc(var(--jx-file-icon)*0.72)] tracking-[-0.02em] leading-none">&lt;/&gt;</span>
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
      data-jx-file={invalid ? 'invalid' : undefined}
      class={cn(
        'jx-press jx-file-zone flex flex-col items-center justify-center gap-[var(--jx-gap)] w-full min-w-0 max-w-full min-h-[calc(var(--jx-file-h)*2.25)] p-(--jx-file-zone-pad) border border-dashed border-border rounded-none bg-background text-foreground [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]',
        invalid && 'border-destructive',
      )}
      class:jx-file-over={dragging}
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
        <span
          class={cn(
            'jx-file-zone-glyph inline-flex items-center justify-center w-(--jx-file-zone-glyph) h-(--jx-file-zone-glyph) text-muted-foreground transition-colors duration-150 ease-out',
            dragging && 'text-primary',
          )}
          aria-hidden="true"
        >
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
        <span
          class={cn(
            'jx-file-zone-title font-nav text-[11px] tracking-[0.2em] uppercase text-foreground max-w-full [overflow-wrap:anywhere] text-center transition-colors duration-150 ease-out',
            dragging && 'text-primary',
          )}
        >{multiple ? 'click or drag files' : 'click or drag file'}</span>
        {#if zoneHint}<span data-jx-file-zone-hint class="font-nav text-[10.5px] tracking-[0.08em] text-muted-foreground max-w-full [overflow-wrap:anywhere] text-center">{zoneHint}</span>{/if}
      {/if}
    </button>
  {:else}
    <button
      type="button"
      id={triggerId}
      data-jx-file={invalid ? 'invalid' : undefined}
      class={cn(
        'jx-press jx-file-trigger inline-flex items-center gap-[var(--jx-gap)] w-fit max-w-full min-h-(--jx-file-h) px-[var(--jx-inset)] py-[var(--jx-gap)] border border-border rounded-none bg-background text-foreground text-(length:--jx-file-text) font-medium [--jx-press-shadow:var(--shadow-xs)] [--jx-press-shadow-hover:var(--shadow-sm)] [--jx-press-shadow-active:var(--shadow-sm-press)]',
        invalid && 'border-dashed border-destructive',
      )}
      class:jx-file-over={dragging}
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
        data-jx-file-trigger-glyph
        class={cn(
          'w-[calc(var(--jx-file-icon)*0.9)] h-[calc(var(--jx-file-icon)*0.9)] flex-none text-muted-foreground',
          dragging && 'text-primary',
        )}
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

<div data-jx-file={disabled ? 'disabled' : undefined} data-density={resolvedDensity} class={cn('jx-file flex flex-col items-stretch gap-[var(--jx-gap)] w-full min-w-0 max-w-full', densityUtilities, disabled && 'opacity-50', className)}>
  {#if label}<label class="jx-label max-w-full overflow-hidden text-ellipsis whitespace-nowrap" for={id}>{label}</label>{/if}

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
    data-jx-file-native
    class="sr-only"
    tabindex={-1}
    aria-hidden="true"
    {accept}
    {multiple}
    {disabled}
    onchange={onInputChange}
  />

  {#if items.length}
    <ul
      id={listId}
      data-jx-file-list
      data-jx-file={invalid ? 'invalid' : undefined}
      class={cn(
        'min-w-0 max-w-full m-0 p-0 list-none border border-border bg-background',
        invalid && 'border-dashed',
      )}
      aria-label="selected files"
    >
      {#each items as item (item.id)}
        <li class="jx-file-row flex items-center gap-[var(--jx-gap)] min-w-0 min-h-(--jx-file-h) px-[var(--jx-inset)]">
          <span data-jx-file-thumb class="flex-none inline-flex items-center justify-center w-[calc(var(--jx-file-thumb)+2px)] h-[calc(var(--jx-file-thumb)+2px)] border border-border bg-muted overflow-hidden" aria-hidden="true">
            {#if item.previewUrl}
              <img data-jx-file-thumb-img class="block w-(--jx-file-thumb) h-(--jx-file-thumb) object-cover" src={item.previewUrl} alt="" loading="lazy" />
            {:else}
              <span data-jx-file-icon={fileKind(item.file)} class="jx-file-icon inline-flex items-center justify-center w-(--jx-file-icon) h-(--jx-file-icon) text-muted-foreground">
                {@render kindIcon(fileKind(item.file))}
              </span>
            {/if}
          </span>
          <span data-jx-file-name class="flex-[1_1_0%] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-(length:--jx-file-text) text-foreground" title={item.file.name}>{item.file.name}</span>
          <span data-jx-file-size class="flex-none text-(length:--jx-file-text) tabular-nums text-muted-foreground">{formatSize(item.file.size)}</span>
          <button
            type="button"
            class="jx-file-remove flex-none inline-flex items-center justify-center min-w-[var(--jx-hit)] min-h-[var(--jx-hit)] p-0 border-0 bg-transparent text-[length:var(--jx-text)] leading-[var(--jx-leading)] cursor-pointer transition-[color,transform] duration-150 ease-out disabled:cursor-not-allowed"
            aria-label="remove {item.file.name}"
            disabled={disabled}
            onclick={() => removeItem(item)}
          >&times;</button>
        </li>
      {/each}
      {#if items.length > 1 && !disabled}
        <li data-jx-file-clearrow class="border-t border-border">
          <button type="button" class="jx-file-clear inline-flex items-center min-h-[calc(var(--jx-file-h)*0.75)] py-[0.15rem] border-0 bg-transparent text-muted-foreground font-nav text-[10.5px] tracking-[0.18em] uppercase cursor-pointer transition-colors duration-150 ease-out" onclick={clearAll}>remove all</button>
        </li>
      {/if}
    </ul>
  {/if}

  {#if invalid}
    <p id={errorId} class="jx-error"><span data-jx-file-error-mark class="font-bold text-destructive" aria-hidden="true">!</span>{shownError}</p>
  {/if}
</div>
