# Changelog

## v1.1.0 - 2024-01-13

### New Features

- Popups and split editor windows can be resized from any edge or corner, with matching resize cursors.
- The initial popup can be moved by dragging its header, without affecting existing behaviors.
- The popup arrow is hidden after moving or resizing and stays hidden until the popup is closed.
- Max-width constraints are lifted when starting to resize the initial popup.
- Added a toolbar settings popup to configure UI theme, Mermaid theme, and edit-mode initialization (persisted locally).

### Documentation

- Added formal specifications for edge resize, popup drag/resize, arrow hiding on move, max-width disable on resize, and toolbar settings popup behavior.

## v1.0.2 - 2024-01-03

### New Features

- Split-mode popups now support frontmost focus: clicking a popup brings it to the front and focuses it. The editor popup is initialized as frontmost when split mode opens.
- Popups consistently transfer focus to the clicked/frontmost popup during interactions and mode transitions.

### Documentation

- Added a formal specification describing split popup frontmost focus behavior and completion criteria.

## v1.0.1

### Security

- Strengthened DOMPurify sanitization for Mermaid SVG output to reduce XSS risk.

### Changes

- Inserted sanitized SVG as DOM nodes instead of using `innerHTML`.
- Adjusted allowed tags/attributes to preserve SVG/HTML label rendering.

### Notes

- No changes to user flow or UI behavior.

## v1.0.0 - 2023-12-30

Initial release of Mermaid Translator.

### Highlights

- Render Mermaid diagrams from selected text on any web page.
- Edit mode with View/Editor tabs to tweak code and preview changes.
- Export rendered diagrams (SVG/PNG) and open SVG in a new tab.
- Pan and zoom controls for easier inspection.
- Theme selection (system/light/dark and Mermaid themes).

### Privacy

- No external network requests.
- No data collection.
- All processing happens locally.
