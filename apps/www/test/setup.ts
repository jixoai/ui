/*
  Global test setup for @jixoai/www (2026-08-20).

  jsdom (v29) still lacks the four platform surfaces the form family
  orchestrates on. This file polyfills exactly those, no more:

  1. Popover API — showPopover/hidePopover/togglePopover on HTMLElement,
     `:popover-open` matching in Element#matches, declarative
     <button popovertarget> click wiring, light dismiss on outside click,
     Escape close request, and auto-popover one-at-a-time closing.
     Panels also get an `open` attribute so tests can assert visibility.
  2. ToggleEvent — the native toggle event carries newState/oldState.
  3. Element#scrollIntoView — the roving-highlight effects call it on
     aria-activedescendant moves; jsdom has no layout, so it is a no-op.
  4. ElementInternals form-data surface — jsdom's attachInternals() exists
     but exposes only ARIA reflection: no setFormValue, and FormData(form)
     skips form-associated custom elements. The polyfill gives each
     internals object a per-element setFormValue store (reached by
     wrapping attachInternals so the host element is known) and teaches
     the FormData constructor to collect the stored contributions of
     jx-form-field descendants of the given form — exactly the platform
     seam the form-field bridge rides, nothing more.

  The polyfill mirrors the ORDER of the platform where it matters to the
  components: the toggle event fires synchronously inside show/hide, and
  opening one auto popover closes the others first.
*/
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// ---- 2. ToggleEvent -------------------------------------------------------
if (typeof window.ToggleEvent === 'undefined') {
  class ToggleEventPolyfill extends Event {
    newState: string;
    oldState: string;
    constructor(type: string, init?: EventInit & { newState?: string; oldState?: string }) {
      super(type, init);
      this.newState = init?.newState ?? '';
      this.oldState = init?.oldState ?? '';
    }
  }
  Object.defineProperty(window, 'ToggleEvent', { value: ToggleEventPolyfill, writable: true });
}

// ---- 0. dialog modal methods (jsdom gap) -----------------------------------
// jsdom ships HTMLDialogElement without showModal/close; the components
// only need the open flag + the close event the native path fires.
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

// ---- 1. Popover API --------------------------------------------------------
type PopoverElement = HTMLElement & { __jxPopoverOpen?: boolean };
const isOpen = (el: PopoverElement): boolean => el.__jxPopoverOpen === true;

function fireToggle(el: PopoverElement, open: boolean): void {
  el.dispatchEvent(
    new window.ToggleEvent('toggle', {
      oldState: open ? 'closed' : 'open',
      newState: open ? 'open' : 'closed',
    })
  );
}

function setOpen(el: PopoverElement, open: boolean): void {
  if (!el.hasAttribute('popover')) {
    throw new DOMException('showPopover() called on a non-popover element', 'NotSupportedError');
  }
  if (isOpen(el) === open) return;
  if (open) {
    // auto popovers: one at a time — close the others before opening
    for (const other of document.querySelectorAll<PopoverElement>('[popover]')) {
      if (other !== el && isOpen(other)) {
        other.__jxPopoverOpen = false;
        other.removeAttribute('open');
        fireToggle(other, false);
      }
    }
  }
  el.__jxPopoverOpen = open;
  if (open) el.setAttribute('open', '');
  else el.removeAttribute('open');
  fireToggle(el, open);
}

const proto = window.HTMLElement.prototype as any;
if (typeof proto.showPopover !== 'function') {
  proto.showPopover = function (this: PopoverElement) {
    setOpen(this, true);
  };
  proto.hidePopover = function (this: PopoverElement) {
    setOpen(this, false);
  };
  proto.togglePopover = function (this: PopoverElement, force?: boolean) {
    setOpen(this, force ?? !isOpen(this));
  };
}

// `:popover-open` selector matching — the only selector the components
// hand to matches(); everything else delegates to the native engine.
const nativeMatches = window.Element.prototype.matches;
window.Element.prototype.matches = function (this: PopoverElement, selector: string) {
  if (selector === ':popover-open') return isOpen(this);
  return nativeMatches.call(this, selector);
} as typeof nativeMatches;

// declarative invoker wiring: <button popovertarget=id> toggles the panel;
// any other click light-dismisses open auto popovers (capture order = the
// platform's pointerdown-dismiss, simplified to the click test paths need)
document.addEventListener(
  'click',
  (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest?.('button[popovertarget]');
    if (button) {
      const panel = document.getElementById(button.getAttribute('popovertarget') ?? '');
      if (panel) panel.togglePopover();
      return;
    }
    for (const panel of document.querySelectorAll<PopoverElement>('[popover]')) {
      if (isOpen(panel) && (!target || !panel.contains(target))) {
        panel.hidePopover();
      }
    }
  },
  true
);

// Escape = the native close request for open auto popovers
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  for (const panel of document.querySelectorAll<PopoverElement>('[popover]')) {
    if (isOpen(panel)) panel.hidePopover();
  }
});

// ---- 3. scrollIntoView (no layout in jsdom → no-op) -------------------------
if (!window.Element.prototype.scrollIntoView) {
  window.Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// ---- 4. ElementInternals form-data surface ----------------------------------
type ElementWithStore = HTMLElement & { __jxFormValue?: string };
const formValueByElement = new WeakMap<HTMLElement, string | FormData>();

const nativeAttachInternals = window.HTMLElement.prototype.attachInternals;
window.HTMLElement.prototype.attachInternals = function (this: HTMLElement) {
  const internals = nativeAttachInternals.call(this);
  if (typeof (internals as { setFormValue?: unknown }).setFormValue !== 'function') {
    // strings AND FormData — the platform's setFormValue accepts a
    // FormData for multi-entry submissions (the bridge's multivalue)
    (internals as { setFormValue?: (value: string | FormData | null) => void }).setFormValue = (
      value,
    ) => {
      formValueByElement.set(this, value ?? '');
    };
  }
  return internals;
};

const NativeFormData = window.FormData;
class FormDataWithFormAssociated extends NativeFormData {
  constructor(form?: HTMLFormElement, submitter?: HTMLElement | null) {
    super(form, submitter);
    if (form) {
      for (const field of form.querySelectorAll<ElementWithStore>('jx-form-field')) {
        const name = field.getAttribute('name');
        if (!name) continue;
        const value = formValueByElement.get(field);
        if (value === undefined || value === '') continue;
        if (value instanceof NativeFormData) {
          for (const [entryName, entryValue] of value.entries()) {
            this.append(entryName, entryValue);
          }
        } else {
          this.append(name, value);
        }
      }
    }
  }
}
// window AND globalThis: vitest copies jsdom globals onto the test realm
// once at environment setup — reassigning only window would leave the
// bare `FormData` identifier in spec files pointing at the original.
window.FormData = FormDataWithFormAssociated;
Object.defineProperty(globalThis, 'FormData', {
  value: FormDataWithFormAssociated,
  writable: true,
  configurable: true,
});

afterEach(() => {
  cleanup();
});
