# AGENTS.md

## Overview

This repository is a Chrome Extension (Manifest V3) project that renders Mermaid diagrams
from user-selected text on arbitrary web pages.

Development is intentionally driven by AI agents (e.g. Codex),
with strict constraints to preserve architectural simplicity, UX philosophy,
and long-term maintainability.

Agents must follow the rules below.

---

## Core Philosophy (DO NOT VIOLATE)

### 1. User-driven, not DOM-driven

- NEVER auto-scan or mutate the page DOM
- UI is triggered ONLY by:
  - user text selection
  - explicit user interaction (button click)

### 2. No site / tag / framework assumptions

- Do NOT rely on:
  - `<pre>`, `<code>`, Markdown structure
  - specific domains or services
- The extension must work on **any webpage**.

### 3. Lightweight by default

- Avoid heavy frameworks or abstractions
- No React, no Redux, no global state libraries
- Preact is allowed ONLY for UI rendering

### 4. Fail silently, never aggressively

- False positives are acceptable
- UX must not be intrusive
- If detection or rendering fails:
  - do nothing
  - never throw uncaught errors
  - never block page interaction

---

## Tech Stack (Fixed)

Agents MUST NOT introduce alternatives.

- Language: TypeScript
- Bundler: Vite
- Chrome Extension: Manifest V3
- UI: Preact (JSX)
- Lint / Format: oxlint, oxfmt
- Runtime environment: content script + extension action popup (no server, no backend)

---

## Project Structure Rules

```txt
src/
├─ content/ # content script logic & UI
│ ├─ main.tsx # entry point
│ ├─ ui.tsx # Preact components
│ └─ style.css
├─ shared/ # pure logic (no DOM access)
│ └─ detectMermaid.ts
```

### Rules

- `content/` may access DOM and browser APIs
- `shared/` MUST be:
  - pure
  - side-effect free
  - DOM-independent
- No circular dependencies

---

## UI Design Constraints

### Rendering

- UI MUST be mounted inside a Shadow DOM
- NEVER inject global CSS
- NEVER modify host page styles

### Interaction

- UI appears only near the text selection
- No keyboard hijacking
- No scroll blocking
- No modal overlays that lock the page

### Styling

- Minimal, functional
- No animations unless explicitly requested
- Prefer inline styles or scoped CSS only

---

## Mermaid Detection Rules

- Detection is heuristic-based
- Regex / keyword matching only
- No full parsing at detection stage

Allowed keywords include (but are not limited to):

- graph
- flowchart
- sequenceDiagram
- classDiagram
- stateDiagram
- erDiagram
- gantt
- pie
- mindmap
- timeline

Detection MUST:

- be fast
- tolerate malformed input
- never throw

---

## Mermaid Rendering Rules

- Rendering is triggered ONLY by user click
- Rendering failures must be handled gracefully
- Initial implementation may:
  - show raw text
  - defer actual Mermaid rendering

Agents MUST NOT:

- auto-render on selection
- preload heavy rendering engines unnecessarily

---

## Extension Scope Control

Agents MUST NOT implement unless explicitly instructed:

- background scripts
- sync storage
- analytics
- telemetry
- remote APIs
- cloud rendering

This project is **fully local**.

### Explicitly Allowed (when specified by spec)

- extension action popup UI
- chrome.storage.local
- extension messaging (popup/content script)

---

## Error Handling Policy

- No uncaught exceptions
- All errors must be:
  - logged in dev mode only
  - swallowed in production
- Never display stack traces to users

---

## Incremental Development Policy

Agents should:

1. Prefer small, reviewable commits
2. Avoid speculative abstractions
3. Implement the minimum viable behavior
4. Leave TODO comments when intentionally incomplete

---

## What Agents SHOULD Optimize For

- Clarity over cleverness
- Explicitness over abstraction
- Debuggability over conciseness
- Human readability over AI convenience

---

## What Agents MUST NOT Do

- Introduce frameworks without approval
- Rewrite existing working code unnecessarily
- Change UX behavior without explanation
- Add features “because they are easy”

---

## Review Checklist (Self-check for Agents)

Before proposing changes, verify:

