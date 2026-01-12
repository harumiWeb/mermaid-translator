# Spec: Toolbar Settings Popup

## ID

034-toolbar-settings-popup

## Goal

Provide a toolbar action popup where users can configure:

- UI theme (light/dark/system)
- Mermaid diagram theme
- Open popup in edit mode by default

## In Scope

- Add an extension action popup UI
- Settings are stored in `chrome.storage.local`
- Content script reads settings and applies them
- Content script listens for settings changes from the popup

## Out of Scope

- Background/service worker
- Sync storage
- Server-side or remote settings
- Cross-device syncing

## Behavior

- Popup UI is opened by clicking the toolbar icon
- Settings default to existing values when available; otherwise use system defaults
- When "open in edit mode by default" is enabled:
  - action button click opens the popup directly in edit mode
- Theme changes update the content script UI on next open
- Failures are silent and do not affect page interaction

## Done When

- Toolbar popup appears and can update the three settings
- Settings persist in `chrome.storage.local`
- Content script applies saved settings for theme and edit-mode default
