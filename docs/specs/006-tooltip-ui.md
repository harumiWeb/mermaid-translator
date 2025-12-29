# Spec: Tooltip UI

## ID

006-tooltip-ui

## Goal

Provide a lightweight, reusable tooltip for extension UI elements.

## In Scope

- Render a tooltip inside the Shadow DOM
- Tooltip supports an arrow and a simple animation
- Tooltip text is configurable

## Out of Scope

- Global CSS
- Complex positioning engines
- External dependencies

## Behavior

- Tooltip can be shown and hidden without affecting page interaction
- Tooltip does not steal focus or block pointer input
- Tooltip is reusable by other UI elements (e.g. popup buttons)

## Done When

- Tooltip can be used by the action button
- Tooltip shows text "View Mermaid diagram" for the action button
