# CODING_GUIDELINES.md

## Purpose

This document defines **strict coding conventions** for this project so that
AI agents (Codex) and human contributors produce code that is:

- predictable
- reviewable
- easy to reason about
- safe to run inside arbitrary web pages

These rules are intentionally conservative.

---

## General Principles

### 1. Prefer boring code

- Explicit is better than clever
- Readability > terseness
- One obvious way to do things

### 2. Avoid premature abstraction

- Do NOT introduce:
  - generic helpers
  - factories
  - class hierarchies
- Abstract only when duplication is proven and reviewed

### 3. One responsibility per file

- Files should have a single, clear purpose
- If you struggle to name a file, it is doing too much

---

## TypeScript Rules

### Strict typing

- All files MUST be `.ts` or `.tsx`
- `any` is forbidden
- Prefer:
  - explicit return types
  - narrow union types
  - readonly where applicable

```ts
function isMermaidLike(text: string): boolean {
  // good
}
```

### Null / undefined handling

- Never assume DOM APIs return values
- Guard early and return

```ts
const selection = window.getSelection();
if (!selection) return;
```

---

## Preact Usage Rules

### Scope of Preact

- Preact is used ONLY for UI rendering
- Business logic MUST NOT live in components
- No global state
- No context API unless explicitly approved

### Component rules

- Components MUST be:
  - small
  - stateless where possible
  - easily removable

```tsx
export function ActionButton(props: Props) {
  // UI only
}
```

### Hooks

- Allowed:
  - `useState`
  - `useEffect`
- Forbidden unless approved:
  - custom hooks
  - complex lifecycle logic

---

## DOM Interaction Rules

### Where DOM access is allowed

- ONLY inside `src/content/`
- NEVER inside `src/shared/`

### Mutation rules

- Do NOT modify host page DOM except:
  - inserting extension root element
- Do NOT:
  - remove nodes
  - rewrite styles
  - intercept events globally

---

## Shadow DOM Rules

- All UI MUST live inside Shadow DOM
- Never rely on host page CSS
- Never leak styles outside

```ts
host.attachShadow({ mode: "open" });
```

---

## Styling Rules

- Keep styles minimal
- No CSS frameworks
- Prefer:
  - inline styles
  - scoped CSS inside shadow root
- No animations unless explicitly requested

---

## Error Handling

### Philosophy

- Errors must not be visible to users
- Failure must be silent

### Rules

- Wrap risky code in `try/catch`
- Never throw from content script
- Console logging:
  - allowed only in development
  - must be removable

---

## Performance Rules

- No polling
- No mutation observers unless explicitly approved
- No timers running continuously
- All logic must be event-driven

---

## Lint / Format

- Code MUST pass:
  - oxlint
  - oxfmt
- Do not disable rules without explanation

---

## Forbidden Patterns

- React imports
- Background scripts
- chrome.storage usage (except chrome.storage.local when explicitly specified)
- Network requests
- Analytics / telemetry
- Auto-rendering without user action

---

## Review Checklist

Before committing, ensure:

- [ ] No assumptions about page structure
- [ ] No unnecessary abstractions
- [ ] UI logic separated from detection logic
- [ ] Errors handled silently
- [ ] Code is readable without comments

---

## Final Note

If a change increases complexity, it must justify itself.
Minimalism is a feature, not a limitation.
