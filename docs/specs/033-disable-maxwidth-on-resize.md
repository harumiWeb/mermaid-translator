# Spec: Disable Max Width on User Resize

## ID

033-disable-maxwidth-on-resize

## Goal

When the user manually resizes the main popup, remove the max width constraint
so the width can expand beyond the initial limit.

## In Scope

- Disable `max-width` on the main popup once a user-initiated resize starts
- Applies to the initial (non-edit) popup

## Out of Scope

- Persisting the width across sessions
- Changing the default max width on first render
- Modifying edit-mode or split-editor constraints

## Behavior

- Default max width remains active until the user resizes
- On the first resize interaction, max width is removed
- Max width remains disabled until the popup is dismissed
- Failures are silent and do not affect page interaction

## Done When

- Main popup can exceed its default max width after user resize
- New popup instances start with the default max width again
