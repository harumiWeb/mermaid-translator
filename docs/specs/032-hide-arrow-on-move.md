# Spec: Hide Arrow When Popup Moves

## ID

032-hide-arrow-on-move

## Goal

Avoid misleading visual cues by hiding the popup arrow
after the popup is moved from its initial position.

## In Scope

- Hide the popup arrow when the popup is dragged by the user
- Hide the popup arrow when the popup is resized by the user
- Applies to the main popup and edit-mode popup

## Out of Scope

- Repositioning the arrow to follow the original selection
- Persisting the hidden state across sessions

## Behavior

- Arrow is visible on initial popup render
- Once the popup is moved or resized, the arrow is hidden
- Arrow remains hidden until the popup is dismissed
- Failures are silent and do not affect page interaction

## Done When

- Arrow hides after any user-driven move or resize
- Arrow stays hidden until the popup is closed
