# Spec: Vite Env Type Declarations

## ID

013-vite-env-types

## Goal

Provide type declarations for `import.meta.env` to satisfy type-aware linting.

## In Scope

- Add `src/vite-env.d.ts` with Vite env typings
- Include custom `VITE_ENABLE_LOGGING` type

## Out of Scope

- Runtime behavior changes

## Done When

- Type-aware linting does not flag `import.meta.env` as `any`
