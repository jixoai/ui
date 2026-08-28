# terminal-input — delta

## Purpose

The ghostty-term input surface law: how every input path (keys, IME
composition, mouse, programmatic) reaches the pty, and how pty-side
requests (OSC 52 clipboard, title) reach the host — with the house
architecture rule that host integrations ride extension points and
defaults are always parameters, never hardcode.

## ADDED Requirements

### Requirement: the write/onData vocabulary

Terminal direction words SHALL hold everywhere in this repo: `write`
feeds pty OUTPUT into the VT (host → terminal); `onData` carries
terminal INPUT out to the application (terminal → pty). Replies TO an
application (mouse encodes, key encodes, OSC 52 query responses) MUST
ride onData; bytes fed to `write`/`vtWrite` are output the VT parses
(and the sideband OSC parser observes) — injecting an application
reply there would be re-ingested and never reach the program.

#### Scenario: an application reply never rides write

- GIVEN an OSC 52 query that clipboardReadFrom allows answering
- WHEN the host composes the reply sequence
- THEN it is emitted on the input channel (onData), and never passed
  to write/vtWrite

### Requirement: the input priority chain

Every DOM input entering the component SHALL pass the chain in order:
raw layer (`onKeyDown` returning true consumes) → parameterized default
layers (clipboard hotkeys, mouse reporting) → wasm encoders (keyEncode
/ mouseEncode) → `onData`. TEXT-commit paths (IME commits, clipboard
reads, programmatic pasteText) MUST ride the sanitized paste gate;
encoder bytes are not text and take the gate-free encode path.

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

The component SHALL read the terminal's mouse tracking state (a
boolean: any tracking mode enabled — the ABI exposes no 5-state enum)
and route mouse events to the wasm encoder (formats following live pty
negotiation: X10/UTF8/SGR/URXVT/SGR_PIXELS) when tracking is active and
the `mouse` prop is not disabled; Shift held bypasses reporting and
forces local selection/scroll (the industry convention); inactive
tracking behaves exactly as before.

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

The host SHALL observe OSC 52 via whichever internal route the probes
freeze (host callbacks / parser boundaries / host scan — never mutating
the vt byte stream). OSC 52 set (clipboard write) is allowed by
default, capped at the house default (1 MiB decoded) or the configured
max — the wasm's Kitty-5522 limit does not apply; OSC 52 query (read)
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

#### Scenario: invalid base64 is dropped with a named reason

- GIVEN an OSC 52 set whose payload fails base64 decoding
- THEN nothing reaches the clipboard and the drop is logged naming why

#### Scenario: title changes surface as events

- GIVEN a pty that emits an OSC 0/2 window title change
- WHEN the sideband parser observes it
- THEN onTitleChange fires with the new title (and the demo chrome
  reflects it live)

#### Scenario: mouse disabled or tracking NONE keeps local behavior

- GIVEN `mouse` set to false, or an application that never enabled
  tracking
- WHEN the user clicks, drags, or wheels
- THEN behavior is exactly the local default (selection gesture,
  viewport scroll) — no mouse bytes are emitted
