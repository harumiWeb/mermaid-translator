# Spec: Selection Detection

## ID

001-selection-detection

## Goal

Detect user text selection and extract plain text
without modifying the host page.

## In Scope

- Listen to selection changes
- Read selected text via Selection API
- Read selected text from active input/textarea via selectionStart/selectionEnd
- Ignore empty or whitespace-only selections

## Out of Scope

- DOM scanning
- Automatic rendering
- Any UI rendering

## Behavior

- On selection change:
  - If no selection exists → do nothing
  - If selected text is empty → do nothing
  - If selection text differs from previous → update internal state

## Error Handling

- All failures must be silent
- No exceptions may escape the handler

## UX Constraints

- Must not block selection
- Must not interfere with mouse or keyboard

## Done When

- Selection text can be logged internally (dev only)
- No visible UI changes occur
