<!--
  @jixoai/ui-design (studio) — the chat panel (T4/T5 client half +
  r2 T6 selection context + r3 T5 component rebuild).

  Orthogonal intents (2):
    1. the agent chat surface — message flow, input, and AgentEvent
       rendering (text/file/tool/done/error). Transport is the seam's
       SSE over POST (fetch + ReadableStream parsing — EventSource
       cannot POST; the single-protocol ruling lives in agent/sse.ts).
    2. the selection chip (r2 T6): the current studio selection rides
       above the input as a removable chip, and outgoing messages
       carry it as the stable context prefix (selectionMessageBody —
       the format the knowledge pack's prototype-standard layer
       documents for the agent).

  r3 T5 (2026-09-12): the chrome is now the library's own — the send
  button is #jixoai/press-button (loading pose = the streaming 加载锁,
  ID2's fix), the draft is #jixoai/textarea, the selection chip is
  #jixoai/chip (whole-chip activation removes — the × glyph rides the
  trailing lane), the agent-model line and tool events are
  #jixoai/badge. File paths stay <code>: paths are case-SENSITIVE and
  the badge's uppercase voice would corrupt them (ledger, rebuild-plan
  §6). Scoped CSS is layout + message-flow typography only.

  Original need: Owner 2026-09-11 (design-studio T4; design-studio-r2
  T6). Svelte 5 runes.
