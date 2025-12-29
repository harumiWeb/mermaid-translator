# Spec: Open Rendered SVG in New Tab

## ID

010-open-in-new-tab

## Goal

Allow opening the rendered SVG in a new browser tab from the popup.

## In Scope

- Add an external-link icon button next to the PNG export button
- Open the latest rendered SVG in a new tab
- Use a full HTML document with doctype to avoid quirks mode

## Out of Scope

- Background scripts
- External hosting
- PNG tab opening

## Behavior

- If no SVG is available, do nothing and show a short error message
- The new tab shows only the SVG
- The button is disabled until a render succeeds

## Done When

- Clicking the button opens a new tab with the SVG
- Errors are handled without breaking the page
