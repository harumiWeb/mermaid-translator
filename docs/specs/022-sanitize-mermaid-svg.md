# Spec: Sanitize Mermaid SVG Output

## ID

022-sanitize-mermaid-svg

## Goal

Sanitize Mermaid-rendered SVG before inserting it into the DOM to reduce
XSS risk from user-provided Mermaid source.

## In Scope

- Apply DOMPurify sanitization to the rendered SVG string
- Use a strict SVG-safe configuration (no scripts, no event handlers)
- Insert only sanitized SVG into the popup container

## Out of Scope

- Changing Mermaid rendering behavior
- Changing UI behavior or popup layout
- Adding new UI warnings or prompts

## Behavior

- Sanitize the SVG string returned by Mermaid render
- If sanitization fails, treat it as a render failure
- Fail silently and show the existing short error message

## Done When

- Sanitized SVG is used for DOM insertion
- No raw, unsanitized SVG is inserted into the DOM
- Rendering failures remain silent to users
