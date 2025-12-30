# ARCHITECTURE.md

## Why This Extension Exists

Mermaid diagrams are increasingly common across the web, but they are often
presented as raw text:

- documentation pages
- blog posts
- GitHub issues
- internal tools
- legacy systems

This extension exists to help **readers**, not authors.

---

## Core UX Decision: User-Driven Interaction

### Key choice

> The extension reacts to **user intent**, not page structure.

### Why?

- DOM-based detection is fragile
- Websites vary wildly in structure
- Users already know when something "looks like Mermaid"

### Result

- No DOM scanning
- No assumptions
- No site-specific hacks

---

## Selection-Based Trigger Model

### Flow

1. User selects text
2. Extension inspects selected text only
3. If text looks like Mermaid:
   - show a small action button near cursor
4. Nothing happens unless the user clicks

### Benefits

- Zero false-positive impact
- No intrusive UI
- No performance penalty

This mirrors proven UX patterns (e.g. translation tools).

---

## Why Not Auto-Render?

Auto-rendering Mermaid diagrams introduces serious problems:

- performance degradation
- accidental UI noise
- broken layouts
- incorrect assumptions

This project explicitly avoids those risks.

---

## Domain / Tag Independence

### Intentional constraint

The extension must work on:

- any domain
- any framework
- any HTML structure

### Why?

- Internal company tools
- Old CMS systems
- SPAs
- Static HTML

DOM-independence is not a convenience — it is the core value.

---

## Rendering as a Secondary Concern

Mermaid rendering is intentionally delayed:

- detection is lightweight
- rendering happens only on click
- heavy libraries are loaded only when needed

This keeps the extension:

- fast
- safe
- unobtrusive

---

## Architectural Layers

```
User
 ↓
Text Selection
 ↓
Detection (pure, heuristic)
 ↓
UI Hint (button)
 ↓
User Click
 ↓
Rendering (optional / deferred)
```

Each layer can fail independently without breaking the others.

---

## Shadow DOM Isolation

All UI lives in Shadow DOM to ensure:

- no CSS conflicts
- no layout breakage
- no dependency on host styles

The host page must remain untouched.

---

## Non-Goals (Explicit)

This project is NOT trying to:

- be a Mermaid editor
- provide a full-fledged authoring environment
- replace Mermaid Live
- parse Mermaid formally
- validate Mermaid syntax
- integrate with cloud services

Note: The popup may offer a lightweight, in-place edit mode
to adjust Mermaid source and preview changes, but it is not a
dedicated editor product.

Saying "no" is part of the architecture.

---

## Long-Term Vision

If this extension succeeds, it should be:

- forgettable when not needed
- instantly useful when it is
- trusted not to interfere

The best compliment:

> “I forgot it was installed — until I needed it.”

---

## Architectural Rule of Thumb

If a feature:

- reduces user control
- assumes page structure
- increases background activity

…it probably does not belong here.

---

## Final Thought

This architecture prioritizes **respect**:

- respect for the user
- respect for the page
- respect for future maintainers

Simplicity is not a shortcut.
It is the design.
