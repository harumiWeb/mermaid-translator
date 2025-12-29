# Spec: Theme Selection

## ID

011-theme-selection

## Goal

Support dark mode-aware Mermaid themes and allow the user to select a theme
from the popup UI.

## In Scope

- Determine system color scheme using `prefers-color-scheme`
- Default theme is `default` for light and `dark` for dark
- Provide a theme dropdown in the popup action bar (left of the close button)
- Persist theme preference in `localStorage`
- When a preference is set, it overrides system theme
- Apply the selected theme to Mermaid rendering

## Out of Scope

- Sync storage
- Background scripts
- Complex theming beyond Mermaid themes

## Behavior

- Theme preference values: `system`, `default`, `dark`, `forest`, `neutral`, `base`
- `system` resolves to `default` or `dark` based on `prefers-color-scheme`
- Changing the dropdown updates the preference and re-renders the current popup

## Error Handling

- Fail silently if localStorage is unavailable
- Rendering still works with default theme on any failure

## Done When

- Theme preference persists across page reloads
- Mermaid rendering uses the resolved theme
- Popup dropdown reflects the current preference
