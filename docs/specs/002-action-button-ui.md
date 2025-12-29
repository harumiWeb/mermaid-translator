# Spec: Action Button UI

## ID

002-action-button-ui

## Goal

Display a small, unobtrusive action button near the user's text selection
when the selected text is detected as Mermaid-like.

---

## In Scope

- Render a small button near the current text selection
- Button appears only when:
  - there is a non-empty text selection
  - the selected text is detected as Mermaid-like
- Button position is visually close to the selection (cursor-adjacent)

---

## Out of Scope

- Rendering Mermaid diagrams
- Popup or modal UI
- Any automatic action without user click
- Keyboard shortcuts
- Styling customization options

---

## Behavior

### Visibility

- When selection changes:
  - If selection is empty → button is not rendered
  - If selection is not Mermaid-like → button is not rendered
  - If selection is Mermaid-like → button is rendered

### Positioning

- Button is positioned using selection bounding rectangle
- Button must not overlap or modify the selected text
- Button positioning errors must fail silently (no fallback UI)

### Interaction

- Button is clickable
- Clicking the button triggers a render action (see Spec 003)
- Button does nothing else

---

## UX Constraints

- Button must be visually minimal
- Button must not steal focus
- Button must not block mouse or keyboard interaction
- Button must not persist when selection is cleared

---

## Error Handling

- All errors must be silent
- No console output in production
- No visible error UI

---

## Done When

- Button appears only for Mermaid-like selections
- Button disappears when selection changes or clears
- Button click triggers the next step without side effects
