# Spec: Popup Loading Indicator

## ID

024-loading-indicator

## Goal

Show a lightweight loading indicator while Mermaid rendering is in progress
to reduce perceived latency without changing core UX behavior.

## In Scope

- Display a small spinner in the popup during Mermaid render
- Hide the spinner on success or failure
- Keep styles minimal and contained in Shadow DOM

## Out of Scope

- Global loading overlays or blocking UI
- Progress percentages or detailed status

## Behavior

- Spinner appears only while render is running
- Spinner does not block interaction with the page
- Existing error message behavior remains unchanged

## Done When

- Spinner is visible during render and hidden afterward
- Spinner does not affect host page styles
- No new UI appears outside the popup
