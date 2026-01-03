# Spec: Render Cache Optimization

## ID

023-render-cache

## Goal

Avoid redundant Mermaid rendering when source and theme have not changed
to reduce render latency on heavy pages.

## In Scope

- Track last rendered Mermaid source and theme
- Skip Mermaid `render()` if both source and theme are unchanged
- Reuse the existing SVG in the popup without re-rendering

## Out of Scope

- Caching across sessions
- Multi-entry cache or LRU
- Background processing or workers

## Behavior

- Rendering is performed only when the source or theme differs from the last render
- When skipped, the popup content remains unchanged
- Failures remain silent and show the existing short error message

## Done When

- Repeated toggles (e.g., View/Editor) do not trigger render when source/theme is unchanged
- Performance logs show reduced render calls on repeated actions