-->
<script lang="ts">
  import Badge from '#jixoai/badge';
  import Chip from '#jixoai/chip';
  import PressButton from '#jixoai/press-button';
  import Textarea from '#jixoai/textarea';
  import { selectionChipLabel, selectionMessageBody, type DesignSelection } from './selection.ts';

  export interface ChatEvent {
    readonly type: 'text' | 'file' | 'tool' | 'done' | 'error';
    readonly text?: string;
    readonly path?: string;
    readonly name?: string;
    readonly state?: 'start' | 'end';
    readonly message?: string;
  }
  export interface ChatBlock {
    readonly kind: 'text' | 'file' | 'tool' | 'done' | 'error';
    readonly text?: string;
    readonly path?: string;
    readonly label?: string;
    readonly tone?: 'error';
  }
  export interface ChatMessage {
    readonly role: 'user' | 'agent';
    readonly blocks: ChatBlock[];
  }

  let {
    chatUrl = '/__design__/api/chat',
    agentInfoUrl = '/__design__/api/agent.json',
    selection = null,
    onClearSelection = (): void => {},
    onTurnSettled = (): void => {},
    onStreamingChange = (): void => {},
  }: {
    chatUrl?: string;
    agentInfoUrl?: string;
    selection?: DesignSelection | null;
    onClearSelection?: () => void;
    onTurnSettled?: () => void;
    /** the streaming state lifted to the shell — the property panel's
     *  read-only lock during an agent turn (r2 §4, the H1 rule) */
    onStreamingChange?: (streaming: boolean) => void;
  } = $props();

  let messages: ChatMessage[] = $state([]);
  let draft: string = $state('');
  let streaming: boolean = $state(false);
  let agentKind: string | null = $state(null);
  let agentModel: string | null = $state(null);
  let sessionId: string = $state('');
  let chatFlow: HTMLDivElement | null = $state(null);

  const readonlyAgent = $derived(agentKind === 'none');
  const canSend = $derived(!streaming && !readonlyAgent && draft.trim().length > 0);

  // keep the newest block in view — streaming appends leave the bottom
  // line half-cut otherwise (V5 vision catch, 2026-09-11)
  $effect(() => {
    const blockCount = messages.reduce((sum, message) => sum + message.blocks.length, 0);
    if (blockCount > 0 && chatFlow !== null) {
      chatFlow.scrollTo({ top: chatFlow.scrollHeight, behavior: 'auto' });
    }
  });

  $effect(() => {
    sessionId = crypto.randomUUID();
    void (async () => {
      try {
        const response = await fetch(agentInfoUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const info = (await response.json()) as { kind?: string; model?: string };
        agentKind = info.kind ?? null;
        agentModel = info.model ?? null;
      } catch {
        agentKind = null;
      }
    })();
  });

  function pushBlock(role: 'user' | 'agent', block: ChatBlock): void {
    const last = messages[messages.length - 1];
    if (last !== undefined && last.role === role) {
      messages[messages.length - 1] = { role, blocks: [...last.blocks, block] };
    } else {
      messages = [...messages, { role, blocks: [block] }];
    }
  }

  function appendAgentText(text: string): void {
    const last = messages[messages.length - 1];
    if (last !== undefined && last.role === 'agent') {
      const lastBlock = last.blocks[last.blocks.length - 1];
      if (lastBlock !== undefined && lastBlock.kind === 'text') {
        const blocks = [...last.blocks];
        blocks[blocks.length - 1] = { kind: 'text', text: `${lastBlock.text ?? ''}${text}` };
        messages[messages.length - 1] = { role: 'agent', blocks };
        return;
      }
    }
    pushBlock('agent', { kind: 'text', text });
  }

  /** parse one SSE chunk boundary -> complete `data: <json>` lines */
  function* sseLines(bufferRef: { text: string }): Generator<ChatEvent> {
    const parts = bufferRef.text.split('\n\n');
    bufferRef.text = parts.pop() ?? '';
    for (const part of parts) {
      const dataLine = part.split('\n').find((line) => line.startsWith('data:'));
      if (dataLine === undefined) continue;
      try {
        yield JSON.parse(dataLine.slice(5).trim()) as ChatEvent;
      } catch {
        // a malformed event is skipped, never fatal to the stream
      }
    }
  }

  async function send(): Promise<void> {
    const message = draft.trim();
    if (message === '' || streaming || readonlyAgent) return;
    draft = '';
    pushBlock('user', { kind: 'text', text: message });
    streaming = true;
    onStreamingChange(true); // the panel locks for the turn (r2 §4)
    // the selection rides as the stable context prefix (r2 T6 — the
    // knowledge pack documents the format for the agent side)
    const outbound = selectionMessageBody(selection, message);
    let settled = false;
    try {
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: outbound }),
      });
      if (response.body === null) throw new Error('no response body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const buffer = { text: '' };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer.text += decoder.decode(value, { stream: true });
        for (const event of sseLines(buffer)) {
          settled = true;
          if (event.type === 'text') appendAgentText(event.text ?? '');
          else if (event.type === 'file') pushBlock('agent', { kind: 'file', path: event.path ?? '' });
          else if (event.type === 'tool') pushBlock('agent', { kind: 'tool', label: `${event.name ?? 'tool'} ${event.state === 'start' ? '…' : '✓'}` });
          else if (event.type === 'done') pushBlock('agent', { kind: 'done' });
          else if (event.type === 'error') pushBlock('agent', { kind: 'error', text: event.message ?? 'error', tone: 'error' });
        }
      }
      if (!settled) pushBlock('agent', { kind: 'error', text: 'the agent stream ended without events', tone: 'error' });
    } catch (cause) {
      pushBlock('agent', { kind: 'error', text: cause instanceof Error ? cause.message : String(cause), tone: 'error' });
    } finally {
      streaming = false;
      onStreamingChange(false);
      onTurnSettled();
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }
</script>

