# Spec: Lint Cleanup

## ID

014-lint-cleanup

## Goal

Resolve current lint errors without changing runtime behavior.

## In Scope

- Ensure placeholder files are non-empty modules
- Replace `import()` type annotations with type-only imports
- Add required braces for control flow to satisfy lint rules

## Out of Scope

- Behavioral changes to detection or UI logic
- Adding new features

## Done When

- `pnpm lint` reports no errors for these items
