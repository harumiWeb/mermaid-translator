# Spec: Split Editor Window

## ID

026-split-editor-window

## Goal

Allow users to split the editor into a separate popup window
while keeping the view in the main popup for better UX.

## In Scope

- Add a split button to the left of the existing copy button in edit mode
- Use `public/icons/split-window.svg` as the button icon
- Split editor into a separate popup within the same page
- Editor popup supports drag and resize
- Editor popup can be closed to merge back into the main popup

## Out of Scope

- New browser windows or tabs
- Split in the initial (non-edit) popup
- Persistent layout across sessions

## Behavior

- Split is available only in edit mode
- On split:
  - Main popup keeps all UI except the editor panel
  - Editor panel appears in a separate popup
  - New popup is positioned near the original editor panel and nudged
    to stay within the viewport
- Closing the editor popup merges the editor back into the main popup
- Closing the main popup closes the editor popup if it is open

## Done When

- Split button appears only in edit mode and uses the specified icon
- Editor popup opens and closes according to the behavior above
- Drag/resize works on the editor popup
