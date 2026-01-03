# Spec: Split Popup Frontmost Focus

## ID

028-popup-front-focus

## Goal

When the editor is split into a separate popup, clicking either popup
brings that popup to the front and moves focus to it.

---

## In Scope

- Apply frontmost behavior only while split mode is active.
- Any click inside a popup should raise it above the other popup.
- Frontmost is implemented by z-index switching between the two popups.
- Focus should move to the clicked popup root.

---

## Out of Scope

- Changes to popup layout or appearance
- Global focus management outside the popup roots
- Keyboard shortcuts

---

## Behavior

- Clicking the main popup brings it to the front and focuses it.
- Clicking the editor popup brings it to the front and focuses it.
- When split mode opens, the editor popup becomes the frontmost popup.

---

## Done When

- Split mode allows toggling frontmost popup via click.
- Focus follows the frontmost popup.
- No changes to host page styles or interactions.
