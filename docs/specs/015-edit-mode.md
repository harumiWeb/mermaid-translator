# Spec: Edit Mode Popup

## ID

015-edit-mode

## Goal

Allow users to open an edit mode from the popup toolbar to adjust Mermaid code
and preview changes without leaving the page.

## In Scope

- Add an Edit button in the popup toolbar, placed to the right of the "open in new tab" button
- Use the icon asset at `public/icons/edit.svg`
- Edit mode may open in a larger, modal-like popup presentation
- Edit-mode panel can be dragged by its header area
- Edit-mode panel can be resized from a corner handle
- Provide two tabs below the toolbar: `View` and `Editor`
- Seed the editor with the latest Mermaid source used for rendering
- Switching to `View` re-renders using the current editor text
- Theme selection applies to edit-mode rendering
- Export actions use the latest rendered output from `View`
- Closing the popup exits edit mode and discards edits

## Out of Scope

- Full-page overlays or scroll locking
- Persistent storage or autosave
- Syntax validation, linting, or formatting
- Keyboard shortcuts
- Multi-document or multi-tab editing

## Behavior

- The Edit button is disabled until a render succeeds and Mermaid source is available
- Default tab is `View`
- `Editor` shows a plain text area for Mermaid source
- `View` shows the rendered output or a short error message on failure
- Errors do not throw and do not affect page interaction
- Edit mode is dismissed by the same conditions as the popup lifecycle

## Done When

- Edit button appears in the toolbar with the provided icon
- Clicking Edit opens the tabbed view/editor UI inside the popup
- Switching to `View` reflects the current editor content
- Errors are silent and contained within the popup
