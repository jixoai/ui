/// <reference types="svelte" />
/// <reference types="vite/client" />

// D5 finding (recorded in corpus-report): @stylexjs/stylex 0.19.0's
// d.ts omits the `attrs` call signature (the runtime exports it —
// verified: attrs({...}) returns {class}). This augmentation types the
// Svelte-facing form; it adds no runtime code.
declare module '@stylexjs/stylex' {
  export function attrs(
    ...styles: unknown[]
  ): { class: string; [key: string]: unknown };
}

export {};
