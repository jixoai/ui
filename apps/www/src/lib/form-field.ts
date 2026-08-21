/**
 * jixoai form-field bridge (registry/files/lib/form-field.ts).
 *
 * 2026-08-20 · Form wave 3 (Codex architecture review pick): the faceless
 * form-associated custom element that restores FormData submission to the
 * family's custom-painted controls (select, combobox, range, tags-input —
 * the ones with no native name/value leg of their own).
 *
 * Law of the seam — STYLE STAYS IN THE COMPONENT:
 *  - the element renders NO box (display: contents), NO content, NO aria
 *    surface (aria-hidden); the Svelte component keeps every style,
 *    structure and ARIA decision exactly where it was.
 *  - the component feeds it three attributes only: name, value, disabled.
 *    Any change re-syncs setFormValue(); a missing name, an empty value
 *    or a disabled field contributes NOTHING (native control semantics).
 *  - form lifecycle flows back as two bubbling CustomEvents the component
 *    may listen to on the element itself: jx-reset (restore the mount
 *    value) and jx-disabled (detail: boolean — form/fieldset disable).
 *  - registration is lazy and client-only: the guard keeps module
 *    evaluation safe under SSR/prerender (no window, no customElements).
 *
 * Usage in a Svelte component:
 *
 *   <jx-form-field
 *     aria-hidden="true"
 *     {name}
 *     value={value ?? ''}
 *     disabled={isDisabled}
 *     onjx-reset={() => (value = initialValue)}
 *     onjx-disabled={(event: CustomEvent<boolean>) => (formDisabled = event.detail)}
 *   ></jx-form-field>
 */
/**
 * ... (docs unchanged)
 */
// SSR-safe base: the class declaration itself evaluates `extends
// HTMLElement` at module scope — under prerender (Node) there is no such
// global, so the base resolves to a placeholder that is never used
// (nothing is ever instantiated past the registration guard below).
const BaseElement: typeof HTMLElement =
  typeof HTMLElement === 'undefined'
    ? (class {} as unknown as typeof HTMLElement)
    : HTMLElement;

export class FormField extends BaseElement {
  static formAssociated = true;
  static observedAttributes = ['name', 'value', 'disabled'];

  readonly #internals = this.attachInternals();

  connectedCallback(): void {
    this.style.display = 'contents';
    this.#sync();
  }

  attributeChangedCallback(_name: string, _old: string | null, _new: string | null): void {
    this.#sync();
  }

  formResetCallback(): void {
    this.setAttribute('value', '');
    this.dispatchEvent(new CustomEvent('jx-reset', { bubbles: true }));
  }

  formDisabledCallback(disabled: boolean): void {
    this.dispatchEvent(new CustomEvent('jx-disabled', { detail: disabled, bubbles: true }));
  }

  #sync(): void {
    const name = this.getAttribute('name');
    const value = this.getAttribute('value') ?? '';
    const disabled = this.hasAttribute('disabled');
    if (!name || disabled || value === '') {
      this.#internals.setFormValue(null);
    } else {
      this.#internals.setFormValue(value);
    }
  }
}

// Lazy registration: safe for SSR (no window/document during prerender) and
// idempotent across multiple component imports of the same app.
if (typeof window !== 'undefined' && 'attachInternals' in HTMLElement.prototype) {
  if (!customElements.get('jx-form-field')) {
    customElements.define('jx-form-field', FormField);
  }
}
