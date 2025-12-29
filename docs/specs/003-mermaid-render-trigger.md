# Spec: Mermaid Render Trigger

## ID

003-mermaid-render-trigger

## Goal

Trigger Mermaid rendering strictly as a result of explicit user interaction
with the action button.

---

## In Scope

- Handle action button click
- Initiate Mermaid rendering logic
- Pass selected text to renderer

---

## Out of Scope

- Mermaid rendering implementation
- Rendering result validation
- Error UI or messages
- Automatic or implicit rendering

---

## Behavior

### Trigger Conditions

- Rendering MUST occur only when:
  - action button is visible
  - user explicitly clicks the button

### Trigger Action

- On button click:
  - capture current selected text
  - invoke Mermaid renderer with the captured text
  - rendering target must be extension-owned UI container

### Idempotency

- Multiple clicks MAY trigger multiple renders
- No attempt to deduplicate or optimize renders

---

## UX Constraints

- No loading indicators
- No blocking UI
- No page scroll or focus changes

---

## Error Handling

- Rendering trigger must not throw
- Failures must be silent
- Trigger must not retry automatically

---

## Done When

- Button click invokes renderer with selected text
- No rendering occurs without user click
- Page behavior remains unchanged
