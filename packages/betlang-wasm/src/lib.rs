//! The wasm ABI shim for `@jixoai/betlang-wasm` — three exports, zero
//! wasm-bindgen (design D4: bindgen glue would add ~3-8 KiB raw, over
//! the 100 KiB budget; the loader speaks raw linear memory instead).
//!
//! ABI (consumed by packages/betlang-wasm/index.js):
//!
//!   detect(ptr: *const u8, len: usize) -> i32
//!       Detects over `len` UTF-8 bytes at linear-memory offset `ptr`
//!       (the JS loader grows memory and writes the input into the
//!       freshly grown pages — no allocator export needed). Returns the
//!       `betlang::Language` discriminant (0..=47, alphabetical model
//!       labels asm..yaml, `#[repr(u8)]` upstream) or -1 when the input
//!       is empty / whitespace-only / too short for the model window.
//!
//!   last_confidence() -> f64
//!       The top-1 calibrated probability of the LAST `detect` call
//!       (betlang's `Detection::top_languages` head, f32 widened to
//!       f64), 0.0 after a -1 return or before any call. Calibrated
//!       0..=1 in practice; the TS boundary drops out-of-range/NaN
//!       values rather than clamping (lang-detector.ts contract).
//!
//! Single-threaded wasm: the confidence slot is a plain static read via
//! raw pointer (no `static mut` reference, no atomics — the wasm32
//! target without the atomics feature has no native 64-bit atomic ops
//! and JS calls serialize anyway).

/// Slot for the last top-1 probability, as raw f64 bits — written by
/// `detect`, read by `last_confidence`, never referenced (pointer
/// access only, keeping `static_mut_refs` silent).
static mut LAST_CONFIDENCE: f64 = 0.0;

#[no_mangle]
pub extern "C" fn detect(ptr: *const u8, len: usize) -> i32 {
    // SAFETY: the JS loader guarantees `len` readable bytes at `ptr`
    // for the whole synchronous duration of this call (it wrote them
    // into the grown pages immediately before calling and never frees
    // underneath the call). `ptr` is non-null and aligned even for
    // len == 0 (it is the end-of-memory offset, 1-byte aligned).
    let bytes = unsafe { std::slice::from_raw_parts(ptr, len) };
    let detection = betlang::detect(bytes);
    // raw-pointer slot access; no references to the static are formed
    let slot = std::ptr::addr_of_mut!(LAST_CONFIDENCE);
    let Some(language) = detection.language() else {
        unsafe { slot.write(0.0) };
        return -1;
    };
    let confidence = detection
        .top_languages()
        .next()
        .map(|(probability, _)| f64::from(probability))
        .unwrap_or(0.0);
    unsafe { slot.write(confidence) };
    language as i32
}

#[no_mangle]
pub extern "C" fn last_confidence() -> f64 {
    // raw-pointer read of our own static; no references formed
    unsafe { std::ptr::addr_of!(LAST_CONFIDENCE).read() }
}
