# Spec: Pan and Zoom Controls

## ID

016-pan-zoom-controls

## Goal

Allow users to pan and zoom the rendered diagram inside the popup
to inspect details more easily in both normal and edit modes.

## In Scope

- Enable drag-to-pan on the rendered diagram area
- Add zoom controls at the bottom-right of the diagram area
- Use icons at `public/icons/zoom.svg` and `public/icons/zoom-out.svg`
- Support zoom in/out in both popup and edit modes
- Zoom controls affect only the rendered diagram, not the popup size

## Out of Scope

- Pinch-to-zoom gestures
- Keyboard shortcuts
- Persisting zoom level across sessions
- Background scripts or storage

## Behavior

- Panning is active only when the pointer is over the diagram area
- Zoom buttons adjust the scale in fixed steps and clamp to a safe range
- Default zoom is 1.0; step is 0.1; min 0.5; max 2.0
- Zoom state resets when the popup is dismissed
- Errors are silent and do not affect page interaction

## Done When

- Diagram can be dragged to move within its viewport
- Zoom in/out buttons appear in the bottom-right of the diagram area
- Controls work in both normal and edit modes
