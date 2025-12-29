# Spec: Mermaid Render

## Goal

Render a Mermaid diagram from user-selected text
only after explicit user interaction.

## In Scope

- Render Mermaid code into SVG
- Extract Mermaid code blocks from selected text when present
- When no code block exists, discard any text before the first Mermaid keyword
- Render only on button click
- Render inside extension-owned container
- Load the Mermaid library lazily on the first render trigger
  via `src/content/mermaidRenderer.ts`

## Out of Scope

- Syntax validation
- Auto-rendering
- External resources
- Exporting rendered output

## Error Handling

- Rendering failures must not throw
- When rendering fails, show a short error message inside the popup container

## Done When

- Valid Mermaid code produces SVG
- Invalid code produces an error message in the popup
- Page behavior is unaffected
