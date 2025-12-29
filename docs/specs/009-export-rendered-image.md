# Spec: Export Rendered Image

## ID

009-export-rendered-image

## Goal

Allow users to save rendered Mermaid diagrams as SVG or PNG from the popup.

## In Scope

- Provide two export actions: SVG and PNG
- Export uses the latest rendered SVG in the popup
- Export uses client-side download only

## Out of Scope

- Background scripts
- External services
- Additional formats (PDF, JPG)

## Behavior

- If no SVG is available, export does nothing
- Export errors show a short message in the popup
- PNG export converts SVG using a canvas

## Done When

- SVG download works
- PNG download works
- Errors are handled without breaking the page
