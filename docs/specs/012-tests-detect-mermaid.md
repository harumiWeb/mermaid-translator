# Spec: detectMermaid Tests

## ID

012-tests-detect-mermaid

## Goal

Add unit tests for `src/shared/detectMermaid.ts` to prevent regressions.

## In Scope

- `isMermaidLike` keyword detection
- `extractMermaidCode` fenced block extraction
- `extractMermaidCode` fallback extraction when no fenced block exists

## Out of Scope

- DOM behavior
- Content script UI behavior

## Done When

- Tests pass in Vitest
- No DOM or browser APIs are used
