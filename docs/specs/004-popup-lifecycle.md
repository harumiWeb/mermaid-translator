# Spec: Popup Lifecycle

## ID

004-popup-lifecycle

## Goal

Manage the lifecycle of a lightweight popup that displays rendered Mermaid
output without interfering with the host page.

---

## In Scope

- Create popup container on demand
- Display popup after render trigger
- Destroy popup when no longer relevant

---

## Out of Scope

- Modal dialogs
- Background overlays
- Persistent UI
- Multiple simultaneous popups

---

## Lifecycle

### Creation

- Popup is created only after render trigger
- Popup is owned entirely by the extension
- Popup is rendered inside Shadow DOM

### Visibility

- Popup becomes visible immediately after creation
- Popup displays rendered content only
- Popup must not auto-resize the page

### Dismissal

Popup MUST be dismissed when any of the following occurs:

- User clears text selection
- User selects different text
- User clicks outside the popup
- Page navigation or reload

---

## UX Constraints

- Popup must not trap focus
- Popup must not block scrolling
- Popup must not prevent text selection
- Popup must stay within the viewport when near the edges
- Close button must be placed inside the action button row and right-aligned
- Popup action buttons should have a consistent height and alignment
- Close button uses the extension-provided icon asset
- Popup colors follow system color scheme
- Popup must not be draggable or resizable
- Popup minimum width is 550px
- Popup maximum width is 50% of viewport width
- Popup includes a close button in the top-right corner
- Close button shows a tooltip on hover

---

## Error Handling

- Popup creation failures must be silent
- Popup teardown must be safe to call multiple times
- No user-facing error messages

---

## Done When

- Popup appears only after explicit render trigger
- Popup disappears predictably on dismissal conditions
- Popup leaves no residual DOM or styles
