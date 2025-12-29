# Spec: Lint TSConfig

## ID

011-lint-tsconfig

## Goal

Provide a dedicated tsconfig for type-aware linting so oxlint
can resolve source files reliably.

## In Scope

- Add `tsconfig.lint.json` with explicit include globs
- Update the lint script to use that config

## Out of Scope

- Compiler option changes unrelated to linting
- Build configuration changes

## Done When

- `pnpm lint` runs without "no files specified in config"
