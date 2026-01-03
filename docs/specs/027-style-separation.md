# Spec: Shadow DOM Style Separation

## ID

027-style-separation

## Goal

Move static popup UI styles out of inline style attributes and into CSS
injected into the Shadow DOM, while preserving current look and behavior.

---

## In Scope

- Provide a dedicated CSS module (string) for content UI styling.
- Inject styles once into the Shadow Root used by the content script.
- Replace inline styles with class-based styles for:
  - popup DOM nodes
  - action button and tooltips
  - edit mode tabs and editor textarea
  - diagram controls (copy, zoom, tooltips)
  - split editor popup
- Keep dynamic layout styles inline (position, size, transform, display toggles).
- Apply light/dark theme via CSS variables and a theme attribute or class
  on the popup roots.
- Spinner animation and tooltip transitions remain inside shadow styles.

---

## Out of Scope

- Visual redesign or layout changes
- New animations or motion
- Behavior changes or new UI features

---

## Behavior

- UI appearance and interactions remain unchanged.
- Styles are isolated to Shadow DOM only.
- Style injection failures must not throw.

---

## Done When

- Inline styles removed except for dynamic values.
- Shadow DOM contains a single injected style block for the UI.
- Theme switching uses CSS variables plus a theme attribute/class.
- Existing UI behavior remains intact.