<section class="chat">
  <header class="chat-head">
    <span class="chat-title">chat</span>
    {#if agentKind === null}
      <Badge variant="outline" class="truncate">agent: ?</Badge>
    {:else if readonlyAgent}
      <Badge variant="outline" class="truncate">agent: none (read-only)</Badge>
    {:else}
      <Badge variant="tonal" class="truncate">agent: {agentKind}{agentModel !== null ? ` · ${agentModel}` : ''}</Badge>
    {/if}
  </header>

  <div class="chat-flow" bind:this={chatFlow}>
    {#if messages.length === 0}
      <p class="chat-hint">
        {#if readonlyAgent}
          chat is disabled — restart with --agent echo or --agent dsh.
        {:else}
          ask for a prototype, e.g. "做一个 hero 原型" — the agent writes real files under design/.
        {/if}
      </p>
    {/if}
    {#each messages as message, index (index)}
      <div class="chat-message" class:chat-user={message.role === 'user'}>
        {#each message.blocks as block, blockIndex (blockIndex)}
          {#if block.kind === 'text'}
            <p class="chat-text">{block.text}</p>
          {:else if block.kind === 'file'}
            <!-- paths stay <code>: case-sensitive content the badge's
                 uppercase voice would corrupt (r3 T5 ledger) -->
            <code class="chat-file">{block.path}</code>
          {:else if block.kind === 'tool'}
            <Badge variant="outline" class="self-start">{block.label}</Badge>
          {:else if block.kind === 'done'}
            <span class="chat-done">— turn closed —</span>
          {:else if block.kind === 'error'}
            <p class="chat-error">{block.text}</p>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  {#if selection !== null}
    <div class="chat-chip-row">
      <!-- the removable selection chip: the WHOLE chip is the remove
           activation (aria names it; the × glyph rides the trailing
           lane as the visual affordance) — one target, one semantics -->
      <Chip
        variant="outline"
        class="w-full truncate"
        title="selection context — rides the next message (click to remove)"
        ariaLabel={`remove selection context: ${selectionChipLabel(selection)}`}
        onclick={() => onClearSelection()}
      >
        {selectionChipLabel(selection)}
        {#snippet slotEnd()}<span aria-hidden="true">×</span>{/snippet}
      </Chip>
    </div>
  {/if}

  <form
    class="chat-input"
    onsubmit={(event) => {
      event.preventDefault();
      void send();
    }}
  >
    <Textarea
      class="chat-draft"
      rows={2}
      placeholder={readonlyAgent ? 'read-only studio (--agent none)' : 'message the design agent…'}
      bind:value={draft}
      onkeydown={onKeydown}
      disabled={readonlyAgent}
    />
    <!-- ID2's loading lock: press-button's loading pose (spinner +
         suppressed activation, aria-disabled — never the bare disabled
         attribute alone) paints the streaming turn; native disabled
         still gates the empty-draft / read-only rests -->
    <PressButton
      type="submit"
      class="chat-send disabled:opacity-45 disabled:cursor-default"
      disabled={!canSend}
      loading={streaming}
    >send</PressButton>
  </form>
</section>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    /* r3 T2: the old stacked-rail separator below the chat is gone —
       chat is now the inspector's tab panel, not a stacked half */
  }
  .chat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
  }
  .chat-title {
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.6875rem;
    color: #b9b2a6;
  }
  .chat-flow {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .chat-hint {
    color: #8d8578;
    line-height: 1.6;
    margin: 0;
  }
  .chat-message {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
    min-width: 0;
  }
  .chat-user {
    align-items: flex-end;
  }
  .chat-text {
    margin: 0;
    line-height: 1.55;
    max-width: 100%;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .chat-user .chat-text {
    color: #d9cdb8;
  }
  .chat-file {
    font-size: 0.6875rem;
    background: #1b1917;
    border: 1px solid #262320;
    border-radius: 3px;
    padding: 0.125rem 0.375rem;
    color: #a9c4a9;
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  .chat-done {
    font-size: 0.6875rem;
    color: #6f6759;
  }
  .chat-error {
    margin: 0;
    color: #e08585;
    line-height: 1.5;
  }
  .chat-chip-row {
    display: flex;
    align-items: center;
    padding: 0.375rem 0.75rem 0;
    min-width: 0;
  }
  .chat-input {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
  }
  /* the textarea's field wrapper is the flex child (the component's
     own class lands on the inner shell) */
  .chat-input :global(.jx-field) {
    flex: 1;
    min-width: 0;
  }
</style>
