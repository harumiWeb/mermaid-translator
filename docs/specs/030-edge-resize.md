# Spec: Edge Resize Handles

## ID

030-edge-resize

## Goal

Make resizable popups easier to discover by allowing resize from any edge,
not only a corner handle.

## In Scope

- Edit-mode panel can be resized from any edge or corner
- Split editor popup can be resized from any edge or corner
- Resize cursor reflects the active edge/corner direction
- No new visible UI elements are required

## Out of Scope

- Resizing the main (non-edit) popup
- New animations or visual effects
- Keyboard-driven resizing

## Behavior

- Resize starts only when the pointer is on the popup border area
- Edge drag resizes along one axis; corner drag resizes along both axes
- Dragging inside the content area behaves as before
- All existing viewport constraints still apply
- Failures are silent and do not affect page interaction

## Done When

- Edit-mode panel resizes from any edge/corner
- Split editor popup resizes from any edge/corner
- Main popup remains non-resizable
