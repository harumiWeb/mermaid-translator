# Testing Guidelines

You are contributing tests to this project.

Before writing any test, you MUST read and follow the Testing Policy.

## Global Rules (MANDATORY)

- DO NOT introduce jsdom or any DOM-mocking libraries
- DO NOT simulate browser APIs in unit tests
- DO NOT test UI behavior with Vitest
- DO NOT add snapshot or visual-diff tests
- DO NOT modify existing tests unless explicitly instructed

---

## 1. Unit Tests (Vitest)

Use Vitest ONLY for pure, deterministic logic.

Allowed:

- parsing
- data transformation
- configuration resolution
- validation logic
- pure helper utilities

Forbidden:

- DOM access
- `window`, `document`, `navigator`
- jsdom or browser mocks
- content script behavior

If the target code requires browser APIs, DO NOT write a unit test.

---

## 2. UI / E2E Tests (Playwright)

Use Playwright ONLY when explicitly instructed to write E2E tests.

Constraints:

- Chromium only
- Real browser execution (no mocks)
- Focus on smoke tests and regression detection

Allowed assertions:

- extension loads without error
- content script executes
- critical UI actions work (render, copy, zoom, toggle)
- no console errors

Forbidden:

- pixel comparison
- layout assertions
- snapshot testing
- testing visual appearance

---

## 3. Content Scripts

- Content scripts MUST NOT be unit-tested
- Behavior is validated ONLY via Playwright E2E tests
- Tests should verify outcomes, not implementation details

---

## 4. Test Design Principles

- Tests MUST be:
  - minimal
  - deterministic
  - low-maintenance
- Prefer:
  - existence checks
  - error absence checks
  - behavioral smoke tests
- Avoid:
  - brittle selectors
  - deep DOM traversal

---

## 5. Before Writing Code

Before generating any test code, respond with:

1. Test type (Unit / E2E)
2. Why this test is necessary
3. What regression it prevents
4. Why this cannot be covered by existing tests

Only after this analysis, generate the test code.

---

## 6. Output Requirements

- Output ONLY the test code
- Do NOT include explanations unless requested
- Use existing test structure and conventions
- Use TypeScript unless explicitly told otherwise
