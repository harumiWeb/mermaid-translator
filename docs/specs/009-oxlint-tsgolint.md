# Spec: OXlint Type-Aware Dependency

## ID

009-oxlint-tsgolint

## Goal

Ensure the lint task runs with type-aware checks by installing the
required dependency.

## In Scope

- Add `oxlint-tsgolint` to devDependencies

## Out of Scope

- Lint rule changes
- CI pipeline changes

## Done When

- `pnpm lint` runs without missing executable errors
