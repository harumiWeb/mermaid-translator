# Spec: Split main.tsx for Maintainability

## ID

018-main-refactor-split

## Goal

Reduce the size and complexity of `src/content/main.tsx` by splitting
its responsibilities into focused modules while preserving behavior.

## In Scope

- Move selection handling into a dedicated module
- Move popup DOM creation/teardown into a dedicated module
- Move edit-mode state and tab handling into a dedicated module
- Move pan/zoom/copy UI logic into a dedicated module
- Move theme preference logic into a dedicated module
- Keep `main.tsx` as a thin entry point that wires modules together

## Out of Scope

- Behavioral changes
- Styling changes or CSS migration
- Shared logic changes in `src/shared/`
- New features

## Behavior

- All existing behavior remains unchanged
- Error handling remains silent as-is
- No changes to Shadow DOM usage or popup UX constraints

## Done When

- `main.tsx` size is significantly reduced
- Responsibilities are clearly separated by file
- Build output and runtime behavior match current functionality
