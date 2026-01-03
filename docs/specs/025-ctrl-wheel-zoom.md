# Spec: Ctrl + Wheel Zoom

## ID

025-ctrl-wheel-zoom

## Goal

Allow users to zoom Mermaid diagrams using Ctrl + mouse wheel
within the diagram area.

## In Scope

- Detect Ctrl + wheel events over the diagram area
- Zoom in/out using existing pan/zoom controls logic
- Respect existing zoom step and min/max limits

## Out of Scope

- Trackpad pinch gestures without Ctrl
- Global page zoom changes
- Keyboard-only zoom shortcuts

## Behavior

- Ctrl + wheel over the diagram zooms the diagram only
- The page must continue to scroll normally without Ctrl
- Zoom changes must not block page interaction

## Done When

- Ctrl + wheel zoom works in both normal and edit modes
- Zoom stays within configured min/max
- No impact on host page scrolling when Ctrl is not held
