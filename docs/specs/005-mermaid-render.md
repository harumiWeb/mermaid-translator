# Spec: Mermaid Render

## Goal

Render a Mermaid diagram from user-selected text
only after explicit user interaction.

## In Scope

- Render Mermaid code into SVG
- Render only on button click
- Render inside extension-owned container
- Load the Mermaid library lazily on the first render trigger
  via `src/content/mermaidRenderer.ts`

## Out of Scope

- Syntax validation
- Error UI
- Auto-rendering
- External resources

## Error Handling

- Rendering failures must be silent
- No user-facing error messages

## Done When

- Valid Mermaid code produces SVG
- Invalid code produces no visible output
- Page behavior is unaffected
