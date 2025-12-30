# Spec: Playwright E2E Smoke Tests

## ID

021-playwright-e2e-smoke

## Goal

Add minimal Playwright E2E smoke tests that validate the user-driven
selection flow without relying on DOM assumptions or visual assertions.

## In Scope

- Load the extension in Chromium and open `tests/fixtures/mermaid.html`
- Verify the action button appears only when Mermaid-like text is selected
- Verify clicking the action button opens the popup UI
- Verify the popup does not open until the action button is clicked
- Verify the popup is dismissed on outside click or selection change
- Confirm a diagram render attempt completes without uncaught errors

## Out of Scope

- Pixel/layout assertions or snapshot tests
- Deep DOM structure checks
- Testing non-critical UI controls (export, copy, zoom, edit)

## Behavior

- Tests use real selection and clicks (no mocked DOM/browser APIs)
- Assertions focus on presence/absence and enabled/disabled state
- Console errors or page errors fail the test

## Done When

- At least four E2E tests cover:
  - Mermaid-like selection shows the action button and opens the popup
  - Mermaid-like selection alone does not open the popup
  - Non-Mermaid selection does not show the action button
  - Popup dismisses on outside click or selection change
- No uncaught console or page errors occur during test execution
- Tests run in Chromium only and avoid visual assertions
