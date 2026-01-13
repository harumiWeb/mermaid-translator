# Spec: Popup Drag and Resize (Default View)

## ID

031-popup-drag-resize

## Goal

Allow the initial (non-edit) popup to be draggable and resizable
so users can reposition and adjust the window without entering edit mode.

## In Scope

- Main popup can be dragged by its header area
- Main popup can be resized from any edge or corner
- Resize cursor reflects the active edge/corner direction
- Existing viewport constraints remain enforced

## Out of Scope

- Auto-saving popup position or size across sessions
- Keyboard-based movement or resizing
- Changes to split editor behavior

## Behavior

- Drag starts only from the header area
- Resize starts only when the pointer is on the popup border area
- Edge drag resizes along one axis; corner drag resizes along both axes
- Dragging inside the content area behaves as before
- Failures are silent and do not affect page interaction

## Done When

- Main popup is draggable without entering edit mode
- Main popup is resizable from any edge/corner
- Cursor feedback matches the resize direction
