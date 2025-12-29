# Spec: Split Type-Aware Lint

## ID

012-lint-split

## Goal

Avoid pnpm glob issues by separating oxlint and tsgolint in scripts.

## In Scope

- Update `lint` script to run `oxlint` without `--type-aware`
- Add a `lint:types` script that runs `tsgolint` with a tsconfig
- Keep behavior fully local (no network)

## Out of Scope

- Changing lint rules
- Removing existing lint tools

## Done When

- `pnpm lint` runs without tsgolint glob errors
- `pnpm lint:types` runs type-aware checks
