# terminal-input — delta

## Purpose

The ghostty-term input surface law: how every input path (keys, IME
composition, mouse, programmatic) reaches the pty, and how pty-side
requests (OSC 52 clipboard, title) reach the host — with the house
architecture rule that host integrations ride extension points and
defaults are always parameters, never hardcode.

## ADDED Requirements

### Requirement: the input priority chain

Every DOM input entering the component SHALL pass the chain in order:
raw layer (`onKeyDown` returning true consumes) → parameterized default
layers (clipboard hotkeys, mouse reporting) → wasm encoders (keyEncode
/ mouseEncode) → `onData`. No input path may reach the pty except
through the sanitized paste gate (IME commits, clipboard reads,
programmatic pasteText all share it).

#### Scenario: IME composition commits through the gate

- GIVEN a focused terminal with an IME actively composing
- WHEN compositionend fires with the committed string
- THEN the string rides the paste gate into the pty (never raw bytes),
  and during composition no partial bytes leak

#### Scenario: raw layer still owns everything first

- GIVEN an `onKeyDown` handler returning true for a key
- WHEN that key is pressed while a clipboard default or IME is active
- THEN the raw handler wins and the default chain never runs

### Requirement: mouse reporting follows the pty's tracking mode

The component SHALL read the terminal's mouse tracking mode (NONE/X10/
NORMAL/BUTTON/ANY) and route mouse events to the wasm encoder (formats
following live pty negotiation: X10/UTF8/SGR/URXVT/SGR_PIXELS) when
tracking is active and the `mouse` prop is not disabled; Shift held
bypasses reporting and forces local selection/scroll (the industry
convention); tracking NONE behaves exactly as before.

#### Scenario: vim clicks land in the pty

- GIVEN an application that enabled SGR mouse tracking (`CSI ?1006h`)
- WHEN the user clicks at cell (33,12)
- THEN `onData` receives the encoded SGR press sequence, and local
  selection does not start

#### Scenario: shift bypass always selects locally

- GIVEN active mouse tracking
- WHEN the user shift-drags
- THEN local selection runs and no mouse bytes reach the pty

### Requirement: OSC 52 rides a write-open/read-denied security model

The host SHALL observe OSC commands via a sideband parser (never
mutating the vt byte stream). OSC 52 set (clipboard write) is allowed
by default, capped at the smaller of the wasm's
CLIPBOARD_WRITE_MAX_BYTES and the configured max; OSC 52 query (read)
is DENIED unless `clipboardReadFrom` is explicitly enabled. Window
title changes surface as an `onTitleChange` event.

#### Scenario: remote write lands in the clipboard

- GIVEN a terminal where the pty sends `OSC 52 ; c ; <base64>`
- WHEN the payload is within the cap
- THEN the decoded text is written to the system clipboard

#### Scenario: oversized write is dropped with a named reason

- GIVEN a payload exceeding the cap
- THEN nothing is written and the drop is logged naming the limit

#### Scenario: query is refused by default

- GIVEN a pty sending OSC 52 query without `clipboardReadFrom` enabled
- THEN no clipboard contents are reported back
