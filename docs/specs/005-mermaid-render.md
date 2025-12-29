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
- Use legacy MathML to avoid KaTeX warnings on pages without doctype
- Suppress only the KaTeX quirks-mode warning from Mermaid in the content script
  <<<<<<< ours
  <<<<<<< ours
- Trim trailing non-Mermaid lines from unfenced selections using lightweight heuristics
  <<<<<<< ours
- Drop stray fence markers (```), when present at the end of unfenced selections
  <<<<<<< ours
- When Mermaid render fails, prefer Mermaid's default error rendering inside the popup container
  <<<<<<< ours
- If Mermaid inserts a syntax error SVG into the page body, relocate it into the popup container
  <<<<<<< ours
- # If Mermaid returns an empty SVG or error SVG, treat it as a render failure and show it in the popup
  > > > > > > > # theirs
  > > > > > > >
  > > > > > > > # theirs
  > > > > > > >
  > > > > > > > # theirs
  > > > > > > >
  > > > > > > > # theirs
  > > > > > > >
  > > > > > > > # theirs
  > > > > > > >
  > > > > > > > theirs

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
