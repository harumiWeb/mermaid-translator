# Spec: Copy Mermaid Code Button

## ID

017-copy-mermaid-code

## Goal

Allow users to copy the Mermaid code from the popup in both View and Editor
tabs during edit mode.

## In Scope

- Add a copy button in the top-right of the popup content area
- Show the button in edit mode for both View and Editor tabs
- Use the icon at `public/icons/copy.svg`
- Copy the current Mermaid source to the clipboard

## Out of Scope

- Background scripts
- Clipboard permission prompts or fallbacks
- Toast notifications or persistent messages

## Behavior

- Button is available only when Mermaid source exists
- In View, it copies the latest rendered source
- In Editor, it copies the current editor text
- Errors are silent and do not affect page interaction

## Done When

- Copy button appears in the top-right during edit mode
- Clicking copies Mermaid code for both tabs