- [ ] Does this respect user-driven UX?
- [ ] Does this avoid DOM assumptions?
- [ ] Is this the lightest possible solution?
- [ ] Can a human understand this in 6 months?
- [ ] Does failure result in silence, not breakage?

If any answer is "no", revise.

---

## Mandatory Documentation Review

Before making ANY code changes, agents MUST read and internalize
the following documents, in this order:

1. AGENTS.md
2. docs/ARCHITECTURE.md
3. docs/CODING_GUIDELINES.md

These documents define non-negotiable constraints.

### Rules

- Agents MUST assume these documents are authoritative
- If a proposed change conflicts with any document:
  - the change MUST NOT be implemented
  - the conflict MUST be explicitly reported instead
- All code MUST pass oxlint without disabling rules.
- Rule suppression requires explicit justification.

### Forbidden Behavior

- Implementing features based solely on assumptions
- “Fixing” behavior without understanding architectural intent
- Introducing changes that violate documented non-goals

Failure to follow these rules is considered a design error,
not an implementation detail.

---

## Spec-to-Task Workflow (Required)

All implementation work MUST follow the Spec-driven workflow below.

### Source of Truth

- Functional requirements are defined ONLY in:
  - `docs/specs/`

Agents MUST NOT implement features directly from intuition, conversation context,
or partially remembered requirements.

### Task Definition

Before starting implementation, agents MUST:

1. Read the relevant specification file(s) under `docs/specs/`
2. Derive concrete, implementation-level tasks from those specs
3. Document those tasks in:
   - `docs/tasks.md`

Each task MUST:

- Reference one or more spec IDs (e.g. `002-action-button-ui`)
- Be small enough to implement in a single focused change
- Describe _what to implement_, not _how to implement it_

### Implementation Rule

- Agents MUST NOT start coding until the corresponding tasks are written
  and recorded in `docs/tasks.md`
- Code changes MUST map clearly to one or more tasks
- If a task cannot be derived cleanly from existing specs:
  - STOP
  - Propose a new or revised spec instead of guessing

### Prohibited Behavior

- Implementing code without a corresponding task
- Creating tasks that introduce behavior not described in specs
- Expanding scope while defining tasks

This project treats:

- `docs/specs/` as **intent**
- `docs/tasks.md` as **execution plan**

Skipping this step is considered a process violation.

---

## Testing Policy

### 1. Unit Tests (Vitest)

- Vitest is used **ONLY** for pure, DOM-independent logic
- Tests MUST NOT rely on jsdom, browser APIs, or mocked DOM environments
- Unit tests should target:
  - parsing logic
  - transformation pipelines
  - configuration resolution
  - pure utility functions
- Introducing jsdom-based tests is **explicitly forbidden**

### 2. UI / Integration / E2E Tests (Playwright)

- Browser-level behavior is validated using **Playwright (Chromium only)**
- Playwright tests are intended for **smoke testing and regression detection**, not exhaustive UI validation
- Allowed validation scope:
  - extension loading without errors
  - content script execution on real pages
  - critical UI interactions (e.g. render, copy, zoom)
  - absence of console errors
- Tests MUST run against a **real browser environment**
  - No mocked DOM
  - No simulated browser APIs

### 3. Scope Control

- UI/E2E tests MUST:
  - avoid pixel-level or layout assertions
  - avoid snapshot testing unless explicitly justified
  - focus on "does it work" rather than "does it look perfect"
- Content script behavior SHOULD NOT be unit-tested
  - Behavior is validated only through Playwright E2E tests

### 4. Test Addition Policy

- Adding new Playwright tests is allowed **ONLY** when:
  - introducing user-visible behavior
  - fixing regressions
  - validating Chrome Web Store submission safety
- Large-scale UI test expansion requires explicit maintainer approval

### 5. CI / Execution Policy

- Playwright tests MAY be executed locally
- CI execution is optional and SHOULD be discussed before introduction
- Unit tests MUST remain fast and deterministic

### 6. Design Philosophy

- This project prioritizes:
  - correctness of core logic
  - long-term maintainability
  - low test maintenance cost
- Tests that increase maintenance burden without clear regression value are discouraged

---

## Final Note

This project values **restraint**.

A feature not implemented correctly is worse than a feature not implemented at all.
